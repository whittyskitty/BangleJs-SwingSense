// SwingSense Golf Tracker - Main Application
// Entry point and navigation system

// Global app state
let AppState = {
  currentRound: null,
  currentHole: null,
  swingDetectionActive: false,
  gpsTracking: false,
  settings: {},
  version: "0.1.4"
};

// // 
// Load settings
function loadSettings() {
  try {
    AppState.settings = require('Storage').readJSON('swingsense.json', true) || {
      units: 'yards', // yards or meters
      autoGPS: true,
      swingSensitivity: 'medium',
      vibrationFeedback: true
    };
  } catch (e) {
    console.log("No settings found, using defaults");
    AppState.settings = {
      units: 'yards',
      autoGPS: true,
      swingSensitivity: 'medium',
      vibrationFeedback: true
    };
  }
}

// Save settings
function saveSettings() {
  require('Storage').writeJSON('swingsense.json', AppState.settings);
}

// Data Models
const Models = {
  createRound: function(course, holes, weather, warmup) {
    return {
      id: Date.now().toString(),
      course: course || "Unnamed Course",
      date: new Date().toISOString(),
      holes: [],
      totalHoles: holes || 18,
      duration_sec: 0,
      weather: weather || [],
      warmup: warmup || {
        putting_min: 0,
        chipping_min: 0,
        range_min: 0
      },
      startTime: null,
      endTime: null,
      completed: false
    };
  },

  createHole: function(holeNumber, par) {
    return {
      hole: holeNumber,
      par: par || 4,
      start_time: null,
      end_time: null,
      duration_sec: 0,
      shots: [],
      GIR: false,
      putts: 0,
      first_putt_distance_ft: 0,
      completed: false
    };
  },

  createShot: function(club, lie, miss) {
    return {
      club: club || "Unknown",
      start: null, // GPS coordinates
      end: null,   // GPS coordinates
      distance: 0,
      tempo: {
        backswing_ms: 0,
        downswing_ms: 0,
        ratio: 0
      },
      peak_accel: 0,
      timestamp: new Date().toISOString(),
      duration_since_last_sec: 0,
      penalty: false,
      lost: false,
      lie: lie || "Unknown",
      miss: miss || "None",
      location_override: false
    };
  }
};

// Storage utilities
const Storage = {
  saveRound: function(round) {
    try {
      require('Storage').writeJSON(`swingsense.round.${round.id}.json`, round);
      this.updateRoundsList(round);
      return true;
    } catch (e) {
      console.log("Error saving round:", e);
      return false;
    }
  },

  loadRound: function(roundId) {
    try {
      return require('Storage').readJSON(`swingsense.round.${roundId}.json`, true);
    } catch (e) {
      console.log("Error loading round:", e);
      return null;
    }
  },

  updateRoundsList: function(round) {
    try {
      let rounds = require('Storage').readJSON('swingsense.rounds.json', true) || [];
      
      // Remove existing entry if updating
      rounds = rounds.filter(r => r.id !== round.id);
      
      // Add round summary
      rounds.push({
        id: round.id,
        course: round.course,
        date: round.date,
        completed: round.completed,
        totalStrokes: round.holes.reduce((total, hole) => total + hole.shots.length, 0),
        totalHoles: round.holes.length
      });
      
      // Sort by date (newest first)
      rounds.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      require('Storage').writeJSON('swingsense.rounds.json', rounds);
    } catch (e) {
      console.log("Error updating rounds list:", e);
    }
  },

  getRoundsList: function() {
    try {
      return require('Storage').readJSON('swingsense.rounds.json', true) || [];
    } catch (e) {
      return [];
    }
  }
};

