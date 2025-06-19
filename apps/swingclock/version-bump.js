#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Version increment function
function incrementVersion(version, incrementType = 'patch') {
  const parts = version.split('.').map(Number);
  
  switch (incrementType) {
    case 'major':
      parts[0]++;
      parts[1] = 0;
      parts[2] = 0;
      break;
    case 'minor':
      parts[1]++;
      parts[2] = 0;
      break;
    case 'patch':
    default:
      parts[2]++;
      break;
  }
  
  return parts.join('.');
}

// Update version in app.js
function updateAppJsVersion(newVersion) {
  const appJsPath = path.join(__dirname, 'app.js');
  let content = fs.readFileSync(appJsPath, 'utf8');
  
  // Update the version in AppState
  content = content.replace(
    /version:\s*["']([^"']+)["']/,
    `version: "${newVersion}"`
  );
  
  fs.writeFileSync(appJsPath, content);
  console.log(`✅ Updated app.js version to ${newVersion}`);
}

// Update version in metadata.json
function updateMetadataVersion(newVersion) {
  const metadataPath = path.join(__dirname, 'metadata.json');
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  
  metadata.version = newVersion;
  
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 4));
  console.log(`✅ Updated metadata.json version to ${newVersion}`);
}

// Get current version from app.js
function getCurrentVersion() {
  const appJsPath = path.join(__dirname, 'app.js');
  const content = fs.readFileSync(appJsPath, 'utf8');
  const match = content.match(/version:\s*["']([^"']+)["']/);
  return match ? match[1] : '0.1.0';
}

// Main function
function main() {
  const incrementType = process.argv[2] || 'patch'; // patch, minor, or major
  const currentVersion = getCurrentVersion();
  const newVersion = incrementVersion(currentVersion, incrementType);
  
  console.log(`🔄 Bumping version from ${currentVersion} to ${newVersion} (${incrementType})`);
  
  try {
    updateAppJsVersion(newVersion);
    updateMetadataVersion(newVersion);
    console.log(`🎉 Version bumped successfully to ${newVersion}`);
  } catch (error) {
    console.error('❌ Error updating version:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { incrementVersion, updateAppJsVersion, updateMetadataVersion }; 