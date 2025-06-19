# Version Management for swingclock

This app includes automatic version management that increments the version with each commit.

## How It Works

### Automatic Version Bumping
- **Pre-commit Hook**: Automatically runs before each commit
- **Increments**: Patch version (0.1.0 → 0.1.1 → 0.1.2, etc.)
- **Files Updated**: Both `app.js` and `metadata.json`

### Version Format
- **Semantic Versioning**: `MAJOR.MINOR.PATCH`
- **Example**: `0.1.0`, `0.1.1`, `0.2.0`, `1.0.0`

## Manual Version Management

### Using npm scripts (recommended)
```bash
# Increment patch version (0.1.0 → 0.1.1)
npm run version:patch

# Increment minor version (0.1.0 → 0.2.0)
npm run version:minor

# Increment major version (0.1.0 → 1.0.0)
npm run version:major

# Show current version
npm run version:show
```

### Using the script directly
```bash
# Increment patch version
node version-bump.js patch

# Increment minor version
node version-bump.js minor

# Increment major version
node version-bump.js major
```

## Version Types

### Patch (0.1.0 → 0.1.1)
- Bug fixes
- Minor improvements
- Documentation updates
- **Auto-incremented on every commit**

### Minor (0.1.0 → 0.2.0)
- New features
- Backward-compatible changes
- **Manual increment when needed**

### Major (0.1.0 → 1.0.0)
- Breaking changes
- Major feature releases
- **Manual increment when needed**

## Files Updated

The version bump script updates these files:
1. **`app.js`**: Updates `AppState.version`
2. **`metadata.json`**: Updates the `version` field

## Git Integration

### Pre-commit Hook
- Located at `.git/hooks/pre-commit`
- Automatically runs when committing swingclock files
- Increments patch version
- Stages updated files for commit

### Disabling Auto-bump
To commit without version bump:
```bash
git commit --no-verify
```

## Troubleshooting

### Hook not working
```bash
# Make sure the hook is executable
chmod +x .git/hooks/pre-commit

# Check if Node.js is available
node --version
```

### Manual version reset
If you need to reset to a specific version:
```bash
# Edit app.js and metadata.json manually
# Then commit the changes
```

## Best Practices

1. **Let the hook handle patch versions** - Don't manually edit patch versions
2. **Use manual commands for minor/major** - Use `npm run version:minor` or `npm run version:major`
3. **Commit frequently** - Each commit will auto-increment the patch version
4. **Review version changes** - Check the diff before committing

## Example Workflow

```bash
# Make changes to the app
# Edit app.js, add features, etc.

# Commit changes (version auto-bumps)
git add .
git commit -m "Add back button to all screens"

# Version is now 0.1.1

# Add a new feature
# Edit app.js

# Commit again (version auto-bumps)
git commit -m "Add putting mode screen"

# Version is now 0.1.2

# Release a new feature set
npm run version:minor
git add .
git commit -m "Release v0.2.0 - Complete UI navigation"

# Version is now 0.2.0
``` 