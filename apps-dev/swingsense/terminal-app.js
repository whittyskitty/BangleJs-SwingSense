#!/usr/bin/env node

// SwingSense Golf Tracker - Interactive Terminal Version
// Full featured test version with user input

const readline = require('readline');
const fs = require('fs');

// Terminal interface setup
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

// Mock storage for testing
const mockStorage = {
  data: {},
  readJSON: function(filename, create) {
    return this.data[filename] || (create ? {} : null);
  },
  writeJSON: function(filename, data) {
    this.data[filename] = data;
    console.log(`${colors.cyan}💾 Saved: ${filename}${colors.reset}`);
  },
  list: function(pattern) {
    return Object.keys(this.data).filter(key => 
      pattern instanceof RegExp ? pattern.test(key) : key.includes(pattern)
    );
  },
  erase: function(filename) {
    delete this.data[filename];
  }
};

// Global app state
let AppState = {
  currentRound: null,
  currentHole: null,
  swingDetectionActive: false,
  gpsTracking: false,
  settings: {
    units: 'yards',
    autoGPS: true,
    swingSensitivity: 'medium',
    vibrationFeedback: true
  },
  version: "0.1.0"
};

// Data Models (from original app)
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
      start: null,
      end: null,
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
    mockStorage.writeJSON(`swingsense.round.${round.id}.json`, round);
    this.updateRoundsList(round);
    return true;
  },

  loadRound: function(roundId) {
    return mockStorage.readJSON(`swingsense.round.${roundId}.json`, true);
  },

  updateRoundsList: function(round) {
    let rounds = mockStorage.readJSON('swingsense.rounds.json', true) || [];
    
    rounds = rounds.filter(r => r.id !== round.id);
    
    rounds.push({
      id: round.id,
      course: round.course,
      date: round.date,
      completed: round.completed,
      totalStrokes: round.holes.reduce((total, hole) => total + hole.shots.length, 0),
      totalHoles: round.holes.length
    });
    
    rounds.sort((a, b) => new Date(b.date) - new Date(a.date));
    mockStorage.writeJSON('swingsense.rounds.json', rounds);
  },

  getRoundsList: function() {
    return mockStorage.readJSON('swingsense.rounds.json', true) || [];
  }
};

// Utility functions
function clearScreen() {
  console.clear();
}

function printHeader(title) {
  console.log(`\n${colors.bright}${colors.green}⛳ SwingSense Golf Tracker${colors.reset}`);
  console.log(`${colors.bright}${title}${colors.reset}`);
  console.log('━'.repeat(50));
}

function printMenu(options) {
  options.forEach((option, index) => {
    console.log(`${colors.cyan}${index + 1}.${colors.reset} ${option}`);
  });
  console.log(`${colors.yellow}0. Back/Exit${colors.reset}`);
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(`${colors.bright}${question}${colors.reset} `, resolve);
  });
}

function askChoice(question, options) {
  return new Promise((resolve) => {
    console.log(`\n${question}`);
    printMenu(options);
    
    const askForChoice = async () => {
      const choice = await askQuestion('\nEnter your choice:');
      const num = parseInt(choice);
      
      if (num === 0) {
        resolve(null); // Back/Exit
      } else if (num >= 1 && num <= options.length) {
        resolve(num - 1); // Return index
      } else {
        console.log(`${colors.red}Invalid choice. Please try again.${colors.reset}`);
        askForChoice();
      }
    };
    
    askForChoice();
  });
}

// Screen functions
async function showHome() {
  clearScreen();
  printHeader('🏠 Home Screen');
  
  const options = [
    '🏌️ Start New Round',
    '📊 View Past Rounds', 
    '⚙️ Settings',
    '📈 App Statistics'
  ];
  
  const choice = await askChoice('What would you like to do?', options);
  
  switch(choice) {
    case 0: await showStartRound(); break;
    case 1: await showPastRounds(); break;
    case 2: await showSettings(); break;
    case 3: await showAppStats(); break;
    case null: 
      console.log(`\n${colors.green}Thanks for using SwingSense! 🏌️‍♂️${colors.reset}`);
      rl.close();
      return;
  }
  
  await showHome(); // Return to home
}

