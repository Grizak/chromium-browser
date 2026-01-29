# Browser Repository

A dev-focused browser built on top of Chromium with custom patches and enhancements.

## Overview

This repository contains the source code and build configuration for our custom browser. Rather than committing the entire Chromium codebase, we maintain a lightweight patch-based system that applies our modifications at build time.

**Key features:**

- Custom UI/UX built on Chromium
- Developer-focused tools and enhancements
- Lightweight repository (only patches tracked in Git)
- Easy to reproduce builds across teams

## Prerequisites

Before getting started, ensure you have the following installed:

- **Git** - Version control
- **Node.js** - Runtime environment
- **pnpm** - Package manager (your project uses this)
- **Disk space** - At least 30GB free (15-20GB for Chromium + build artifacts)
- **Internet connection** - Stable connection for cloning Chromium

### Build Dependencies

Depending on your operating system, you'll also need:

**macOS:**

```bash
xcode-select --install
```

**Linux (Ubuntu/Debian):**

```bash
sudo apt-get install build-essential python3 curl git
```

**Windows:**

- Visual Studio Build Tools or Visual Studio Community (with C++ workload)
- Python 3

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourname/browser-repo.git
cd browser-repo
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Chromium and Apply Patches

```bash
pnpm run setup
```

This will:

- Clone the latest Chromium source
- Apply all patches from the `patches/` directory
- Validate the setup

### 4. Build the Browser

Use autoninja and GN from the [depot tools](https://chromium.googlesource.com/chromium/tools/depot_tools) to build the browser

## Development Workflow

### Making Changes to Chromium

When you need to modify Chromium source code:

1. **Make your changes** in the `chromium/` directory and commit your changes (the create-patches.sh script only creates patches from commits, not uncommited files):

   ```bash
   cd chromium
   # Edit files...
   git add .
   git commit -m "Your changes"
   ```

2. **Create a patch** from your changes:

   ```bash
   pnpm create-patch "descriptive-name"
   ```

   This will generate a numbered patch file like `patches/001-descriptive-name.patch` from the changes between HEAD and the commit before HEAD from the git repo in `$project_root/chromium`

3. **Commit the patch** to the main repository:
   ```bash
   git add patches/
   git commit -m "Add descriptive-name patch"
   git push
   ```

### Applying Patches

You can apply patches with the `pnpm apply-patches` command:

```bash
pnpm apply-patches
```

### Reviewing Patches

To see what a specific patch contains:

```bash
cat patches/001-your-patch.patch
```

To see all patches applied:

```bash
ls -la patches/
```

## Project Structure

```
.
├── patches/                 # Custom Chromium patches
│   ├── 001-feature-name.patch
│   ├── 002-another-feature.patch
│   └── ...
├── scripts/
│   ├── setup-build.ts       # Main setup script
│   └── create-patch.sh      # Patch creation helper
├── chromium/                # Chromium source (git ignored), holds another git repo that is the actual chromium repo (commit to this repo before creating patches)
├── package.json
├── .gitignore
└── README.md
```

## Available Commands

```bash
# Set up Chromium and apply patches
pnpm run setup

# Create a new patch from Chromium modifications
pnpm create-patch "patch-name"

# Only apply patches
pnpm apply-patches
```

## Updating Chromium

The setup script automatically fetches the latest Chromium from the main branch. To update:

```bash
pnpm run setup
```

This will fetch the latest changes and reapply all patches. If a patch fails to apply, it means it's incompatible with the new Chromium version and will need to be updated.

## Troubleshooting

### Patches fail to apply

**Issue:** `git apply` fails when running `pnpm run setup`

**Solution:** Patches are version-specific to Chromium. When updating Chromium, some patches may conflict. You'll need to:

1. Manually update the Chromium source in `chromium/`
2. Resolve the conflicts
3. Regenerate the patch: `pnpm create-patch "patch-name"`

### Chromium directory is corrupted

**Issue:** Build fails due to Git state issues in `chromium/`

**Solution:** Delete and reinitialize:

```bash
rm -rf chromium
pnpm run setup
```

### Out of disk space

**Issue:** Setup fails because there's not enough disk space

**Solution:** Chromium requires 15-20GB. Free up space and try again.

### Network issues during clone

**Issue:** Clone times out or fails mid-transfer

**Solution:** The Chromium repository is large. Try again with a stable connection, or consider using a faster network if available.

## Contributing

When adding new features or fixes to Chromium:

1. Make your changes in the `chromium/` directory
2. Test thoroughly
3. Create a patch: `pnpm create-patch "feature-name"`
4. Commit the patch to this repository
5. Push to your branch and create a pull request

**Patch naming conventions:**

- Use lowercase with hyphens: `001-feature-name.patch`
- Be descriptive: `001-dev-tools-sidebar.patch`
- Patches are applied in numerical order

## Performance Tips

- **First setup is slow:** Cloning Chromium takes time depending on your connection (10-30 minutes)
- **Build takes time:** Initial builds can take 1-2 hours. Incremental rebuilds are faster
- **Use SSD:** Building on an SSD is significantly faster than HDD
- **Parallel builds:** Most build systems use multiple cores by default

## Git Configuration

No special Git configuration is required. Standard setup:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## License

MIT License

## Support

For issues, questions, or contributions, please open an issue or contact the team.
