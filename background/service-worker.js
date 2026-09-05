// ShieldBlock Service Worker (Manifest V3)

// Default settings state
const DEFAULT_SETTINGS = {
  enabled: true,
  whitelistedDomains: [],
  customBlockDomains: [],
  enabledRulesets: ['ads_rules', 'privacy_rules', 'annoyances_rules'],
  totalBlockedCount: 0,
  siteBlockedCounts: {}
};

// Initialize state on installation or startup
chrome.runtime.onInstalled.addListener(async () => {
  const existing = await chrome.storage.local.get(['settings']);
  if (!existing.settings) {
    await chrome.storage.local.set({ settings: DEFAULT_SETTINGS });
  }
  await syncRulesWithStorage();
  await updateBadge();
});

chrome.runtime.onStartup.addListener(async () => {
  await syncRulesWithStorage();
  await updateBadge();
});

// Listen for tab updates to refresh badge count
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await updateBadgeForTab(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    await updateBadgeForTab(tabId);
  }
});

// Message listener for popup, options, and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      switch (message.type) {
        case 'GET_STATUS': {
          const tab = message.tabId 
            ? await getTabById(message.tabId)
            : (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
          
          const domain = tab && tab.url ? getDomainFromUrl(tab.url) : '';
          const { settings = DEFAULT_SETTINGS } = await chrome.storage.local.get('settings');
          const isWhitelisted = domain ? settings.whitelistedDomains.includes(domain) : false;
          const siteCount = domain ? (settings.siteBlockedCounts[domain] || 0) : 0;

          sendResponse({
            success: true,
            enabled: settings.enabled,
            domain,
            isWhitelisted,
            siteBlockedCount: siteCount,
            totalBlockedCount: settings.totalBlockedCount,
            enabledRulesets: settings.enabledRulesets,
            whitelistedDomains: settings.whitelistedDomains,
            customBlockDomains: settings.customBlockDomains
          });
          break;
        }

        case 'TOGGLE_GLOBAL': {
          const { settings = DEFAULT_SETTINGS } = await chrome.storage.local.get('settings');
          settings.enabled = !settings.enabled;
          await chrome.storage.local.set({ settings });
          await syncRulesWithStorage();
          await updateBadge();
          sendResponse({ success: true, enabled: settings.enabled });
          break;
        }

        case 'TOGGLE_WHITELIST_DOMAIN': {
          const { domain } = message;
          if (!domain) {
            sendResponse({ success: false, error: 'No domain provided' });
            return;
          }

          const { settings = DEFAULT_SETTINGS } = await chrome.storage.local.get('settings');
          const index = settings.whitelistedDomains.indexOf(domain);
          if (index > -1) {
            settings.whitelistedDomains.splice(index, 1);
          } else {
            settings.whitelistedDomains.push(domain);
          }

          await chrome.storage.local.set({ settings });
          await syncRulesWithStorage();
          await updateBadge();
          sendResponse({
            success: true,
            isWhitelisted: settings.whitelistedDomains.includes(domain)
          });
          break;
        }

        case 'ADD_CUSTOM_BLOCK_DOMAIN': {
          const { domain } = message;
          if (!domain) return sendResponse({ success: false, error: 'Empty domain' });
          const cleaned = domain.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
          
          const { settings = DEFAULT_SETTINGS } = await chrome.storage.local.get('settings');
          if (!settings.customBlockDomains.includes(cleaned)) {
            settings.customBlockDomains.push(cleaned);
            await chrome.storage.local.set({ settings });
            await syncRulesWithStorage();
          }
          sendResponse({ success: true, customBlockDomains: settings.customBlockDomains });
          break;
        }

        case 'REMOVE_CUSTOM_BLOCK_DOMAIN': {
          const { domain } = message;
          const { settings = DEFAULT_SETTINGS } = await chrome.storage.local.get('settings');
          settings.customBlockDomains = settings.customBlockDomains.filter(d => d !== domain);
          await chrome.storage.local.set({ settings });
          await syncRulesWithStorage();
          sendResponse({ success: true, customBlockDomains: settings.customBlockDomains });
          break;
        }

        case 'TOGGLE_RULESET': {
          const { rulesetId, enabled } = message;
          const { settings = DEFAULT_SETTINGS } = await chrome.storage.local.get('settings');
          if (enabled && !settings.enabledRulesets.includes(rulesetId)) {
            settings.enabledRulesets.push(rulesetId);
          } else if (!enabled) {
            settings.enabledRulesets = settings.enabledRulesets.filter(id => id !== rulesetId);
          }
          await chrome.storage.local.set({ settings });
          await syncRulesWithStorage();
          sendResponse({ success: true, enabledRulesets: settings.enabledRulesets });
          break;
        }

        case 'COSMETIC_BLOCKED': {
          // Content script reported hidden element count
          const count = message.count || 1;
          const senderTab = sender.tab;
          if (senderTab && senderTab.url) {
            const domain = getDomainFromUrl(senderTab.url);
            const { settings = DEFAULT_SETTINGS } = await chrome.storage.local.get('settings');
            if (settings.enabled && !settings.whitelistedDomains.includes(domain)) {
              settings.totalBlockedCount += count;
              settings.siteBlockedCounts[domain] = (settings.siteBlockedCounts[domain] || 0) + count;
              await chrome.storage.local.set({ settings });
              await updateBadgeForTab(senderTab.id);
            }
          }
          sendResponse({ success: true });
          break;
        }

        case 'IMPORT_SETTINGS': {
          const { newSettings } = message;
          if (newSettings && typeof newSettings === 'object') {
            await chrome.storage.local.set({ settings: newSettings });
            await syncRulesWithStorage();
            await updateBadge();
            sendResponse({ success: true });
          } else {
            sendResponse({ success: false, error: 'Invalid settings JSON format' });
          }
          break;
        }

        case 'RESET_STATS': {
          const { settings = DEFAULT_SETTINGS } = await chrome.storage.local.get('settings');
          settings.totalBlockedCount = 0;
          settings.siteBlockedCounts = {};
          await chrome.storage.local.set({ settings });
          await updateBadge();
          sendResponse({ success: true });
          break;
        }

        default:
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    } catch (err) {
      console.error('Error handling message in service worker:', err);
      sendResponse({ success: false, error: err.message });
    }
  })();
  return true; // keep channel open for async response
});

