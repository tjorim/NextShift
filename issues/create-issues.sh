#!/bin/bash

# GitHub Issue Creation Script for NextShift TODO Items
# This script creates GitHub issues based on the improved issues-data.json
# 
# Prerequisites:
# 1. GitHub CLI (gh) must be installed and authenticated
# 2. Repository must have appropriate labels and milestones
# 3. You must have write access to the repository
# 4. Node.js must be available for JSON parsing

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

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed."
    echo "   Node.js is required for JSON parsing."
    exit 1
fi

# Check if issues-data.json exists
if [ ! -f "issues/issues-data.json" ]; then
    echo "❌ Error: issues/issues-data.json not found."
    echo "   Please run this script from the repository root."
    exit 1
fi

echo "✅ Prerequisites check passed"
echo

# Get issue count from JSON
issue_count=$(node -e "console.log(JSON.parse(require('fs').readFileSync('issues/issues-data.json', 'utf8')).length)")

echo "This script will create $issue_count GitHub issues for NextShift TODO items:"
echo "  • Based on improved issues-data.json with comprehensive details"
echo "  • Each issue includes user stories, acceptance criteria, and technical specs"
echo "  • Proper labeling and milestone assignments"
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
failed=0

# Create a Node.js script to process the JSON and create issues
node << 'EOF'
const fs = require('fs');
const { execSync } = require('child_process');

try {
    const issuesData = JSON.parse(fs.readFileSync('issues/issues-data.json', 'utf8'));
    
    issuesData.forEach((issue, index) => {
        const issueNum = String(index + 1).padStart(2, '0');
        const filename = `issue-${issueNum}-${issue.title.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-')}.md`;
        const filePath = `issues/${filename}`;
        
        // Prepare labels - join array or use as string
        const labels = Array.isArray(issue.labels) ? issue.labels.join(',') : issue.labels;
        
        // Build gh command
        let command = `gh issue create`;
        command += ` --title "${issue.title}"`;
        command += ` --body-file "${filePath}"`;
        command += ` --label "${labels}"`;
        
        if (issue.milestone) {
            command += ` --milestone "${issue.milestone}"`;
        }
        
        try {
            console.log(`Creating issue ${index + 1}/${issuesData.length}: ${issue.title}`);
            execSync(command, { stdio: 'inherit' });
            console.log(`  ✅ [${index + 1}/${issuesData.length}] ${issue.title}`);
        } catch (error) {
            console.error(`  ❌ [${index + 1}/${issuesData.length}] Failed: ${issue.title}`);
            console.error(`     Error: ${error.message}`);
            process.exitCode = 1;
        }
        
        // Small delay to avoid rate limiting
        execSync('sleep 1');
    });
    
} catch (error) {
    console.error('❌ Error processing issues data:', error.message);
    process.exit(1);
}
EOF

if [ $? -eq 0 ]; then
    echo
    echo "🎉 Successfully created all GitHub issues!"
    echo "   View them at: $(gh repo view --web 2>/dev/null | grep -o 'https://[^/]*/[^/]*/[^/]*')/issues"
else
    echo
    echo "⚠️  Some issues failed to create. Check the output above for details."
    exit 1
fi