#!/usr/bin/env node

/**
 * Script to generate GitHub issues from TODO.md items
 *
 * This script parses the TODO.md file and outputs structured issue data
 * that can be used to create GitHub issues either manually or via automation.
 *
 * Usage:
 *   node scripts/create-todo-issues.js
 *
 * Outputs:
 *   - Console output with gh CLI commands
 *   - JSON file with issue data
 *   - Individual markdown files for each issue
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Priority labels mapping
const PRIORITY_LABELS = {
    high: 'priority:high',
    medium: 'priority:medium',
    future: 'priority:low',
};

// Effort labels mapping
const EFFORT_LABELS = {
    '30 minutes': 'effort:xs',
    '1-2 hours': 'effort:small',
    '2-3 hours': 'effort:medium',
    '3-4 hours': 'effort:large',
    '4-5 hours': 'effort:large',
    '5-6 hours': 'effort:xl',
    '8-12 hours': 'effort:xxl',
};

// Parse TODO items from the markdown content
function parseTodoItems(content) {
    const items = [];
    const sections = content.split(/#### \d+\. /);

    for (let i = 1; i < sections.length; i++) {
        const section = sections[i];
        const lines = section.split('\n');

        // Extract title (first line)
        const titleLine = lines[0];
        const title = titleLine.split('- **Component**:')[0].trim();

        // Extract details
        let component = '';
        const useCases = [];
        let implementation = '';
        const filesToModify = [];
        let estimatedEffort = '';
        let status = '';
        let priority = '';

        // Determine priority based on section position
        if (i <= 4) priority = 'high';
        else if (i <= 10) priority = 'medium';
        else priority = 'future';

        let currentSection = '';

        for (const line of lines) {
            if (line.includes('**Component**:')) {
                component = line.split('**Component**:')[1].trim();
            } else if (line.includes('**Use Cases**:')) {
                currentSection = 'useCases';
            } else if (line.includes('**Implementation**:')) {
                currentSection = 'implementation';
                implementation =
                    line.split('**Implementation**:')[1]?.trim() || '';
            } else if (line.includes('**Files to Modify**:')) {
                currentSection = 'files';
            } else if (line.includes('**Estimated Effort**:')) {
                estimatedEffort = line.split('**Estimated Effort**:')[1].trim();
            } else if (line.includes('**Status**:')) {
                status = line.split('**Status**:')[1].trim();
            } else if (
                currentSection === 'useCases' &&
                line.trim().startsWith('- ')
            ) {
                useCases.push(line.trim().substring(2));
            } else if (
                currentSection === 'files' &&
                line.trim().startsWith('- ')
            ) {
                filesToModify.push(line.trim().substring(2));
            } else if (
                currentSection === 'implementation' &&
                line.trim() &&
                !line.includes('**')
            ) {
                implementation += ` ${line.trim()}`;
            }
        }

        items.push({
            title,
            component,
            useCases,
            implementation: implementation.trim(),
            filesToModify,
            estimatedEffort,
            status,
            priority,
            labels: generateLabels(priority, estimatedEffort, component),
        });
    }

    return items;
}

function generateLabels(priority, effort, component) {
    const labels = ['enhancement', 'todo-item'];

    // Add priority label
    if (PRIORITY_LABELS[priority]) {
        labels.push(PRIORITY_LABELS[priority]);
    }

    // Add effort label
    const effortLabel = Object.keys(EFFORT_LABELS).find((key) =>
        effort.includes(key),
    );
    if (effortLabel) {
        labels.push(EFFORT_LABELS[effortLabel]);
    }

    // Add component-based labels
    if (component.toLowerCase().includes('component')) {
        labels.push('type:component');
    }
    if (
        component.toLowerCase().includes('export') ||
        component.toLowerCase().includes('calendar')
    ) {
        labels.push('feature:export');
    }
    if (
        component.toLowerCase().includes('keyboard') ||
        component.toLowerCase().includes('shortcut')
    ) {
        labels.push('feature:shortcuts');
    }
    if (component.toLowerCase().includes('accessibility')) {
        labels.push('feature:accessibility');
    }
    if (component.toLowerCase().includes('pwa')) {
        labels.push('feature:pwa');
    }

    return labels;
}

function generateIssueMarkdown(item, index) {
    return `## ${item.title}

**Component**: ${item.component}

### Use Cases
${item.useCases.map((uc) => `- ${uc}`).join('\n')}

### Implementation
${item.implementation}

### Files to Modify
${item.filesToModify.map((file) => `- [ ] ${file}`).join('\n')}

### Acceptance Criteria
${item.useCases.map((uc) => `- [ ] ${uc}`).join('\n')}

### Technical Details
- **Estimated Effort**: ${item.estimatedEffort}
- **Priority**: ${item.priority}
- **Current Status**: ${item.status}

### Labels
\`${item.labels.join('`, `')}\`

---
*This issue was auto-generated from TODO.md item #${index + 1}*
`;
}

function generateGhCliCommands(items) {
    return items
        .map((item, index) => {
            const title = `${item.title}`;
            const labels = item.labels.join(',');
            const milestone =
                item.priority === 'high'
                    ? 'v3.3.0'
                    : item.priority === 'medium'
                      ? 'v3.4.0'
                      : 'v4.0.0';

            return `gh issue create \\
  --title "${title}" \\
  --body-file "issues/issue-${String(index + 1).padStart(2, '0')}-${item.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.md" \\
  --label "${labels}" \\
  --milestone "${milestone}"`;
        })
        .join('\n\n');
}

// Main execution
async function main() {
    try {
        // Read TODO.md
        const todoPath = path.join(__dirname, '..', 'TODO.md');
        const todoContent = fs.readFileSync(todoPath, 'utf8');

        // Parse items
        const items = parseTodoItems(todoContent);

        console.log(`Parsed ${items.length} TODO items\n`);

        // Create output directories
        const outputDir = path.join(__dirname, '..', 'issues');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Generate individual issue files
        items.forEach((item, index) => {
            const filename = `issue-${String(index + 1).padStart(2, '0')}-${item.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`;
            const filepath = path.join(outputDir, filename);
            const content = generateIssueMarkdown(item, index);
            fs.writeFileSync(filepath, content);
        });

        // Generate commands file
        const commands = generateGhCliCommands(items);
        fs.writeFileSync(path.join(outputDir, 'create-issues.sh'), commands);

        // Generate JSON data
        fs.writeFileSync(
            path.join(outputDir, 'issues-data.json'),
            JSON.stringify(items, null, 2),
        );

        // Output summary
        console.log('Generated files:');
        console.log(
            `- ${items.length} individual issue markdown files in issues/`,
        );
        console.log('- issues/create-issues.sh (gh CLI commands)');
        console.log('- issues/issues-data.json (structured data)');

        console.log('\n=== GitHub CLI Commands ===');
        console.log(commands);

        console.log('\n=== Summary by Priority ===');
        const byPriority = items.reduce((acc, item) => {
            acc[item.priority] = (acc[item.priority] || 0) + 1;
            return acc;
        }, {});

        Object.entries(byPriority).forEach(([priority, count]) => {
            console.log(`${priority}: ${count} items`);
        });
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

main();