// Helper: Synchronize declarativeNetRequest dynamic & static rules with stored settings
async function syncRulesWithStorage() {
  const { settings = DEFAULT_SETTINGS } = await chrome.storage.local.get('settings');

  // 1. Static Rulesets update
  const allRulesets = ['ads_rules', 'privacy_rules', 'annoyances_rules'];
  const enableList = settings.enabled ? settings.enabledRulesets : [];
  const disableList = allRulesets.filter(id => !enableList.includes(id));

  await chrome.declarativeNetRequest.updateEnabledRulesets({
    enableRulesetIds: enableList,
    disableRulesetIds: disableList
  });

  // 2. Clear existing dynamic rules
  const existingDynamicRules = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existingDynamicRules.map(r => r.id);

  const addRules = [];
  let ruleIdCounter = 1;

  // If global blocking is active, apply custom blocks & domain whitelists
  if (settings.enabled) {
    // Whitelisted domains -> allowAllRequests (priority 1000)
    for (const domain of settings.whitelistedDomains) {
      if (domain) {
        addRules.push({
          id: ruleIdCounter++,
          priority: 1000,
          action: { type: 'allowAllRequests' },
          condition: {
            requestDomains: [domain]
          }
        });
      }
    }

    // Custom blocked domains -> block (priority 500)
    for (const domain of settings.customBlockDomains) {
      if (domain) {
        addRules.push({
          id: ruleIdCounter++,
          priority: 500,
          action: { type: 'block' },
          condition: {
            urlFilter: `||${domain}`,
            resourceTypes: ['main_frame', 'sub_frame', 'stylesheet', 'script', 'image', 'font', 'object', 'xmlhttprequest', 'ping', 'media', 'websocket', 'other']
          }
        });
      }
    }
  } else {
    // Globally disabled -> Allow all requests everywhere (priority 2000)
    addRules.push({
      id: ruleIdCounter++,
      priority: 2000,
      action: { type: 'allowAllRequests' },
      condition: {
        resourceTypes: ['main_frame', 'sub_frame', 'stylesheet', 'script', 'image', 'font', 'object', 'xmlhttprequest', 'ping', 'media', 'websocket', 'other']
      }
    });
  }

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds,
    addRules
  });
}

// Helper: Update Badge text & color
async function updateBadge() {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (activeTab) {
    await updateBadgeForTab(activeTab.id);
  }
}

async function updateBadgeForTab(tabId) {
  if (!tabId) return;
  try {
    const tab = await getTabById(tabId);
    if (!tab || !tab.url || tab.url.startsWith('chrome://')) {
      await chrome.action.setBadgeText({ tabId, text: '' });
      return;
    }

    const domain = getDomainFromUrl(tab.url);
    const { settings = DEFAULT_SETTINGS } = await chrome.storage.local.get('settings');

    if (!settings.enabled) {
      await chrome.action.setBadgeText({ tabId, text: 'OFF' });
      await chrome.action.setBadgeBackgroundColor({ tabId, color: '#6B7280' });
      return;
    }

    if (settings.whitelistedDomains.includes(domain)) {
      await chrome.action.setBadgeText({ tabId, text: 'PAUSE' });
      await chrome.action.setBadgeBackgroundColor({ tabId, color: '#F59E0B' });
      return;
    }

    const count = settings.siteBlockedCounts[domain] || 0;
    const text = count > 0 ? (count > 999 ? '999+' : String(count)) : 'ON';
    await chrome.action.setBadgeText({ tabId, text });
    await chrome.action.setBadgeBackgroundColor({ tabId, color: '#2563EB' });
  } catch (err) {
    // Ignore errors for closed/invalid tabs
  }
}

function getDomainFromUrl(urlStr) {
  try {
    const parsed = new URL(urlStr);
    return parsed.hostname;
  } catch {
    return '';
  }
}

async function getTabById(tabId) {
  try {
    return await chrome.tabs.get(tabId);
  } catch {
    return null;
  }
}
