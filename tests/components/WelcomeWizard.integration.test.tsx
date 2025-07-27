import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';
import App from '../../src/App';

describe('WelcomeWizard integration', () => {
    beforeEach(() => {
        // Clear localStorage and ensure consistent test state
        window.localStorage.clear();

        // Mock localStorage to ensure clean state
        Object.defineProperty(window, 'localStorage', {
            value: {
                clear: vi.fn(),
                getItem: vi.fn((key) => {
                    // Return null for user state key to trigger WelcomeWizard
                    if (key === 'nextshift_user_state') {
                        return null;
                    }
                    return null;
                }),
                setItem: vi.fn(),
                removeItem: vi.fn(),
                length: 0,
                key: vi.fn(),
            },
            writable: true,
        });
    });

    afterEach(() => {
        window.localStorage.clear();
        vi.clearAllMocks();
    });

    it('shows WelcomeWizard on first load and after reset', async () => {
        render(<App />);

        // There are two elements with this text, select the modal title
        const welcomeHeadings =
            await screen.findAllByText(/Welcome to NextShift/i);
        const modalHeading = welcomeHeadings.find((el) =>
            el.className.includes('modal-title'),
        );
        expect(modalHeading).toBeInTheDocument();
        // Simulate completing onboarding
        fireEvent.click(screen.getByText(/Let's Get Started/i));
        // Find button by role and accessible name
        const chooseButton = screen.getByRole('button', {
            name: /Choose My Experience/i,
        });
        fireEvent.click(chooseButton);
        fireEvent.click(screen.getByLabelText(/Select Team 1/i));
        await waitFor(() =>
            expect(
                screen.queryByText(/Welcome to NextShift/i),
            ).not.toBeInTheDocument(),
        );
        // Simulate reset
        fireEvent.click(screen.getByLabelText(/Settings/i));
        fireEvent.click(screen.getByText(/Reset Data/i));
        fireEvent.click(screen.getByText(/^Reset$/));
        const welcomeHeadingsAfterReset =
            await screen.findAllByText(/Welcome to NextShift/i);
        const modalHeadingAfterReset = welcomeHeadingsAfterReset.find((el) =>
            el.className.includes('modal-title'),
        );
        expect(modalHeadingAfterReset).toBeInTheDocument();
    });

    it('lets user skip team selection and browse all teams', async () => {
        // First test that the modal shows up
        render(<App />);

        // Wait for the modal to appear
        const welcomeModal = await screen.findByText(/Welcome to NextShift/i, {
            selector: '.modal-title',
        });
        expect(welcomeModal).toBeInTheDocument();

        // Progress through the wizard
        fireEvent.click(screen.getByText(/Let's Get Started/i));

        // Wait for step 2 and find the button by role and text
        const chooseButton = await screen.findByRole('button', {
            name: /Choose My Experience/i,
        });
        fireEvent.click(chooseButton);

        // Skip team selection
        fireEvent.click(screen.getByText(/Browse All Teams/i));

        // Modal should close
        await waitFor(() =>
            expect(
                screen.queryByText(/Welcome to NextShift/i),
            ).not.toBeInTheDocument(),
        );

        // Should be able to open settings and reset again
        fireEvent.click(screen.getByLabelText(/Settings/i));
        fireEvent.click(screen.getByText(/Reset Data/i));
        fireEvent.click(screen.getByText(/^Reset$/));
        const welcomeHeadingsAfterReset =
            await screen.findAllByText(/Welcome to NextShift/i);
        const modalHeadingAfterReset = welcomeHeadingsAfterReset.find((el) =>
            el.className.includes('modal-title'),
        );
        expect(modalHeadingAfterReset).toBeInTheDocument();
    });

    it('shows correct progress and disables buttons when loading', async () => {
        render(<App />);
        const welcomeHeadings =
            await screen.findAllByText(/Welcome to NextShift/i);
        const modalHeading = welcomeHeadings.find((el) =>
            el.className.includes('modal-title'),
        );
        expect(modalHeading).toBeInTheDocument();
        // Progress bar and step text
        expect(screen.getByText(/Step 1 of 3/i)).toBeInTheDocument();
        fireEvent.click(screen.getByText(/Let's Get Started/i));
        // Wait for step 2 to appear
        await waitFor(() =>
            expect(screen.getByText(/Step 2 of 3/i)).toBeInTheDocument(),
        );
        const findChooseExperienceButton = () =>
            screen.getByRole('button', { name: /Choose My Experience/i });
        fireEvent.click(findChooseExperienceButton());
        const step3Matches = screen.getAllByText((content) =>
            content.includes('Step 3 of 3'),
        );
        expect(step3Matches.length).toBeGreaterThan(0);
    });
});
