#!/bin/bash

# GitHub Issue Creation Script for NextShift TODO Items
# This script creates 15 GitHub issues based on the TODO.md roadmap
# 
# Prerequisites:
# 1. GitHub CLI (gh) must be installed and authenticated
# 2. Repository must have appropriate labels and milestones
# 3. You must have write access to the repository

set -e  # Exit on any error

echo "🚀 NextShift TODO Issues Creation Script"
echo "========================================"
echo

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ Error: GitHub CLI (gh) is not installed."
    echo "   Please install it from: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Error: GitHub CLI is not authenticated."
    echo "   Please run: gh auth login"
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not in a git repository."
    echo "   Please run this script from the NextShift repository root."
    exit 1
fi

echo "✅ Prerequisites check passed"
echo

# Ask for confirmation
echo "This script will create 15 GitHub issues for NextShift TODO items:"
echo "  • 4 High Priority issues (v3.3.0)"
echo "  • 6 Medium Priority issues (v3.4.0)" 
echo "  • 5 Future Enhancement issues (v4.0.0)"
echo
read -p "Do you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled by user"
    exit 1
fi

echo "📝 Creating issues..."
echo

# Counter for tracking progress
created=0
total=15

# High Priority Issues (v3.3.0)
echo "🔥 Creating High Priority Issues (v3.3.0)..."

gh issue create \
  --title "Export Schedule Feature" \
  --body-file "issues/issue-01-export-schedule-feature.md" \
  --label "enhancement,todo-item,priority:high,feature:export" \
  --milestone "v3.3.0" && ((created++)) && echo "  ✅ [$created/$total] Export Schedule Feature"

gh issue create \
  --title "Keyboard Shortcuts Implementation" \
  --body-file "issues/issue-02-keyboard-shortcuts-implementation.md" \
  --label "enhancement,todo-item,priority:high,feature:shortcuts" \
  --milestone "v3.3.0" && ((created++)) && echo "  ✅ [$created/$total] Keyboard Shortcuts Implementation"

gh issue create \
  --title "Version Sync Fix" \
  --body-file "issues/issue-03-version-sync-fix.md" \
  --label "enhancement,todo-item,priority:high,effort:xs" \
  --milestone "v3.3.0" && ((created++)) && echo "  ✅ [$created/$total] Version Sync Fix"

gh issue create \
  --title "Reusable TeamSelector Component" \
  --body-file "issues/issue-04-reusable-teamselector-component.md" \
  --label "enhancement,todo-item,priority:high" \
  --milestone "v3.3.0" && ((created++)) && echo "  ✅ [$created/$total] Reusable TeamSelector Component"

echo
echo "⚡ Creating Medium Priority Issues (v3.4.0)..."

gh issue create \
  --title "Enhanced List Groups" \
  --body-file "issues/issue-05-enhanced-list-groups.md" \
  --label "enhancement,todo-item,priority:medium" \
  --milestone "v3.4.0" && ((created++)) && echo "  ✅ [$created/$total] Enhanced List Groups"

gh issue create \
  --title "TeamDetailModal Enhancement" \
  --body-file "issues/issue-06-teamdetailmodal-enhancement.md" \
  --label "enhancement,todo-item,priority:medium" \
  --milestone "v3.4.0" && ((created++)) && echo "  ✅ [$created/$total] TeamDetailModal Enhancement"

gh issue create \
  --title "Enhanced Error Boundaries" \
  --body-file "issues/issue-07-enhanced-error-boundaries.md" \
  --label "enhancement,todo-item,priority:medium" \
  --milestone "v3.4.0" && ((created++)) && echo "  ✅ [$created/$total] Enhanced Error Boundaries"

gh issue create \
  --title "CurrentStatus Component Refactoring ⭐️" \
  --body-file "issues/issue-08-currentstatus-component-refactoring---.md" \
  --label "enhancement,todo-item,priority:medium" \
  --milestone "v3.4.0" && ((created++)) && echo "  ✅ [$created/$total] CurrentStatus Component Refactoring"

gh issue create \
  --title "PWA Installation Prompts" \
  --body-file "issues/issue-09-pwa-installation-prompts.md" \
  --label "enhancement,todo-item,priority:medium,feature:pwa" \
  --milestone "v3.4.0" && ((created++)) && echo "  ✅ [$created/$total] PWA Installation Prompts"

gh issue create \
  --title "Carousel for Mobile Team View" \
  --body-file "issues/issue-10-carousel-for-mobile-team-view.md" \
  --label "enhancement,todo-item,priority:medium" \
  --milestone "v3.4.0" && ((created++)) && echo "  ✅ [$created/$total] Carousel for Mobile Team View"

echo
echo "🔮 Creating Future Enhancement Issues (v4.0.0)..."

gh issue create \
  --title "Accordion for Transfer History" \
  --body-file "issues/issue-11-accordion-for-transfer-history.md" \
  --label "enhancement,todo-item,priority:low" \
  --milestone "v4.0.0" && ((created++)) && echo "  ✅ [$created/$total] Accordion for Transfer History"

gh issue create \
  --title "Notification System Implementation" \
  --body-file "issues/issue-12-notification-system-implementation.md" \
  --label "enhancement,todo-item,priority:low" \
  --milestone "v4.0.0" && ((created++)) && echo "  ✅ [$created/$total] Notification System Implementation"

gh issue create \
  --title "Advanced Accessibility Features" \
  --body-file "issues/issue-13-advanced-accessibility-features.md" \
  --label "enhancement,todo-item,priority:low,feature:accessibility" \
  --milestone "v4.0.0" && ((created++)) && echo "  ✅ [$created/$total] Advanced Accessibility Features"

gh issue create \
  --title "Multi-Roster Pattern Support" \
  --body-file "issues/issue-14-multi-roster-pattern-support.md" \
  --label "enhancement,todo-item,priority:low" \
  --milestone "v4.0.0" && ((created++)) && echo "  ✅ [$created/$total] Multi-Roster Pattern Support"

gh issue create \
  --title "Floating Action Button" \
  --body-file "issues/issue-15-floating-action-button.md" \
  --label "enhancement,todo-item,priority:low" \
  --milestone "v4.0.0" && ((created++)) && echo "  ✅ [$created/$total] Floating Action Button"

echo
echo "🎉 Success! Created $created GitHub issues."
echo
echo "📊 Summary:"
echo "  • High Priority (v3.3.0): 4 issues"
echo "  • Medium Priority (v3.4.0): 6 issues"
echo "  • Future Enhancements (v4.0.0): 5 issues"
echo
echo "🔗 View all issues: gh issue list --label todo-item"
echo "📈 View by milestone: gh issue list --milestone v3.3.0"