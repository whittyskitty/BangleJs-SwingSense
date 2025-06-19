// Load settings
let settings = require('Storage').readJSON('swingclock.json', true) || {
  updateInterval: 100,
  fontSize: 'large',
  showReference: false,
  vibrationFeedback: true,
  autoZero: false
};

let refGyro = null;

function getAngle(gyro) {
  // For simplicity, track wrist rotation around z-axis (yaw)
  return gyro.z * 180 / Math.PI;
}

function getFontSize() {
  switch(settings.fontSize) {
    case 'small': return 2;
    case 'medium': return 3;
    case 'large': return 4;
    default: return 3;
  }
}

function draw(angle) {
  g.clear();
  g.setFont("6x8", getFontSize());
  g.setFontAlign(0, 0);
  
  let displayText = Math.round(angle) + "°";
  
  // Show reference angle if enabled
  if (settings.showReference && refGyro !== null) {
    g.drawString("Ref: " + Math.round(refGyro) + "°", g.getWidth() / 2, g.getHeight() / 2 - 20);
    g.drawString(displayText, g.getWidth() / 2, g.getHeight() / 2 + 20);
  } else {
    g.drawString(displayText, g.getWidth() / 2, g.getHeight() / 2);
  }
}

// Set BTN1 to capture reference angle (your setup address)
setWatch(() => {
  let gyro = Bangle.getGyro().read();
  refGyro = getAngle(gyro);
  
  if (settings.vibrationFeedback) {
    Bangle.buzz();
  }
  
  g.clear();
  g.setFont("6x8", 2);
  g.setFontAlign(0, 0);
  g.drawString("Zeroed", g.getWidth() / 2, g.getHeight() / 2);
}, BTN1, { repeat: true, edge: "rising" });

// Auto-zero on start if enabled
if (settings.autoZero) {
  let gyro = Bangle.getGyro().read();
  refGyro = getAngle(gyro);
}

// Update screen with live angle difference
setInterval(() => {
  if (refGyro === null) return;

  let gyro = Bangle.getGyro().read();
  let current = getAngle(gyro);
  let delta = current - refGyro;

  draw(delta);
}, settings.updateInterval);

// Startup text
g.clear();
g.setFont("6x8", 2);
g.setFontAlign(0, 0);
g.drawString("Press BTN1 to Zero", g.getWidth() / 2, g.getHeight() / 2);
