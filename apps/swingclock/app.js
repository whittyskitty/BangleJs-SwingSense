let refGyro = null;

function getAngle(gyro) {
  // For simplicity, track wrist rotation around z-axis (yaw)
  return gyro.z * 180 / Math.PI;
}

function draw(angle) {
  g.clear();
  g.setFont("6x8", 3);
  g.setFontAlign(0, 0);
  g.drawString(Math.round(angle) + "°", g.getWidth() / 2, g.getHeight() / 2);
}

// Set BTN1 to capture reference angle (your setup address)
setWatch(() => {
  let gyro = Bangle.getGyro().read();
  refGyro = getAngle(gyro);
  Bangle.buzz();
  g.clear();
  g.setFont("6x8", 2);
  g.setFontAlign(0, 0);
  g.drawString("Zeroed", g.getWidth() / 2, g.getHeight() / 2);
}, BTN1, { repeat: true, edge: "rising" });

// Update screen with live angle difference
setInterval(() => {
  if (refGyro === null) return;

  let gyro = Bangle.getGyro().read();
  let current = getAngle(gyro);
  let delta = current - refGyro;

  draw(delta);
}, 100);

// Startup text
g.clear();
g.setFont("6x8", 2);
g.setFontAlign(0, 0);
g.drawString("Press BTN1 to Zero", g.getWidth() / 2, g.getHeight() / 2);
