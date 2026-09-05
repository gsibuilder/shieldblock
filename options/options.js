// ShieldBlock Options Page Logic

document.addEventListener('DOMContentLoaded', async () => {
  // Navigation Tabs
  const navButtons = document.querySelectorAll('.nav-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.getAttribute('data-tab');
      navButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(`tab-${tabName}`).classList.add('active');
    });
  });

  // UI Elements
  const whitelistContainer = document.getElementById('whitelistContainer');
  const newWhitelistInput = document.getElementById('newWhitelistInput');
  const addWhitelistBtn = document.getElementById('addWhitelistBtn');

  const blocklistContainer = document.getElementById('blocklistContainer');
  const newBlocklistInput = document.getElementById('newBlocklistInput');
  const addBlocklistBtn = document.getElementById('addBlocklistBtn');

  const statsTotal = document.getElementById('statsTotal');
  const statsSitesCount = document.getElementById('statsSitesCount');
  const resetStatsBtn = document.getElementById('resetStatsBtn');
  const exportSettingsBtn = document.getElementById('exportSettingsBtn');
  const importSettingsFile = document.getElementById('importSettingsFile');
  const backupFeedback = document.getElementById('backupFeedback');

  // Load and Render Status
  async function loadData() {
    const status = await sendMessage({ type: 'GET_STATUS' });
    if (!status || !status.success) return;

    // Ruleset Toggles
    ['ads_rules', 'privacy_rules', 'annoyances_rules'].forEach(id => {
      const toggle = document.getElementById(`toggle-${id}`);
      if (toggle) {
        toggle.checked = status.enabledRulesets.includes(id);
      }
    });

    // Whitelist Render
    renderList(whitelistContainer, status.whitelistedDomains, async (domain) => {
      await sendMessage({ type: 'TOGGLE_WHITELIST_DOMAIN', domain });
      await loadData();
    });

    // Custom Blocklist Render
    renderList(blocklistContainer, status.customBlockDomains, async (domain) => {
      await sendMessage({ type: 'REMOVE_CUSTOM_BLOCK_DOMAIN', domain });
      await loadData();
    });

    // Stats Render
    statsTotal.textContent = status.totalBlockedCount || 0;
    const trackedCount = Object.keys(status.whitelistedDomains || {}).length;
    statsSitesCount.textContent = status.whitelistedDomains ? status.whitelistedDomains.length : 0;
  }

  function renderList(container, list, onRemove) {
    container.innerHTML = '';
    if (!list || list.length === 0) {
      container.innerHTML = '<p class="empty-msg">No domains added yet.</p>';
      return;
    }

    list.forEach(domain => {
      const item = document.createElement('div');
      item.className = 'domain-item';
      
      const span = document.createElement('span');
      span.textContent = domain;

      const removeBtn = document.createElement('button');
      removeBtn.className = 'btn-remove';
      removeBtn.innerHTML = '✖';
      removeBtn.title = 'Remove';
      removeBtn.addEventListener('click', () => onRemove(domain));

      item.appendChild(span);
      item.appendChild(removeBtn);
      container.appendChild(item);
    });
  }

  // Ruleset Toggles Event Handlers
  document.querySelectorAll('input[data-ruleset]').forEach(input => {
    input.addEventListener('change', async (e) => {
      const rulesetId = e.target.getAttribute('data-ruleset');
      const enabled = e.target.checked;
      await sendMessage({ type: 'TOGGLE_RULESET', rulesetId, enabled });
    });
  });

  // Whitelist Add
  addWhitelistBtn.addEventListener('click', async () => {
    const domain = newWhitelistInput.value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!domain) return;
    await sendMessage({ type: 'TOGGLE_WHITELIST_DOMAIN', domain });
    newWhitelistInput.value = '';
    await loadData();
  });

  // Blocklist Add
  addBlocklistBtn.addEventListener('click', async () => {
    const domain = newBlocklistInput.value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!domain) return;
    await sendMessage({ type: 'ADD_CUSTOM_BLOCK_DOMAIN', domain });
    newBlocklistInput.value = '';
    await loadData();
  });

  // Reset Stats
  resetStatsBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to reset all blocked count statistics?')) {
      await sendMessage({ type: 'RESET_STATS' });
      showFeedback('Statistics reset successfully!', 'success');
      await loadData();
    }
  });

  // Export Settings
  exportSettingsBtn.addEventListener('click', async () => {
    const { settings } = await chrome.storage.local.get('settings');
    const jsonStr = JSON.stringify(settings, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `shieldblock_settings_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showFeedback('Settings exported successfully!', 'success');
  });

  // Import Settings
  importSettingsFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        const res = await sendMessage({ type: 'IMPORT_SETTINGS', newSettings: imported });
        if (res && res.success) {
          showFeedback('Settings imported successfully!', 'success');
          await loadData();
        } else {
          showFeedback(res?.error || 'Failed to import settings', 'error');
        }
      } catch (err) {
        showFeedback('Invalid JSON file format', 'error');
      }
    };
    reader.readAsText(file);
  });

  function showFeedback(msg, type) {
    backupFeedback.textContent = msg;
    backupFeedback.className = `feedback ${type}`;
    setTimeout(() => {
      backupFeedback.textContent = '';
      backupFeedback.className = 'feedback';
    }, 3500);
  }

  function sendMessage(msg) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(msg, (response) => resolve(response));
    });
  }

  await loadData();
});
