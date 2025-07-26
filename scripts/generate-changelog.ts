#!/usr/bin/env tsx

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { changelogData, futurePlans } from '../src/data/changelog';

function generateChangelog(): string {
    const header = `# Changelog

All notable changes to NextShift will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - Future Enhancements

### Planned
${Object.entries(futurePlans)
    .filter(([key]) => key.startsWith('v'))
    .flatMap(([_, plan]) => plan.features)
    .map((feature) => `- ${feature}`)
    .join('\n')}

`;

    const versions = changelogData
        .map((version) => {
            let versionSection = `## [${version.version}] - ${version.date}\n\n`;

            if (version.added.length > 0) {
                versionSection += '### Added\n';
                version.added.forEach((item) => {
                    versionSection += `- ${item}\n`;
                });
                versionSection += '\n';
            }

            if (version.changed.length > 0) {
                versionSection += '### Changed\n';
                version.changed.forEach((item) => {
                    versionSection += `- ${item}\n`;
                });
                versionSection += '\n';
            }

            if (version.fixed.length > 0) {
                versionSection += '### Fixed\n';
                version.fixed.forEach((item) => {
                    versionSection += `- ${item}\n`;
                });
                versionSection += '\n';
            }

            if (version.planned && version.planned.length > 0) {
                versionSection += '### Planned\n';
                version.planned.forEach((item) => {
                    versionSection += `- ${item}\n`;
                });
                versionSection += '\n';
            }

            if (version.technicalDetails) {
                versionSection += `### ${version.technicalDetails.title}\n`;
                versionSection += `${version.technicalDetails.description}\n\n`;
            }

            return versionSection;
        })
        .join('');

    const footer = `---

## Version Planning

${Object.entries(futurePlans)
    .filter(([key]) => key.startsWith('v'))
    .map(
        ([version, plan]) =>
            `### ${version} - ${plan.title}\n${plan.features.map((feature) => `- ${feature}`).join('\n')}`,
    )
    .join('\n\n')}

### ${futurePlans.future.title}
${futurePlans.future.features.map((feature) => `- ${feature}`).join('\n')}
`;

    return header + versions + footer;
}

function main() {
    const changelog = generateChangelog();
    const changelogPath = join(process.cwd(), 'CHANGELOG.md');

    writeFileSync(changelogPath, changelog, 'utf8');
    console.log('✅ CHANGELOG.md generated successfully');
}

if (require.main === module) {
    main();
}