// Screen Management
const Screens = {
  current: null,

  show: function(screenName, data) {
    this.current = screenName;
    g.clear();
    
    switch(screenName) {
      case 'home':
        this.showHome();
        break;
      case 'startRound':
        this.showStartRound(data);
        break;
      case 'hole':
        this.showHole(data);
        break;
      case 'putting':
        this.showPutting(data);
        break;
      case 'roundSummary':
        this.showRoundSummary(data);
        break;
      case 'pastRounds':
        this.showPastRounds();
        break;
      case 'settings':
        this.showSettings();
        break;
      default:
        this.showHome();
    }
  },

  // Helper function to draw back button
  drawBackButton: function() {
    g.setColor(1, 0, 0);
    g.fillRect(10, 10, 60, 30);
    g.setColor(1, 1, 1);
    g.setFont("6x8", 1);
    g.setFontAlign(0, 0);
    g.drawString("← Back", 40, 25);
  },

  showHome: function() {
    g.clear();
    g.setColor(1, 1, 1);
    g.setFont("Vector", 24);
    g.setFontAlign(0, 0);
    
    // Title
    g.drawString("⛳ SwingSense", 120, 40);
    
    g.setFont("Vector", 18);
    
    // Menu options
    const menuY = 90;
    const spacing = 35;
    
    g.drawString("🏌️ Start Round", 120, menuY);
    g.drawString("📊 Past Rounds", 120, menuY + spacing);
    g.drawString("⚙️ Settings", 120, menuY + spacing * 2);
    
    // Instructions
    g.setFont("6x8", 1);
    g.setFontAlign(0, 1);
    g.drawString("Tap to select", 120, 220);
    
    this.setupHomeTouch();
  },

  setupHomeTouch: function() {
    Bangle.setUI({
      mode: "custom",
      touch: (button, xy) => {
        if (xy && xy.y > 70 && xy.y < 105) {
          // Start Round
          this.show('startRound');
        } else if (xy && xy.y > 105 && xy.y < 140) {
          // Past Rounds
          this.show('pastRounds');
        } else if (xy && xy.y > 140 && xy.y < 175) {
          // Settings
          this.show('settings');
        }
      },
      btn: () => {
        // Button press goes back to clock/menu
        load();
      }
    });
  },

  showStartRound: function(data) {
    g.clear();
    g.setColor(1, 1, 1);
    g.setFont("Vector", 20);
    g.setFontAlign(0, 0);
    
    g.drawString("🏁 Start Round", 120, 30);
    
    g.setFont("Vector", 16);
    
    // Simple start for now - we'll expand this
    g.drawString("Course: Test Course", 120, 70);
    g.drawString("Holes: 18", 120, 100);
    g.drawString("Weather: Calm", 120, 130);
    
    g.setColor(0, 1, 0);
    g.fillRect(40, 160, 200, 190);
    g.setColor(0, 0, 0);
    g.drawString("✅ START ROUND", 120, 175);
    
    // Draw back button
    this.drawBackButton();
    
    g.setColor(1, 1, 1);
    g.setFont("6x8", 1);
    g.setFontAlign(0, 1);
    g.drawString("Button: Back", 120, 220);
    
    Bangle.setUI({
      mode: "custom",
      touch: (button, xy) => {
        if (xy && xy.y > 160 && xy.y < 190) {
          // Start the round
          this.startNewRound();
        } else if (xy && xy.x < 70 && xy.y < 40) {
          // Back button
          this.show('home');
        }
      },
      btn: () => {
        this.show('home');
      }
    });
  },

  startNewRound: function() {
    // Create new round
    AppState.currentRound = Models.createRound("Test Course", 18, ["Calm"], {
      putting_min: 0,
      chipping_min: 0,
      range_min: 0
    });
    
    AppState.currentRound.startTime = Date.now();
    
    // Start with hole 1
    AppState.currentHole = Models.createHole(1, 4);
    AppState.currentRound.holes.push(AppState.currentHole);
    
    // Start GPS if enabled
    if (AppState.settings.autoGPS) {
      AppState.gpsTracking = true;
      // GPS.start() would go here on real device
    }
    
    // Show hole screen
    this.show('hole', { holeNumber: 1 });
  },

  showHole: function(data) {
    const hole = AppState.currentHole;
    if (!hole) return this.show('home');
    
    g.clear();
    g.setColor(1, 1, 1);
    g.setFont("Vector", 18);
    g.setFontAlign(0, 0);
    
    // Header
    g.drawString(`⛳ Hole ${hole.hole} | Par ${hole.par}`, 120, 25);
    
    g.setFont("Vector", 14);
    
    // Current shot count
    const shotCount = hole.shots.length;
    g.drawString(`Shots: ${shotCount}`, 120, 55);
    
    // Time on hole
    const timeOnHole = hole.start_time ? Math.floor((Date.now() - hole.start_time) / 1000) : 0;
    g.drawString(`Time: ${Math.floor(timeOnHole / 60)}m ${timeOnHole % 60}s`, 120, 80);
    
    // Club selection
    g.drawString("🛠️ Club: Driver", 120, 110);
    
    // Swing detection status
    if (AppState.swingDetectionActive) {
      g.setColor(0, 1, 0);
      g.drawString("⏳ Swing Detection Active", 120, 140);
    } else {
      g.setColor(1, 1, 0);
      g.drawString("👆 Tap to Start Detection", 120, 140);
    }
    
    // Draw back button
    this.drawBackButton();
    
    g.setColor(1, 1, 1);
    g.setFont("6x8", 1);
    g.setFontAlign(0, 1);
    g.drawString("Button: Menu | Touch: Actions", 120, 220);
    
    this.setupHoleTouch();
  },

  setupHoleTouch: function() {
    Bangle.setUI({
      mode: "custom",
      touch: (button, xy) => {
        if (xy && xy.y > 130 && xy.y < 160) {
          // Toggle swing detection
          if (AppState.swingDetectionActive) {
            this.stopSwingDetection();
          } else {
            this.startSwingDetection();
          }
        } else if (xy && xy.x < 70 && xy.y < 40) {
          // Back button
          this.show('home');
        }
      },
      btn: () => {
        // Show hole menu
        this.showHoleMenu();
      }
    });
  },

  startSwingDetection: function() {
    AppState.swingDetectionActive = true;
    
    if (AppState.settings.vibrationFeedback) {
      Bangle.buzz(100);
    }
    
    // Simulate swing detection for emulator
    setTimeout(() => {
      if (AppState.swingDetectionActive) {
        this.onSwingDetected();
      }
    }, 3000);
    
    this.show('hole', { holeNumber: AppState.currentHole.hole });
  },

  stopSwingDetection: function() {
    AppState.swingDetectionActive = false;
    this.show('hole', { holeNumber: AppState.currentHole.hole });
  },

  onSwingDetected: function() {
    AppState.swingDetectionActive = false;
    
    if (AppState.settings.vibrationFeedback) {
      Bangle.buzz(200);
    }
    
    // Create shot
    const shot = Models.createShot("Driver", "Tee", "None");
    shot.tempo.backswing_ms = 700 + Math.random() * 200;
    shot.tempo.downswing_ms = 200 + Math.random() * 100;
    shot.tempo.ratio = shot.tempo.backswing_ms / shot.tempo.downswing_ms;
    shot.peak_accel = 12 + Math.random() * 6;
    
    AppState.currentHole.shots.push(shot);
    
    // Show shot result
    this.showShotResult(shot);
  },

  showShotResult: function(shot) {
    g.clear();
    g.setColor(1, 1, 1);
    g.setFont("Vector", 18);
    g.setFontAlign(0, 0);
    
    g.drawString("🎯 Swing Detected!", 120, 30);
    
    g.setFont("Vector", 14);
    g.drawString(`Tempo: ${shot.tempo.ratio.toFixed(1)}:1`, 120, 70);
    g.drawString(`Peak G: ${shot.peak_accel.toFixed(1)}`, 120, 95);
    g.drawString(`Club: ${shot.club}`, 120, 120);
    
    g.setColor(0, 1, 0);
    g.fillRect(40, 160, 200, 190);
    g.setColor(0, 0, 0);
    g.drawString("✅ Confirm Shot", 120, 175);
    
    // Draw back button
    this.drawBackButton();
    
    Bangle.setUI({
      mode: "custom",
      touch: (button, xy) => {
        if (xy && xy.x < 70 && xy.y < 40) {
          // Back button - return to hole
          this.show('hole', { holeNumber: AppState.currentHole.hole });
        }
      },
      btn: () => {
        // Return to hole
        this.show('hole', { holeNumber: AppState.currentHole.hole });
      }
    });
    
    setTimeout(() => {
      this.show('hole', { holeNumber: AppState.currentHole.hole });
    }, 3000);
  },

  showHoleMenu: function() {
    const menu = {
      '': { title: `Hole ${AppState.currentHole.hole} Menu` },
      '< Back': () => this.show('hole'),
      'Next Hole': () => this.nextHole(),
      'End Round': () => this.endRound(),
      'Switch to Putting': () => this.show('putting')
    };
    
    E.showMenu(menu);
  },

  nextHole: function() {
    if (!AppState.currentRound || !AppState.currentHole) return;
    
    // Mark current hole complete
    AppState.currentHole.completed = true;
    AppState.currentHole.end_time = Date.now();
    
    // Check if round is complete
    if (AppState.currentHole.hole >= AppState.currentRound.totalHoles) {
      this.endRound();
      return;
    }
    
    // Create next hole
    const nextHoleNum = AppState.currentHole.hole + 1;
    AppState.currentHole = Models.createHole(nextHoleNum, 4);
    AppState.currentHole.start_time = Date.now();
    AppState.currentRound.holes.push(AppState.currentHole);
    
    this.show('hole', { holeNumber: nextHoleNum });
  },

  endRound: function() {
    if (!AppState.currentRound) return;
    
    AppState.currentRound.completed = true;
    AppState.currentRound.endTime = Date.now();
    AppState.currentRound.duration_sec = Math.floor((AppState.currentRound.endTime - AppState.currentRound.startTime) / 1000);
    
    // Save round
    Storage.saveRound(AppState.currentRound);
    
    this.show('roundSummary');
  },

  showRoundSummary: function() {
    g.clear();
    g.setColor(1, 1, 1);
    g.setFont("Vector", 18);
    g.setFontAlign(0, 0);
    
    g.drawString("🏆 Round Complete!", 120, 30);
    
    g.setFont("Vector", 14);
    
    if (AppState.currentRound) {
      const totalShots = AppState.currentRound.holes.reduce((total, hole) => total + hole.shots.length, 0);
      const duration = Math.floor(AppState.currentRound.duration_sec / 60);
      
      g.drawString(`Course: ${AppState.currentRound.course}`, 120, 70);
      g.drawString(`Total Shots: ${totalShots}`, 120, 95);
      g.drawString(`Duration: ${duration}m`, 120, 120);
      g.drawString(`Holes: ${AppState.currentRound.holes.length}`, 120, 145);
    }
    
    // Draw back button
    this.drawBackButton();
    
    g.setColor(1, 1, 1);
    g.setFont("6x8", 1);
    g.setFontAlign(0, 1);
    g.drawString("Tap back to return home", 120, 220);
    
    Bangle.setUI({
      mode: "custom",
      touch: (button, xy) => {
        if (xy && xy.x < 70 && xy.y < 40) {
          // Back button
          this.show('home');
        }
      },
      btn: () => {
        this.show('home');
      }
    });
  },

  showPastRounds: function() {
    const rounds = Storage.getRoundsList();
    
    if (rounds.length === 0) {
      g.clear();
      g.setColor(1, 1, 1);
      g.setFont("Vector", 16);
      g.setFontAlign(0, 0);
      g.drawString("📊 Past Rounds", 120, 40);
      g.drawString("No rounds yet", 120, 120);
      
      // Draw back button
      this.drawBackButton();
      
      Bangle.setUI({
        mode: "custom",
        touch: (button, xy) => {
          if (xy && xy.x < 70 && xy.y < 40) {
            // Back button
            this.show('home');
          }
        },
        btn: () => this.show('home')
      });
      return;
    }
    
    // Show simple list for now
    const menu = {
      '': { title: 'Past Rounds' },
      '< Back': () => this.show('home')
    };
    
    rounds.slice(0, 8).forEach(round => {
      const date = new Date(round.date).toLocaleDateString();
      menu[`${round.course}`] = {
        value: `${date} - ${round.totalStrokes} strokes`
      };
    });
    
    E.showMenu(menu);
  },

  showSettings: function() {
    const menu = {
      '': { title: 'Settings' },
      '< Back': () => this.show('home'),
      'Units': {
        value: AppState.settings.units,
        onchange: (v) => {
          AppState.settings.units = v;
          saveSettings();
        },
        options: ['yards', 'meters']
      },
      'Auto GPS': {
        value: AppState.settings.autoGPS,
        onchange: (v) => {
          AppState.settings.autoGPS = v;
          saveSettings();
        }
      },
      'Vibration': {
        value: AppState.settings.vibrationFeedback,
        onchange: (v) => {
          AppState.settings.vibrationFeedback = v;
          saveSettings();
        }
      },
      'Sensitivity': {
        value: AppState.settings.swingSensitivity,
        onchange: (v) => {
          AppState.settings.swingSensitivity = v;
          saveSettings();
        },
        options: ['low', 'medium', 'high']
      }
    };
    
    E.showMenu(menu);
  },

  showPutting: function(data) {
    g.clear();
    g.setColor(1, 1, 1);
    g.setFont("Vector", 18);
    g.setFontAlign(0, 0);
    
    g.drawString("⛳ Putting Mode", 120, 30);
    g.setFont("Vector", 14);
    g.drawString("Putting tracking", 120, 70);
    g.drawString("coming soon...", 120, 95);
    
    // Draw back button
    this.drawBackButton();
    
    g.setColor(1, 1, 1);
    g.setFont("6x8", 1);
    g.setFontAlign(0, 1);
    g.drawString("Tap back to return", 120, 220);
    
    Bangle.setUI({
      mode: "custom",
      touch: (button, xy) => {
        if (xy && xy.x < 70 && xy.y < 40) {
          // Back button
          this.show('hole', { holeNumber: AppState.currentHole.hole });
        }
      },
      btn: () => {
        this.show('hole', { holeNumber: AppState.currentHole.hole });
      }
    });
  }
};

// Initialize app
function init() {
  loadSettings();
  Screens.show('home');
}

// Start the app
init(); 