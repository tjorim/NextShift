import React from 'react';
import { render } from 'ink';
import App from './App';

// Parse command line arguments
const args = process.argv.slice(2);
const teamArg = args.find((arg) => arg.startsWith('--team='));
const initialTeam = teamArg
	? Number.parseInt(teamArg.split('=')[1], 10)
	: undefined;

// Validate team number
if (initialTeam && (initialTeam < 1 || initialTeam > 5)) {
	console.error('Error: Team number must be between 1 and 5');
	process.exit(1);
}

// Show help if requested
if (args.includes('--help') || args.includes('-h')) {
	console.log(`
NextShift TUI - Team Shift Tracker Terminal Interface

Usage:
  nextshift-tui [options]

Options:
  --team=<1-5>    Set initial team selection (default: 1)
  --help, -h      Show this help message

Keyboard Shortcuts:
  1-5             Select team
  ←/→             Switch team
  Tab             Change view (Today/Next Shift/Transfers)
  j/k or ↓/↑      Navigate dates (±1 day)
  t               Jump to today
  q or Ctrl+C     Quit

Examples:
  nextshift-tui
  nextshift-tui --team=3
`);
	process.exit(0);
}

// Render the app
const { clear } = render(<App initialTeam={initialTeam} />);

// Handle cleanup on exit
process.on('SIGINT', () => {
	clear();
	process.exit(0);
});
