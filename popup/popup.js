// ShieldBlock Popup Logic

document.addEventListener('DOMContentLoaded', async () => {
  const globalToggle = document.getElementById('globalToggle');
  const domainNameEl = document.getElementById('domainName');
  const whitelistBtn = document.getElementById('whitelistBtn');
  const whitelistBtnText = document.getElementById('whitelistBtnText');
  const whitelistBtnIcon = document.getElementById('whitelistBtnIcon');
  const siteBlockedCountEl = document.getElementById('siteBlockedCount');
  const totalBlockedCountEl = document.getElementById('totalBlockedCount');
  const customDomainInput = document.getElementById('customDomainInput');
  const addDomainBtn = document.getElementById('addDomainBtn');
  const quickAddFeedback = document.getElementById('quickAddFeedback');
  const optionsBtn = document.getElementById('optionsBtn');
  const reloadTabBtn = document.getElementById('reloadTabBtn');

  let currentDomain = '';

  // Get active tab
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Query state from service worker
  async function refreshUI() {
    const status = await sendMessage({
      type: 'GET_STATUS',
      tabId: activeTab ? activeTab.id : null
    });

    if (!status || !status.success) return;

    globalToggle.checked = status.enabled;
    currentDomain = status.domain;

    if (currentDomain) {
      domainNameEl.textContent = currentDomain;
      whitelistBtn.disabled = !status.enabled;

      if (status.isWhitelisted) {
        whitelistBtn.classList.add('active');
        whitelistBtnText.textContent = 'Resume Blocking on Site';
        whitelistBtnIcon.textContent = '▶️';
      } else {
        whitelistBtn.classList.remove('active');
        whitelistBtnText.textContent = 'Pause on this site';
        whitelistBtnIcon.textContent = '⏸';
      }
    } else {
      domainNameEl.textContent = 'Special Page';
      whitelistBtn.disabled = true;
      whitelistBtnText.textContent = 'Cannot Pause Here';
    }

    siteBlockedCountEl.textContent = status.siteBlockedCount || 0;
    totalBlockedCountEl.textContent = status.totalBlockedCount || 0;
  }

  // Global Toggle handler
  globalToggle.addEventListener('change', async () => {
    const res = await sendMessage({ type: 'TOGGLE_GLOBAL' });
    if (res && res.success) {
      await refreshUI();
    }
  });

  // Whitelist/Pause site handler
  whitelistBtn.addEventListener('click', async () => {
    if (!currentDomain) return;
    const res = await sendMessage({
      type: 'TOGGLE_WHITELIST_DOMAIN',
      domain: currentDomain
    });
    if (res && res.success) {
      await refreshUI();
    }
  });

  // Quick Add Custom Block Domain
  addDomainBtn.addEventListener('click', async () => {
    const domain = customDomainInput.value.trim();
    if (!domain) {
      showFeedback('Please enter a domain', 'error');
      return;
    }

    const res = await sendMessage({
      type: 'ADD_CUSTOM_BLOCK_DOMAIN',
      domain
    });

    if (res && res.success) {
      customDomainInput.value = '';
      showFeedback(`Blocked ${domain}`, 'success');
      await refreshUI();
    } else {
      showFeedback(res?.error || 'Failed to add rule', 'error');
    }
  });

  // Open Options Page
  optionsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // Reload Active Tab
  reloadTabBtn.addEventListener('click', async () => {
    if (activeTab && activeTab.id) {
      await chrome.tabs.reload(activeTab.id);
      window.close();
    }
  });

  function showFeedback(msg, type) {
    quickAddFeedback.textContent = msg;
    quickAddFeedback.className = `feedback ${type}`;
    setTimeout(() => {
      quickAddFeedback.textContent = '';
      quickAddFeedback.className = 'feedback';
    }, 3000);
  }

  function sendMessage(msg) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(msg, (response) => {
        resolve(response);
      });
    });
  }

  await refreshUI();
});
