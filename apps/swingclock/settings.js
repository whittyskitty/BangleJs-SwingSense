// swingclock Settings Configuration
(function(back) {
  let settings = require('Storage').readJSON('swingclock.json', true) || {
    updateInterval: 100,
    fontSize: 'large',
    showReference: false,
    vibrationFeedback: true,
    autoZero: false
  };
  
  function save(key, value) {
    settings[key] = value;
    require('Storage').writeJSON('swingclock.json', settings);
  }
  
  const settingsMenu = {
    '': {'title': 'Angle Tracker Settings'},
    '< Back': back,
    'Update Interval': {
      value: settings.updateInterval,
      min: 50,
      max: 500,
      step: 50,
      onchange: (v) => save('updateInterval', v),
      format: (v) => v + 'ms'
    },
    'Font Size': {
      value: settings.fontSize,
      onchange: (v) => save('fontSize', v),
      options: ['small', 'medium', 'large']
    },
    'Show Reference': {
      value: settings.showReference,
      onchange: (v) => save('showReference', v)
    },
    'Vibration Feedback': {
      value: settings.vibrationFeedback,
      onchange: (v) => save('vibrationFeedback', v)
    },
    'Auto Zero on Start': {
      value: settings.autoZero,
      onchange: (v) => save('autoZero', v)
    },
    'Reset to Defaults': {
      value: () => {
        E.showPrompt("Reset to default settings?").then((result) => {
          if (result) {
            // Reset to default settings
            const defaultSettings = {
              updateInterval: 100,
              fontSize: 'large',
              showReference: false,
              vibrationFeedback: true,
              autoZero: false
            };
            require('Storage').writeJSON('swingclock.json', defaultSettings);
            
            E.showMessage("Settings Reset", "swingclock");
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