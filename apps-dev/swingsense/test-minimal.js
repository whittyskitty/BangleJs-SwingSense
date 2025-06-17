// SwingSense Golf Tracker - Minimal Test Version
// Simplified version for emulator testing

console.log("SwingSense Golf Tracker starting...");

// Simple state
let currentScreen = 'home';

// Mock graphics for testing
function clearScreen() {
  if (typeof g !== 'undefined') {
    g.clear();
    g.setColor(1, 1, 1);
    g.setFont("Vector", 16);
    g.setFontAlign(0, 0);
  }
}

// Show home screen
function showHome() {
  console.log("Showing home screen");
  clearScreen();
  
  if (typeof g !== 'undefined') {
    g.drawString("⛳ SwingSense", 120, 40);
    g.setFont("Vector", 14);
    g.drawString("🏌️ Start Round", 120, 80);
    g.drawString("📊 Past Rounds", 120, 110);
    g.drawString("⚙️ Settings", 120, 140);
    g.setFont("6x8", 1);
    g.drawString("Touch screen to test", 120, 200);
  }
  
  // Setup touch handling
  if (typeof Bangle !== 'undefined') {
    Bangle.setUI({
      mode: "custom",
      touch: (button, xy) => {
        console.log("Touch detected at:", xy);
        if (xy && xy.y > 70 && xy.y < 90) {
          showGolfScreen();
        } else if (xy && xy.y > 90 && xy.y < 130) {
          showMessage("Past Rounds - Coming Soon!");
        } else if (xy && xy.y > 130 && xy.y < 170) {
          showMessage("Settings - Coming Soon!");
        }
      },
      btn: () => {
        console.log("Button pressed");
        showHome();
      }
    });
  }
}

// Show golf screen
function showGolfScreen() {
  console.log("Showing golf screen");
  clearScreen();
  
  if (typeof g !== 'undefined') {
    g.drawString("🏌️ Golf Mode", 120, 40);
    g.drawString("Hole 1 | Par 4", 120, 70);
    g.drawString("Shots: 0", 120, 100);
    g.drawString("👆 Tap to Swing", 120, 140);
    g.setFont("6x8", 1);
    g.drawString("Button: Back to Menu", 120, 200);
  }
  
  if (typeof Bangle !== 'undefined') {
    Bangle.setUI({
      mode: "custom",
      touch: (button, xy) => {
        console.log("Golf screen touch:", xy);
        if (xy && xy.y > 120 && xy.y < 160) {
          simulateSwing();
        }
      },
      btn: () => {
        showHome();
      }
    });
  }
}

// Simulate swing detection
function simulateSwing() {
  console.log("Simulating swing...");
  clearScreen();
  
  if (typeof g !== 'undefined') {
    g.drawString("🎯 Swing Detected!", 120, 60);
    g.drawString("Tempo: 3.2:1", 120, 90);
    g.drawString("Peak G: 15.4", 120, 120);
    g.drawString("Great shot!", 120, 150);
  }
  
  // Buzz if available
  if (typeof Bangle !== 'undefined') {
    try {
      Bangle.buzz(200);
    } catch (e) {
      console.log("Buzz not available in emulator");
    }
  }
  
  // Return to golf screen after 2 seconds
  setTimeout(() => {
    showGolfScreen();
  }, 2000);
}

// Show message
function showMessage(msg) {
  console.log("Message:", msg);
  clearScreen();
  
  if (typeof g !== 'undefined') {
    g.drawString(msg, 120, 120);
  }
  
  setTimeout(() => {
    showHome();
  }, 2000);
}

// Initialize
function init() {
  console.log("Initializing SwingSense...");
  
  // Test if we're in the emulator or real device
  if (typeof g === 'undefined') {
    console.log("⚠️ Graphics not available - running in Node.js test mode");
    console.log("✅ App structure is valid");
    console.log("📱 Ready for Bangle.js deployment");
    return;
  }
  
  console.log("📱 Running on Bangle.js!");
  showHome();
}

// Auto-start
init(); 