async function showStartRound() {
  clearScreen();
  printHeader('🏁 Start New Round');
  
  console.log('Let\'s set up your round:\n');
  
  const course = await askQuestion('Course name:') || 'Unknown Course';
  const holesInput = await askQuestion('Number of holes (9 or 18):');
  const holes = parseInt(holesInput) || 18;
  
  console.log('\nWeather conditions (select multiple):');
  const weatherOptions = ['Sunny', 'Cloudy', 'Windy', 'Calm', 'Hot', 'Cold', 'Humid', 'Dry'];
  const weatherChoice = await askChoice('Select weather:', weatherOptions);
  const weather = weatherChoice !== null ? [weatherOptions[weatherChoice]] : ['Unknown'];
  
  console.log('\n📋 Warm-up tracking:');
  const puttingMin = parseInt(await askQuestion('Minutes putting (0-60):')) || 0;
  const chippingMin = parseInt(await askQuestion('Minutes chipping (0-60):')) || 0;
  const rangeMin = parseInt(await askQuestion('Minutes at range (0-120):')) || 0;
  
  const warmup = {
    putting_min: puttingMin,
    chipping_min: chippingMin,
    range_min: rangeMin
  };
  
  // Create new round
  AppState.currentRound = Models.createRound(course, holes, weather, warmup);
  AppState.currentRound.startTime = Date.now();
  
  console.log(`\n${colors.green}✅ Round created!${colors.reset}`);
  console.log(`Course: ${course}`);
  console.log(`Holes: ${holes}`);
  console.log(`Weather: ${weather.join(', ')}`);
  console.log(`Warm-up total: ${puttingMin + chippingMin + rangeMin} minutes`);
  
  await askQuestion('\nPress Enter to start hole 1...');
  await startHole(1);
}

async function startHole(holeNumber) {
  // Create hole
  const par = parseInt(await askQuestion(`\nPar for hole ${holeNumber} (3-5):`)) || 4;
  AppState.currentHole = Models.createHole(holeNumber, par);
  AppState.currentHole.start_time = Date.now();
  AppState.currentRound.holes.push(AppState.currentHole);
  
  await showHole();
}

async function showHole() {
  if (!AppState.currentHole) return;
  
  clearScreen();
  printHeader(`⛳ Hole ${AppState.currentHole.hole} | Par ${AppState.currentHole.par}`);
  
  const shotCount = AppState.currentHole.shots.length;
  const timeOnHole = AppState.currentHole.start_time ? 
    Math.floor((Date.now() - AppState.currentHole.start_time) / 1000) : 0;
  
  console.log(`${colors.blue}Shots taken: ${shotCount}${colors.reset}`);
  console.log(`${colors.blue}Time on hole: ${Math.floor(timeOnHole / 60)}m ${timeOnHole % 60}s${colors.reset}`);
  
  if (shotCount > 0) {
    console.log(`\n${colors.yellow}Last shot:${colors.reset}`);
    const lastShot = AppState.currentHole.shots[shotCount - 1];
    console.log(`  Club: ${lastShot.club}`);
    console.log(`  Distance: ${lastShot.distance} yards`);
    console.log(`  Tempo: ${lastShot.tempo.ratio.toFixed(1)}:1`);
    console.log(`  Peak G: ${lastShot.peak_accel.toFixed(1)}`);
    console.log(`  Result: ${lastShot.miss}`);
  }
  
  const options = [
    '🏌️ Take a Swing',
    '⛳ Switch to Putting',
    '📊 Hole Summary',
    '➡️ Next Hole',
    '🏁 End Round'
  ];
  
  const choice = await askChoice('\nWhat\'s next?', options);
  
  switch(choice) {
    case 0: await takeSwing(); break;
    case 1: await showPutting(); break;
    case 2: await showHoleSummary(); break;
    case 3: await nextHole(); break;
    case 4: await endRound(); break;
    case null: return; // Back to home
  }
}

