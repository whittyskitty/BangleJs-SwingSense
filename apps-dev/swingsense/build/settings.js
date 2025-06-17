// SwingSense Settings Configuration
(function(back) {
  let settings = require('Storage').readJSON('swingsense.json', true) || {
    units: 'yards',
    autoGPS: true,
    swingSensitivity: 'medium',
    vibrationFeedback: true
  };
  
  function save(key, value) {
    settings[key] = value;
    require('Storage').writeJSON('swingsense.json', settings);
  }
  
  const settingsMenu = {
    '': {'title': 'SwingSense Settings'},
    '< Back': back,
    'Distance Units': {
      value: settings.units,
      onchange: (v) => save('units', v),
      options: ['yards', 'meters']
    },
    'Auto GPS Start': {
      value: settings.autoGPS,
      onchange: (v) => save('autoGPS', v)
    },
    'Swing Sensitivity': {
      value: settings.swingSensitivity,
      onchange: (v) => save('swingSensitivity', v),
      options: ['low', 'medium', 'high']
    },
    'Vibration Feedback': {
      value: settings.vibrationFeedback,
      onchange: (v) => save('vibrationFeedback', v)
    },
    'Clear All Data': {
      value: () => {
        E.showPrompt("Clear all rounds and settings?").then((result) => {
          if (result) {
            // Clear all app data
            const storage = require('Storage');
            const files = storage.list(/^swingsense/);
            files.forEach(file => storage.erase(file));
            
            E.showMessage("Data Cleared", "SwingSense");
            setTimeout(() => {
              back();
            }, 2000);
          }
        });
      }
    }
  };
  
  E.showMenu(settingsMenu);
}) 