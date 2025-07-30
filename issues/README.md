# NextShift Issues from TODO.md

This directory contains GitHub issue templates and automation scripts for the 15 planned features from TODO.md.

## What's Included

### 📁 Files
- **Individual Issue Files**: `issue-01-*.md` through `issue-15-*.md` - Complete GitHub issue templates
- **Automation Script**: `create-issues.sh` - Uses `gh` CLI to create all issues
- **Structured Data**: `issues-data.json` - JSON export of all issue information

## 🚀 Usage

### Automated Creation (Recommended)
```bash
cd issues/
./create-issues.sh
```

### Manual Creation
```bash
gh issue create --title "Export Schedule Feature" \
  --body-file "issues/issue-01-export-schedule-feature.md" \
  --label "enhancement,todo-item,priority:high,feature:export" \
  --milestone "v3.3.0"
```

## 📊 Issue Summary

**Total**: 15 issues organized by priority
- **High Priority (v3.3.0)**: 4 issues - Export, Keyboard Shortcuts, Version Fix, TeamSelector
- **Medium Priority (v3.4.0)**: 6 issues - List Groups, Modal Enhancements, Error Boundaries, etc.
- **Future (v4.0.0)**: 5 issues - Mobile Carousel, Notifications, Accessibility, Multi-Roster, Action Button

## Prerequisites

The script requires:
- GitHub CLI (`gh`) installed and authenticated
- Repository milestones: `v3.3.0`, `v3.4.0`, `v4.0.0`
- Standard labels: `enhancement`, `todo-item`, priority/effort/feature labels