async function takeSwing() {
  console.log(`\n${colors.yellow}🏌️ Preparing for swing...${colors.reset}`);
  
  const clubs = ['Driver', '3-Wood', '5-Wood', '3-Iron', '4-Iron', '5-Iron', 
                '6-Iron', '7-Iron', '8-Iron', '9-Iron', 'PW', 'SW', 'Putter'];
  
  const clubChoice = await askChoice('Select club:', clubs);
  const club = clubChoice !== null ? clubs[clubChoice] : 'Driver';
  
  const lies = ['Tee', 'Fairway', 'Rough', 'Sand', 'Green', 'Out of Bounds'];
  const lieChoice = await askChoice('Current lie:', lies);
  const lie = lieChoice !== null ? lies[lieChoice] : 'Fairway';
  
  console.log(`\n${colors.green}🎯 Detecting swing...${colors.reset}`);
  
  // Simulate swing detection
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log(`${colors.bright}💥 SWING DETECTED!${colors.reset}`);
  
  // Create shot with realistic data
  const shot = Models.createShot(club, lie, 'Good Shot');
  shot.tempo.backswing_ms = 600 + Math.random() * 300;
  shot.tempo.downswing_ms = 200 + Math.random() * 100;
  shot.tempo.ratio = shot.tempo.backswing_ms / shot.tempo.downswing_ms;
  shot.peak_accel = 10 + Math.random() * 8;
  shot.distance = Math.floor(Math.random() * 200) + 50;
  
  console.log(`\n${colors.cyan}📊 Shot Analysis:${colors.reset}`);
  console.log(`  Tempo: ${shot.tempo.ratio.toFixed(1)}:1`);
  console.log(`  Peak G-Force: ${shot.peak_accel.toFixed(1)}`);
  // Don't show distance here - wait until next shot
  
  // Ask about result
  const misses = ['Good Shot', 'Left', 'Right', 'Short', 'Long', 'Chunked', 'Topped'];
  const missChoice = await askChoice('Shot result:', misses);
  shot.miss = missChoice !== null ? misses[missChoice] : 'Good Shot';
  
  AppState.currentHole.shots.push(shot);
  
  console.log(`\n${colors.green}✅ Shot recorded!${colors.reset}`);
  await askQuestion('Press Enter to continue...');
  
  await showHole();
}

async function showPutting() {
  clearScreen();
  printHeader(`⛳ Putting - Hole ${AppState.currentHole.hole}`);
  
  const girAnswer = await askQuestion('Hit green in regulation? (y/n):');
  AppState.currentHole.GIR = girAnswer.toLowerCase() === 'y';
  
  const putts = parseInt(await askQuestion('Number of putts:')) || 1;
  AppState.currentHole.putts = putts;
  
  if (putts > 0) {
    const distance = parseInt(await askQuestion('First putt distance (feet):')) || 10;
    AppState.currentHole.first_putt_distance_ft = distance;
  }
  
  console.log(`\n${colors.green}✅ Putting recorded!${colors.reset}`);
  console.log(`GIR: ${AppState.currentHole.GIR ? 'Yes' : 'No'}`);
  console.log(`Putts: ${putts}`);
  
  await askQuestion('Press Enter to continue...');
  await showHole();
}

