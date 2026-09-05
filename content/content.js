// ShieldBlock Cosmetic Content Script & Video Ad Skipper

(async function () {
  // Query status from service worker
  let statusResponse;
  try {
    statusResponse = await new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (res) => resolve(res));
    });
  } catch (e) {
    return;
  }

  if (!statusResponse || !statusResponse.enabled || statusResponse.isWhitelisted) {
    return; // Ad blocker is paused or site is whitelisted
  }

  const host = window.location.hostname;
  const isYouTube = host.includes('youtube.com');
  const isFacebook = host.includes('facebook.com');

  // --- 1. Cosmetic Element Hiding ---
  const AD_SELECTORS = [
    '.ad-container', '.ad-wrapper', '.ad-slot', '.ad-banner', '.ad-unit',
    '.ad-box', '.ad_box', '.ad_container', '.ad_wrapper', '.adsbygoogle',
    '[id*="google_ads"]', '[id*="google_ad"]', '[class*="google-ad"]', '[class*="google_ad"]',
    'iframe[src*="doubleclick.net"]', 'iframe[src*="googlesyndication.com"]',
    'iframe[src*="amazon-adsystem.com"]', 'div[data-ad-unit]', 'div[data-ad-slot]',
    'div[data-ad-client]', '.sponsored-post', '.sponsored-content',
    '.taboola-placeholder', '.outbrain_widget', '#popads-overlay', '#popcash-overlay',
    '.ad-overlay', '.sticky-ad',
    // YouTube
    '.video-ads', '.ytp-ad-module', '.ytp-ad-overlay-container',
    'ytd-ad-slot-renderer', 'ytd-in-feed-ad-layout-renderer',
    'ytd-banner-promo-renderer', 'ytd-promoted-sparkles-web-renderer',
    'ytd-display-ad-renderer', 'ytd-action-companion-ad-renderer',
    '#player-ads', '#masthead-ad',
    // Facebook
    '[aria-label*="Sponsored"]', 'div[data-pagelet*="FeedUnit_Sponsored"]',
    'div[data-pagelet*="VideoAd"]', '.fb_ad_overlay'
  ];

  const hiddenElements = new WeakSet();

  function hideAdElements() {
    const selectorStr = AD_SELECTORS.join(',');
    const elements = Array.from(document.querySelectorAll(selectorStr));
    const toHide = elements.filter(el => !hiddenElements.has(el));

    if (toHide.length === 0) return;

    const BATCH_SIZE = 20;
    let index = 0;

    function processBatch() {
      const batch = toHide.slice(index, index + BATCH_SIZE);
      let countInBatch = 0;

      for (const el of batch) {
        hiddenElements.add(el);
        el.style.setProperty('display', 'none', 'important');
        el.style.setProperty('visibility', 'hidden', 'important');
        el.style.setProperty('height', '0px', 'important');
        countInBatch++;
      }

      index += BATCH_SIZE;

      if (countInBatch > 0) {
        chrome.runtime.sendMessage({
          type: 'COSMETIC_BLOCKED',
          count: countInBatch
        }).catch(() => {});
      }

      if (index < toHide.length) {
        requestAnimationFrame(processBatch);
      }
    }

    requestAnimationFrame(processBatch);
  }

  // --- 2. YouTube & Facebook Video Ad Skipper ---
  let lastSkippedTime = 0;

  function processVideoAds() {
    if (isYouTube) {
      handleYouTubeVideoAds();
    } else if (isFacebook) {
      handleFacebookVideoAds();
    }
  }

  function handleYouTubeVideoAds() {
    const player = document.querySelector('#movie_player, .html5-video-player');
    if (!player) return;

    const isAdShowing = player.classList.contains('ad-showing') || 
                        player.classList.contains('ad-interrupting') ||
                        document.querySelector('.ytp-ad-text, .ytp-ad-preview-text');

    if (isAdShowing) {
      const video = player.querySelector('video');
      if (video) {
        // Fast-forward video ad and mute audio
        video.muted = true;
        video.playbackRate = 16.0;
        if (!isNaN(video.duration) && video.duration > 0) {
          video.currentTime = video.duration;
        }
      }

      // Auto click all Skip Ad buttons
      const skipButtons = document.querySelectorAll(`
        .ytp-ad-skip-button,
        .ytp-ad-skip-button-modern,
        .ytp-skip-ad-button,
        button.ytp-ad-skip-button-modern,
        .ytp-ad-skip-button-slot,
        .ytp-ad-skip-button-container button
      `);

      skipButtons.forEach(btn => {
        if (btn && typeof btn.click === 'function') {
          btn.click();
        }
      });

      // Close banner overlays
      const overlayCloseBtns = document.querySelectorAll('.ytp-ad-overlay-close-button');
      overlayCloseBtns.forEach(btn => btn.click());

      // Report skipped video ad once per second
      const now = Date.now();
      if (now - lastSkippedTime > 1000) {
        lastSkippedTime = now;
        chrome.runtime.sendMessage({ type: 'COSMETIC_BLOCKED', count: 1 }).catch(() => {});
      }
    }
  }

  function handleFacebookVideoAds() {
    // Detect Facebook Video Ad Overlays or Ad breaks
    const fbAdOverlays = document.querySelectorAll('.fb_ad_overlay, div[data-pagelet*="VideoAd"]');
    if (fbAdOverlays.length > 0) {
      fbAdOverlays.forEach(el => {
        el.style.setProperty('display', 'none', 'important');
      });
      // Fast forward active FB video ad if present inside ad container
      const videos = document.querySelectorAll('video');
      videos.forEach(v => {
        const parentAd = v.closest('div[data-pagelet*="VideoAd"], .fb_ad_overlay');
        if (parentAd) {
          v.muted = true;
          v.playbackRate = 16.0;
          if (!isNaN(v.duration) && v.duration > 0) {
            v.currentTime = v.duration;
          }
        }
      });
    }
  }

  // Initial Runs
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      hideAdElements();
      processVideoAds();
    });
  } else {
    hideAdElements();
    processVideoAds();
  }

  // Fast loop for instant video ad detection & skipping
  setInterval(processVideoAds, 250);

  // MutationObserver for DOM changes
  const observer = new MutationObserver((mutations) => {
    let hasNewNodes = false;
    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        hasNewNodes = true;
        break;
      }
    }
    if (hasNewNodes) {
      hideAdElements();
      processVideoAds();
    }
  });

  observer.observe(document.documentElement || document.body, {
    childList: true,
    subtree: true
  });
})();
