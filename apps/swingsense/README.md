git# SwingSense Golf Tracker for Bangle.js

A comprehensive golf swing tracking and round management app for Bangle.js smartwatches.

## Features

### Core Functionality
- **Round Management**: Track full golf rounds with course information
- **Swing Detection**: Automatic swing detection with tempo and acceleration analysis
- **Shot Tracking**: Record each shot with club, lie, and miss information
- **Hole-by-Hole Tracking**: Monitor progress through each hole
- **GPS Integration**: Track shot distances and locations (on real device)
- **Round Statistics**: Comprehensive post-round analysis

### Data Tracking
- **Round Data**: Course name, weather conditions, total time
- **Hole Data**: Par, shots taken, putts, greens in regulation
- **Shot Data**: Club selection, swing tempo, peak acceleration, lie type, miss direction
- **Warm-up Logging**: Practice time before rounds

## Installation

### Option 1: Bangle.js App Loader (Recommended)
1. Visit [banglejs.com/apps](https://banglejs.com/apps)
2. Connect your Bangle.js 2
3. Search for "SwingSense" and install

### Option 2: Manual Installation
1. Connect to [Espruino Web IDE](https://espruino.com/ide)
2. Upload `app.js` to storage as `swingsense.app.js`
3. Upload `app-icon.js` to storage as `swingsense.img`
4. Upload `settings.js` to storage as `swingsense.settings.js`
5. Create `swingsense.info` file with app metadata

### Option 3: Development/Testing
1. Load `app.js` in the Espruino Web IDE
2. Click "Upload to RAM" for temporary testing
3. Use the online emulator for initial testing

## Usage

### Starting a Round
1. Launch SwingSense from the Bangle.js menu
2. Tap "🏌️ Start Round"
3. Configure course name, hole count, and weather
4. Tap "✅ START ROUND"

### Playing Golf
1. **Swing Detection**: Tap the detection area to start swing monitoring
2. **Shot Recording**: Swing is automatically detected and analyzed
3. **Club Selection**: Use the button menu to change clubs
4. **Next Hole**: Use button menu to advance to next hole
5. **Putting Mode**: Switch to putting-specific tracking

### Viewing Results
- **Live Stats**: View current hole progress and shot count
- **Round Summary**: Complete statistics at round end
- **Past Rounds**: Review historical rounds and trends

## Controls

### Touch Controls
- **Home Screen**: Tap menu items to navigate
- **Hole Screen**: Tap swing detection area to start/stop
- **Settings**: Tap options to configure

### Button Controls
- **Single Press**: Open context menu
- **Long Press**: Return to main menu/home

## Data Structure

### Round Format
```json
{
  "id": "1609459200000",
  "course": "Pebble Beach",
  "date": "2021-01-01T08:00:00Z",
  "holes": [...],
  "weather": ["Calm", "Sunny"],
  "warmup": {
    "putting_min": 10,
    "chipping_min": 15,
    "range_min": 30
  }
}
```

### Shot Format
```json
{
  "club": "Driver",
  "tempo": {
    "backswing_ms": 750,
    "downswing_ms": 250,
    "ratio": 3.0
  },
  "peak_accel": 14.2,
  "lie": "Tee",
  "miss": "Slight Right"
}
```

## Settings

### Available Options
- **Distance Units**: Yards or Meters
- **Auto GPS**: Automatically start GPS tracking
- **Swing Sensitivity**: Adjust swing detection sensitivity
- **Vibration Feedback**: Haptic feedback for swing detection

### Data Management
- Settings are stored in `swingsense.json`
- Rounds are stored in individual files: `swingsense.round.{id}.json`
- Round summaries are stored in `swingsense.rounds.json`

## Emulator Testing

The app is designed to work in the Bangle.js emulator with simulated data:

### Features Available in Emulator
- ✅ Full UI navigation
- ✅ Simulated swing detection (3-second delay)
- ✅ Data storage and retrieval
- ✅ Settings management
- ✅ Round progression

### Features Requiring Real Device
- ❌ Actual GPS tracking
- ❌ Real accelerometer data
- ❌ Vibration feedback
- ❌ True swing detection

## Development

### File Structure
```
banglejs-app/
├── app.json          # App metadata
├── app.js            # Main application code
├── app-icon.js       # Launcher icon
├── settings.js       # Settings configuration
├── app.png           # Icon image (48x48px)
└── README.md         # This file
```

### Key Components
- **AppState**: Global application state management
- **Models**: Data structure definitions
- **Storage**: Persistent data management
- **Screens**: UI screen management and navigation

### Adding Features
1. Extend the appropriate screen in the `Screens` object
2. Add data models to the `Models` object
3. Update storage schema if needed
4. Test in emulator before deploying

## Troubleshooting

### Common Issues
- **App won't start**: Check that all files are uploaded correctly
- **Settings not saving**: Verify storage permissions
- **Swing detection not working**: Adjust sensitivity in settings

### Debug Mode
Enable debug output by adding to the top of app.js:
```javascript
const DEBUG = true;
```

### Data Reset
Use the "Clear All Data" option in settings to reset all app data.

## Version History

### v0.1.0 (Initial Release)
- Basic round tracking
- Simple swing detection simulation
- Settings management
- Data persistence
- Emulator compatibility

## License

MIT License - feel free to modify and extend for your own use.

## Contributing

This is an open-source project. Contributions welcome:
1. Fork the repository
2. Create feature branch
3. Submit pull request

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Bangle.js documentation
3. Post in Bangle.js forums 