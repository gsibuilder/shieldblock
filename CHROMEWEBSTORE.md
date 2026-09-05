# Chrome Web Store Listing — ShieldBlock - Ad & Tracker Blocker

> Last Updated: 2026-09-05

## Store Listing

**Extension Name**  
ShieldBlock - Ad & Tracker Blocker

**Short Description**  
High-performance ad blocker, tracker shield, popup defender, and cosmetic element hider using Manifest V3. Built by Corey Kiesel.

**Detailed Description**  
ShieldBlock is a modern, lightweight, high-speed ad blocker built by Corey Kiesel from the ground up for Chrome Manifest V3.

Key Features:
- Blocks ad networks, DoubleClick, banner ads, tracking beacons, popups, and intrusive overlays.
- Automatic video ad skipping for YouTube and Facebook (fast-forwards and auto-clicks skip buttons).
- Category filter rulesets: General Ads, Privacy & Trackers, Popups & Annoyances.
- Cosmetic element hiding: collapses empty space and sponsor containers smoothly without layout shift.
- Per-site pausing: single-click whitelist toggle in the popup menu.
- Custom rule manager: add custom domain block and allow rules easily.
- Settings import and export: backup and restore your configuration at any time.

How to Use:
1. Click the ShieldBlock icon in your toolbar to see live block stats for the current site.
2. Toggle ad blocking on or off globally, or pause blocking specifically on your trusted sites.
3. Access Options & Dashboard to manage custom domain lists and toggles.

Privacy & Security:
ShieldBlock operates 100% locally on your browser. No web browsing activity, history, or telemetry is ever collected, tracked, or transmitted off your device.

**Category**  
Productivity

**Single Purpose**  
Blocks network advertisements, web tracking scripts, and intrusive ad elements on webpages.

**Primary Language**  
English

---

## Developer Info

**Publisher Name**  
Corey Kiesel

**Author**  
Corey Kiesel

---

## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| `declarativeNetRequest` | permissions | Required to natively block known ad and tracking network requests before they load. |
| `storage` | permissions | Required to store user settings, custom block lists, whitelist domains, and stats locally on device. |
| `activeTab` | permissions | Required to detect current website domain to display site status and enable per-site pausing. |
| `scripting` | permissions | Required to inject cosmetic element hiding scripts into pages. |
| `tabs` | permissions | Required to read active tab URLs for badge status updates and domain detection. |
| `<all_urls>` | host_permissions | Required for declarativeNetRequest rules to block ad and tracking network calls on any web page visited. |

---

## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** No

ShieldBlock does not collect, record, or transmit any user data. All configuration, counters, and rule settings remain strictly inside `chrome.storage.local`.

---

## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 1.0.0 | 2026-09-05 | Initial release with DNR engine, popup UI, cosmetic hider, video ad skipper, and options dashboard by Corey Kiesel. | Draft |