async function showHoleSummary() {
  clearScreen();
  printHeader(`📊 Hole ${AppState.currentHole.hole} Summary`);
  
  const shots = AppState.currentHole.shots.length;
  const putts = AppState.currentHole.putts;
  const totalStrokes = shots + putts;
  const par = AppState.currentHole.par;
  const score = totalStrokes - par;
  
  console.log(`Par: ${par}`);
  console.log(`Total Strokes: ${totalStrokes} (${shots} shots + ${putts} putts)`);
  console.log(`Score: ${score > 0 ? '+' : ''}${score}`);
  console.log(`GIR: ${AppState.currentHole.GIR ? 'Yes' : 'No'}`);
  
  if (AppState.currentHole.shots.length > 0) {
    console.log('\n📋 Shot Details:');
    AppState.currentHole.shots.forEach((shot, i) => {
      console.log(`  ${i + 1}. ${shot.club} - ${shot.distance}yd - ${shot.lie} - ${shot.miss}`);
    });
  }
  
  await askQuestion('\nPress Enter to continue...');
}

async function nextHole() {
  if (!AppState.currentHole) return;
  
  AppState.currentHole.completed = true;
  AppState.currentHole.end_time = Date.now();
  
  const nextHoleNum = AppState.currentHole.hole + 1;
  
  if (nextHoleNum > AppState.currentRound.totalHoles) {
    console.log(`\n${colors.green}🏁 Round complete!${colors.reset}`);
    await endRound();
    return;
  }
  
  console.log(`\n${colors.blue}Moving to hole ${nextHoleNum}...${colors.reset}`);
  await startHole(nextHoleNum);
}

async function endRound() {
  if (!AppState.currentRound) return;
  
  AppState.currentRound.completed = true;
  AppState.currentRound.endTime = Date.now();
  AppState.currentRound.duration_sec = Math.floor(
    (AppState.currentRound.endTime - AppState.currentRound.startTime) / 1000
  );
  
  Storage.saveRound(AppState.currentRound);
  
  await showRoundSummary();
}

async function showRoundSummary() {
  clearScreen();
  printHeader('🏁 Round Complete!');
  
  const round = AppState.currentRound;
  const totalStrokes = round.holes.reduce((total, hole) => 
    total + hole.shots.length + hole.putts, 0
  );
  const totalPar = round.holes.reduce((total, hole) => total + hole.par, 0);
  const score = totalStrokes - totalPar;
  const gir = round.holes.filter(hole => hole.GIR).length;
  const girPercent = ((gir / round.holes.length) * 100).toFixed(1);
  
  console.log(`Course: ${round.course}`);
  console.log(`Date: ${new Date(round.date).toLocaleDateString()}`);
  console.log(`Duration: ${Math.floor(round.duration_sec / 60)} minutes`);
  console.log(`Weather: ${round.weather.join(', ')}`);
  console.log('');
  console.log(`${colors.bright}📊 SCORECARD${colors.reset}`);
  console.log(`Total Strokes: ${totalStrokes}`);
  console.log(`Par: ${totalPar}`);
  console.log(`Score: ${score > 0 ? '+' : ''}${score}`);
  console.log(`GIR: ${gir}/${round.holes.length} (${girPercent}%)`);
  
  console.log(`\n${colors.bright}🔥 HOLE BY HOLE${colors.reset}`);
  round.holes.forEach(hole => {
    const strokes = hole.shots.length + hole.putts;
    const holeScore = strokes - hole.par;
    console.log(`Hole ${hole.hole}: ${strokes} (${holeScore > 0 ? '+' : ''}${holeScore})`);
  });
  
  console.log(`\n${colors.green}🎉 Great round! Data saved successfully.${colors.reset}`);
  
  AppState.currentRound = null;
  AppState.currentHole = null;
  
  await askQuestion('\nPress Enter to continue...');
}

async function showPastRounds() {
  clearScreen();
  printHeader('📊 Past Rounds');
  
  const rounds = Storage.getRoundsList();
  
  if (rounds.length === 0) {
    console.log('No rounds found. Play a round first!');
    await askQuestion('\nPress Enter to continue...');
    return;
  }
  
  console.log(`Found ${rounds.length} round(s):\n`);
  
  rounds.forEach((round, i) => {
    const date = new Date(round.date).toLocaleDateString();
    console.log(`${i + 1}. ${round.course} - ${date}`);
    console.log(`   ${round.totalStrokes} strokes, ${round.totalHoles} holes`);
    console.log(`   Status: ${round.completed ? 'Complete' : 'In Progress'}`);
    console.log('');
  });
  
  await askQuestion('Press Enter to continue...');
}

