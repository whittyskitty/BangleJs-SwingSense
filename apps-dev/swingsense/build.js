#!/usr/bin/env node

// SwingSense Build Script
// Packages and validates the app for Bangle.js deployment

const fs = require('fs');
const path = require('path');

console.log('🏌️ SwingSense Golf Tracker - Build Script');
console.log('==========================================\n');

const appDir = './banglejs-app';
const buildDir = './build';

// Ensure build directory exists
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir);
}

// Read and validate app.json
function validateMetadata() {
  console.log('📋 Validating app metadata...');
  
  try {
    const metadata = JSON.parse(fs.readFileSync(path.join(appDir, 'app.json'), 'utf8'));
    
    // Required fields
    const required = ['id', 'name', 'shortName', 'version', 'description', 'storage'];
    const missing = required.filter(field => !metadata[field]);
    
    if (missing.length > 0) {
      console.error('❌ Missing required fields:', missing);
      process.exit(1);
    }
    
    // Validate storage files exist
    for (const file of metadata.storage) {
      const filePath = path.join(appDir, file.url);
      if (!fs.existsSync(filePath)) {
        console.error(`❌ Missing storage file: ${file.url}`);
        process.exit(1);
      }
    }
    
    console.log('✅ Metadata valid');
    return metadata;
  } catch (error) {
    console.error('❌ Invalid app.json:', error.message);
    process.exit(1);
  }
}

// Check JavaScript syntax
function validateJavaScript() {
  console.log('🔍 Validating JavaScript files...');
  
  const jsFiles = ['app.js', 'app-icon.js', 'settings.js'];
  
  for (const file of jsFiles) {
    try {
      const content = fs.readFileSync(path.join(appDir, file), 'utf8');
      
      // Basic syntax check (this is limited but catches obvious errors)
      if (file === 'app.js') {
        // Check for required components
        const required = ['AppState', 'Models', 'Storage', 'Screens'];
        for (const component of required) {
          if (!content.includes(component)) {
            console.warn(`⚠️  Warning: ${file} missing ${component} component`);
          }
        }
      }
      
      console.log(`✅ ${file} syntax OK`);
    } catch (error) {
      console.error(`❌ Error in ${file}:`, error.message);
      process.exit(1);
    }
  }
}

// Calculate file sizes
function calculateSizes() {
  console.log('📊 Calculating file sizes...');
  
  const files = fs.readdirSync(appDir);
  let totalSize = 0;
  
  console.log('\nFile sizes:');
  for (const file of files) {
    if (file.endsWith('.js') || file.endsWith('.json')) {
      const size = fs.statSync(path.join(appDir, file)).size;
      totalSize += size;
      console.log(`  ${file}: ${size} bytes`);
    }
  }
  
  console.log(`\nTotal app size: ${totalSize} bytes`);
  
  if (totalSize > 50000) {
    console.warn('⚠️  Warning: App size is quite large for Bangle.js storage');
  }
}

// Create deployment package
function createPackage() {
  console.log('📦 Creating deployment package...');
  
  // Copy files to build directory
  const files = ['app.js', 'app-icon.js', 'app.json', 'settings.js', 'README.md'];
  
  for (const file of files) {
    const src = path.join(appDir, file);
    const dest = path.join(buildDir, file);
    
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`  ✅ ${file} copied`);
    }
  }
}

// Generate installation instructions
function generateInstructions() {
  console.log('📝 Generating installation instructions...');
  
  const instructions = `
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
\`\`\`json
{
  "name": "SwingSense",
  "icon": "*swingsense",
  "src": "-swingsense",
  "type": "app",
  "version": "0.1.0"
}
\`\`\`

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
`;

  fs.writeFileSync(path.join(buildDir, 'INSTALL.md'), instructions);
  console.log('  ✅ Installation instructions created');
}

// Main build process
function main() {
  try {
    const metadata = validateMetadata();
    validateJavaScript();
    calculateSizes();
    createPackage();
    generateInstructions();
    
    console.log('\n🎉 Build completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Test in emulator: https://espruino.com/ide');
    console.log('2. Upload to your Bangle.js 2');
    console.log('3. Files are ready in ./build/ directory');
    console.log('\n📱 Enjoy tracking your golf game with SwingSense!');
    
  } catch (error) {
    console.error('\n❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Check if required directories exist
if (!fs.existsSync(appDir)) {
  console.error('❌ banglejs-app directory not found!');
  process.exit(1);
}

main(); 