import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from '../../src/App';

describe('WelcomeWizard integration', () => {
    afterEach(() => {
        window.localStorage.clear();
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
        // Use a function matcher to find 'Choose My Experience' even if split
        // Find all elements with the text and click the button
        const chooseButtons = screen.getAllByText((content, node) =>
            Boolean(
                node &&
                    node.textContent &&
                    node.textContent.includes('Choose My Experience'),
            ),
        );
        const chooseButton = chooseButtons.find(
            (el) => el.tagName === 'BUTTON',
        );
        expect(chooseButton).toBeDefined();
        fireEvent.click(chooseButton!);
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
        render(<App />);
        const welcomeHeadings =
            await screen.findAllByText(/Welcome to NextShift/i);
        const modalHeading = welcomeHeadings.find((el) =>
            el.className.includes('modal-title'),
        );
        expect(modalHeading).toBeInTheDocument();
        fireEvent.click(screen.getByText(/Let's Get Started/i));
        // Use a function matcher to find 'Choose My Experience' even if split
        fireEvent.click(
            screen.getByRole('button', { name: /Choose My Experience/i }),
        );
        fireEvent.click(screen.getByText(/Browse All Teams/i));
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
        // Use a function matcher for 'Step 2 of 3'
        const step2Matches = screen.getAllByText((content, node) =>
            Boolean(
                node &&
                    node.textContent &&
                    node.textContent.includes('Step 2 of 3'),
            ),
        );
        expect(step2Matches.length).toBeGreaterThan(0);
        // Find all elements with the text and click the button
        const chooseButtons3 = screen.getAllByText((content, node) =>
            Boolean(
                node &&
                    node.textContent &&
                    node.textContent.includes('Choose My Experience'),
            ),
        );
        const chooseButton3 = chooseButtons3.find(
            (el) => el.tagName === 'BUTTON',
        );
        expect(chooseButton3).toBeDefined();
        fireEvent.click(chooseButton3!);
        const step3Matches = screen.getAllByText((content, node) =>
            Boolean(
                node &&
                    node.textContent &&
                    node.textContent.includes('Step 3 of 3'),
            ),
        );
        expect(step3Matches.length).toBeGreaterThan(0);
    });
});
