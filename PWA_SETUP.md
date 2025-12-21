# PWA Setup Guide

This guide explains how to install and configure the Work Diary PWA on Windows, including setting up a global keyboard shortcut.

## Table of Contents

1. [Installation](#installation)
2. [Global Keyboard Shortcut Setup](#global-keyboard-shortcut-setup)
3. [Testing](#testing)
4. [Known Limitations](#known-limitations)
5. [Production Deployment](#production-deployment)

---

## Installation

### Prerequisites

- Windows 10/11
- Google Chrome or Microsoft Edge (Chromium-based browser)
- The app must be served over HTTPS (or localhost for development)

### Step 1: Build the Application

```bash
npm run build
```

This will generate both the Chrome Extension and PWA assets in the `dist` folder.

### Step 2: Serve the Application

For development/testing on localhost:

```bash
npm run preview
```

For production, deploy the `dist` folder to a web server with HTTPS enabled.

### Step 3: Install the PWA

1. Open Chrome/Edge and navigate to the app URL (e.g., `http://localhost:4173` for preview, or your production URL)

2. Look for the install icon in the address bar (usually appears as a "+" or install icon)

3. Click the install icon, or:

   - Click the three-dot menu (⋮) in the browser
   - Select "Install Work Diary" or "Install app"

4. In the installation dialog, click "Install"

5. The app will now:
   - Appear in your Windows Start Menu
   - Be available in the taskbar
   - Open in a standalone window (no browser UI)

### Step 4: Verify Installation

- Open the Start Menu and search for "Work Diary"
- Click the app icon
- The app should open in a standalone window without browser UI (no address bar, tabs, etc.)

---

## Global Keyboard Shortcut Setup

Windows doesn't natively support global keyboard shortcuts for PWAs, but you can create a Windows shortcut with a keyboard shortcut assigned.

### Method 1: Using Windows Shortcut Properties

1. **Locate the installed PWA shortcut:**

   - Open File Explorer
   - Navigate to: `%LOCALAPPDATA%\Microsoft\WindowsApps`
   - Look for "Work Diary" or search for it in the Start Menu
   - Right-click the app icon in Start Menu → "More" → "Open file location"

2. **Create a desktop shortcut:**

   - Right-click the app icon
   - Select "Create shortcut"
   - If prompted, choose to place it on the desktop

3. **Assign a keyboard shortcut:**

   - Right-click the shortcut → "Properties"
   - Click in the "Shortcut key" field
   - Press your desired key combination (e.g., `Ctrl + Alt + F`)
   - Click "OK"

4. **Test the shortcut:**
   - Press your assigned key combination
   - The app should open (or focus if already open)

### Method 2: Using PowerShell (Advanced)

You can also create a shortcut programmatically:

```powershell
# Create shortcut on desktop
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\Work Diary.lnk")
$Shortcut.TargetPath = "msedge.exe"  # or "chrome.exe"
$Shortcut.Arguments = "--app=https://your-app-url.com"
$Shortcut.Hotkey = "CTRL+ALT+F"
$Shortcut.Save()
```

**Note:** Replace `https://your-app-url.com` with your actual app URL.

### Recommended Shortcuts

- `Ctrl + Alt + W` - Work Diary (W for Work)
- `Ctrl + Alt + D` - Diary
- `Ctrl + Alt + F` - Focus Tab
- `Ctrl + Shift + W` - Alternative option

**Important:** Avoid conflicts with system shortcuts or other applications.

---

## Testing

### PWA Checklist

Use Chrome DevTools to verify PWA functionality:

1. **Open DevTools** (F12)
2. **Go to Application tab**
3. **Check Manifest:**

   - Should show "Work Diary" as name
   - Display mode should be "standalone"
   - Icons should load correctly

4. **Check Service Worker:**

   - Should show as "activated and running"
   - Should cache assets for offline use

5. **Test Offline Mode:**

   - Go to Network tab → Check "Offline"
   - Reload the page
   - App should still load (basic functionality)

6. **Lighthouse Audit:**
   - Open Lighthouse tab in DevTools
   - Run PWA audit
   - Should score ≥ 90 for PWA

### Standalone Window Test

1. Install the PWA
2. Launch from Start Menu
3. Verify:
   - No browser address bar
   - No browser tabs
   - No browser menu (except window controls)
   - App runs in its own window

### Single Instance Test

1. Open the installed PWA
2. Try to open it again (from Start Menu or shortcut)
3. Should focus the existing window instead of opening a new one

---

## Known Limitations

### Windows-Specific

1. **Global Hotkeys:**

   - PWAs cannot register global keyboard shortcuts directly
   - Must use Windows shortcut properties (manual setup required)
   - Shortcuts only work when Windows is focused (not system-wide in all contexts)

2. **File System Access:**

   - PWAs have limited file system access
   - Cannot access arbitrary files without user permission

3. **System Integration:**
   - Limited system tray integration
   - No native notifications (uses browser notifications)

### PWA Limitations

1. **Offline Functionality:**

   - Some features may require network access
   - Service worker caches static assets, but API calls may fail offline

2. **Browser Dependencies:**

   - Requires Chromium-based browser (Chrome/Edge)
   - Firefox and Safari have different PWA support

3. **Update Mechanism:**
   - Service worker auto-updates, but users may need to refresh
   - No forced update mechanism

### Extension Compatibility

- The Chrome Extension and PWA can coexist
- Extension overrides new tab page
- PWA runs as standalone app
- Both share the same codebase but serve different purposes

---

## Production Deployment

### Requirements

1. **HTTPS Required:**

   - PWAs require HTTPS (except localhost)
   - Obtain SSL certificate for your domain
   - Configure your web server for HTTPS

2. **Update Manifest URLs:**

   - Update `public/pwa-manifest.json`:
     ```json
     {
     	"start_url": "https://yourdomain.com/",
     	"scope": "https://yourdomain.com/"
     }
     ```

3. **Service Worker Scope:**

   - Ensure service worker scope matches your domain
   - Vite PWA plugin handles this automatically

4. **Build and Deploy:**
   ```bash
   npm run build
   # Deploy the 'dist' folder to your web server
   ```

### Deployment Checklist

- [ ] HTTPS enabled on production domain
- [ ] Manifest URLs updated with production domain
- [ ] Service worker registered correctly
- [ ] Icons accessible at correct paths
- [ ] Test install flow on production
- [ ] Verify offline functionality
- [ ] Check Lighthouse PWA score
- [ ] Test on Windows 10/11

### CDN Considerations

If using a CDN:

- Ensure service worker is served from the root domain
- Service worker scope is limited to its directory
- Cache headers configured correctly

---

## Troubleshooting

### Install Prompt Not Appearing

1. **Check PWA Requirements:**

   - App must be served over HTTPS (or localhost)
   - Manifest must be valid
   - Service worker must be registered

2. **Clear Browser Data:**

   - Clear site data in Chrome DevTools
   - Try incognito mode

3. **Check Manifest:**
   - Open DevTools → Application → Manifest
   - Verify all required fields are present

### Service Worker Not Registering

1. **Check Console:**

   - Look for service worker errors
   - Verify service worker file is accessible

2. **Check Network:**
   - Ensure service worker file is not blocked
   - Verify correct MIME type

### App Opens in Browser Instead of Standalone

1. **Reinstall the PWA:**

   - Uninstall from Chrome settings
   - Clear site data
   - Reinstall

2. **Check Display Mode:**
   - Verify manifest has `"display": "standalone"`

### Global Shortcut Not Working

1. **Check Shortcut Properties:**

   - Verify shortcut key is set correctly
   - Ensure no conflicts with other shortcuts

2. **Try Different Key Combination:**
   - Some combinations may be reserved by Windows
   - Use `Ctrl + Alt + [Key]` format

---

## Additional Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)

---

## Support

For issues or questions:

1. Check this documentation
2. Review browser console for errors
3. Test in Chrome DevTools
4. Verify all prerequisites are met
