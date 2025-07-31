# 🚀 NextShift Deployment Guide

This document explains how NextShift handles deployments, PR previews, and version management.

## 📋 Deployment Overview

NextShift uses a **tag-based deployment system** that ensures only properly reviewed and tested code reaches production.

### 🎯 Key Principles

- ✅ **Production deployments only happen on release tags** (never on main branch pushes)
- ✅ **All deployments run full CI pipeline** (linting, testing, building)
- ✅ **Version numbers are automatically extracted** from git tags
- ✅ **PR previews are available** as downloadable artifacts

## 🏷️ Production Deployment Process

### 1. Tag-Based Deployment

Production deployments to GitHub Pages **only** happen when you push a version tag:

```bash
# Create and push a new version tag
git tag v1.2.3
git push origin v1.2.3
```

**What happens automatically:**
1. 🔍 GitHub Actions detects the new tag
2. 📦 Extracts version number (removes 'v' prefix: `v1.2.3` → `1.2.3`)
3. 🔧 Updates `package.json` to match the tag version
4. 🧪 Runs complete CI pipeline (lint, test, build)
5. 🚀 Deploys to GitHub Pages if all checks pass
6. ✅ Verifies deployment is accessible

### 2. Manual Deployment (Emergency)

You can also trigger deployments manually from the GitHub Actions tab:

1. Go to **Actions** → **Deploy NextShift PWA to GitHub Pages**
2. Click **Run workflow**
3. Optionally specify a version number
4. Click **Run workflow**

## 🔍 PR Preview System

### How PR Previews Work

Every PR gets an automatic preview build that you can download and test locally:

1. **Automatic trigger**: When you open/update a PR that changes code
2. **Quality checks**: Full CI pipeline runs (lint, test, build)
3. **Preview build**: Creates a downloadable artifact with:
   - Version: `PR-{number}-{commit-sha}`
   - Metadata: PR info, build time, author
   - Title: `[PR Preview] NextShift`

### 📥 Testing a PR Preview

1. **Go to the PR**: Navigate to your pull request
2. **Find the preview comment**: Look for the "📦 PR Preview Build" comment
3. **Download artifact**: Click the Actions link and download the preview
4. **Test locally**: Extract and serve with any static server:
   ```bash
   # Extract the downloaded artifact
   unzip nextshift-pr-{number}-preview.zip
   
   # Serve locally (choose one)
   npx serve dist
   python -m http.server 8000 -d dist
   php -S localhost:8000 -t dist
   ```

### 🚫 Why Not Live PR Previews?

GitHub Pages only supports **one deployment at a time**, so we can't have live preview URLs for each PR. However, the artifact-based approach provides:

- ✅ **Full testing capability** - same as live deployment
- ✅ **No interference** with production site
- ✅ **Security** - no untested code on live domains
- ✅ **Controlled testing** - you choose when and how to test

### 🌐 Alternative Solutions for Live Previews

If you need live PR preview URLs, consider these alternatives:

1. **Netlify Deploy Previews**: Connect your repo to Netlify for automatic PR previews
2. **Vercel**: Similar to Netlify, provides automatic PR previews
3. **Surge.sh**: Can be integrated with GitHub Actions for per-PR deployments
4. **Custom solution**: Use GitHub Actions to deploy to different domains/subdomains

## 🔢 Version Management

### How Versioning Works

1. **Source of truth**: Git tags (semantic versioning: `v1.2.3`)
2. **Automatic injection**: Version is available in the app as `CONFIG.VERSION`
3. **Build-time replacement**: Vite replaces `__APP_VERSION__` with the actual version
4. **Runtime access**: Components can display version using `CONFIG.VERSION`

### Version Flow

```
Git Tag (v1.2.3) 
    ↓
GitHub Actions extracts version (1.2.3)
    ↓
Updates package.json
    ↓
Vite build injects into app (__APP_VERSION__)
    ↓
Runtime: CONFIG.VERSION = "1.2.3"
```

### 📝 Version Display in App

The version is automatically shown in:
- **About modal**: Shows current version
- **Settings panel**: Version info
- **Service worker**: For cache management

## 🔄 Recommended Workflow

### For Feature Development

1. **Create feature branch**: `git checkout -b feature/my-feature`
2. **Develop and test**: Make your changes
3. **Create PR**: Push branch and open pull request
4. **Test PR preview**: Download and test the preview build
5. **Review and merge**: After approval, merge to main

### For Releases

1. **Ensure main is ready**: All features merged and tested
2. **Create release tag**: `git tag v1.2.3 && git push origin v1.2.3`
3. **Monitor deployment**: Watch the Actions tab for deployment status
4. **Verify live site**: Test the deployed version

### 🏷️ Semantic Versioning

Follow [semantic versioning](https://semver.org/) for tags:

- **Major** (`v2.0.0`): Breaking changes
- **Minor** (`v1.2.0`): New features (backward compatible)
- **Patch** (`v1.1.1`): Bug fixes (backward compatible)

## 🔧 Troubleshooting

### ❌ Deployment Failed

1. **Check Actions tab**: Look for error messages
2. **Common issues**:
   - Linting errors → Fix code quality issues
   - Test failures → Fix failing tests
   - Build errors → Check TypeScript/build configuration
   - Tag format → Ensure tag matches `v*.*.*` pattern

### ❌ PR Preview Not Generated

1. **Check if PR changes code**: Previews only generate for code changes
2. **Check Actions tab**: Look for workflow runs
3. **Draft PRs**: Previews are skipped for draft PRs

### ❌ Wrong Version Displayed

1. **Check tag format**: Must be `v1.2.3` (with 'v' prefix)
2. **Clear browser cache**: Hard refresh the deployed site
3. **Wait for propagation**: GitHub Pages can take a few minutes

## 📚 Related Documentation

- [GitHub Actions Workflows](.github/workflows/)
- [Vite Configuration](vite.config.ts)
- [Version Constants](src/utils/config.ts)
- [PWA Configuration](public/manifest.webmanifest)

## 🆘 Need Help?

If you encounter issues with the deployment system:

1. **Check existing issues**: [GitHub Issues](https://github.com/tjorim/NextShift/issues)
2. **Create new issue**: Use the bug report template
3. **Include details**: Workflow run links, error messages, steps to reproduce

---

*This deployment system ensures reliable, tested releases while providing comprehensive preview capabilities for development.*