async function showSettings() {
  clearScreen();
  printHeader('⚙️ Settings');
  
  console.log('Current Settings:');
  console.log(`Units: ${AppState.settings.units}`);
  console.log(`Auto GPS: ${AppState.settings.autoGPS ? 'On' : 'Off'}`);
  console.log(`Swing Sensitivity: ${AppState.settings.swingSensitivity}`);
  console.log(`Vibration Feedback: ${AppState.settings.vibrationFeedback ? 'On' : 'Off'}`);
  
  const options = [
    'Change Units',
    'Toggle Auto GPS',
    'Change Sensitivity',
    'Toggle Vibration',
    'Clear All Data'
  ];
  
  const choice = await askChoice('\nWhat would you like to change?', options);
  
  switch(choice) {
    case 0:
      AppState.settings.units = AppState.settings.units === 'yards' ? 'meters' : 'yards';
      console.log(`\n${colors.green}Units changed to: ${AppState.settings.units}${colors.reset}`);
      break;
    case 1:
      AppState.settings.autoGPS = !AppState.settings.autoGPS;
      console.log(`\n${colors.green}Auto GPS: ${AppState.settings.autoGPS ? 'On' : 'Off'}${colors.reset}`);
      break;
    case 2:
      const sensitivities = ['low', 'medium', 'high'];
      const sensChoice = await askChoice('Select sensitivity:', sensitivities);
      if (sensChoice !== null) {
        AppState.settings.swingSensitivity = sensitivities[sensChoice];
        console.log(`\n${colors.green}Sensitivity: ${AppState.settings.swingSensitivity}${colors.reset}`);
      }
      break;
    case 3:
      AppState.settings.vibrationFeedback = !AppState.settings.vibrationFeedback;
      console.log(`\n${colors.green}Vibration: ${AppState.settings.vibrationFeedback ? 'On' : 'Off'}${colors.reset}`);
      break;
    case 4:
      const confirm = await askQuestion('Clear all data? (yes/no):');
      if (confirm.toLowerCase() === 'yes') {
        mockStorage.data = {};
        console.log(`\n${colors.red}All data cleared!${colors.reset}`);
      }
      break;
  }
  
  if (choice !== null) {
    mockStorage.writeJSON('swingsense.json', AppState.settings);
    await askQuestion('\nPress Enter to continue...');
  }
}

async function showAppStats() {
  clearScreen();
  printHeader('📈 App Statistics');
  
  const rounds = Storage.getRoundsList();
  const totalRounds = rounds.length;
  const completedRounds = rounds.filter(r => r.completed).length;
  
  console.log(`Total rounds: ${totalRounds}`);
  console.log(`Completed rounds: ${completedRounds}`);
  
  if (completedRounds > 0) {
    const avgStrokes = rounds
      .filter(r => r.completed)
      .reduce((sum, r) => sum + r.totalStrokes, 0) / completedRounds;
    
    console.log(`Average score: ${avgStrokes.toFixed(1)} strokes`);
  }
  
  console.log(`\nStorage files: ${Object.keys(mockStorage.data).length}`);
  console.log(`App version: ${AppState.version}`);
  
  await askQuestion('\nPress Enter to continue...');
}

// Initialize and start
async function init() {
  console.log(`${colors.bright}${colors.green}`);
  console.log('⛳🏌️‍♂️ SwingSense Golf Tracker - Terminal Edition 🏌️‍♀️⛳');
  console.log('=====================================================');
  console.log(`${colors.reset}`);
  console.log('Welcome to the interactive golf tracking experience!');
  console.log('This is a full-featured test of your Bangle.js app.\n');
  
  await askQuestion('Press Enter to start...');
  await showHome();
}

// Start the app
init().catch(console.error); 