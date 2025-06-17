
# SwingSense Golf Tracker - Installation Instructions

## Quick Install (Recommended)

### Option 1: Bangle.js App Loader
1. Visit https://banglejs.com/apps
2. Connect your Bangle.js 2 
3. Search for "SwingSense" (when published)
4. Click Install

### Option 2: Manual Installation via Web IDE
1. Visit https://espruino.com/ide
2. Connect your Bangle.js 2 or open emulator
3. Upload files in this order:

#### Upload to Storage:
- Upload app.js as "swingsense.app.js"
- Upload app-icon.js as "swingsense.img" (with evaluate: true)
- Upload settings.js as "swingsense.settings.js"

#### Manual App Info (if needed):
Create "swingsense.info" with:
```json
{
  "name": "SwingSense",
  "icon": "*swingsense",
  "src": "-swingsense",
  "type": "app",
  "version": "0.1.0"
}
```

## Testing in Emulator

1. Visit https://espruino.com/ide
2. Click "Connect" → "Emulator"
3. Load app.js in the right panel
4. Click "Upload to RAM"
5. The app will start automatically

## Features Available in Emulator
- ✅ Full UI navigation
- ✅ Simulated swing detection
- ✅ Data persistence
- ✅ Settings management

## Features Requiring Real Device
- GPS tracking
- Real accelerometer data
- Vibration feedback

## Support
For issues, check the README.md file or visit the Bangle.js forums.
