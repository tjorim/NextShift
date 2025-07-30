import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { CookieConsentBanner } from '../../src/components/CookieConsentBanner';
import { CookieConsentProvider } from '../../src/contexts/CookieConsentContext';

function renderWithProvider(ui: React.ReactElement) {
    return render(<CookieConsentProvider>{ui}</CookieConsentProvider>);
}

describe('CookieConsentBanner', () => {
    afterEach(() => {
        window.localStorage.clear();
    });

    it('renders when consent has not been given', () => {
        renderWithProvider(<CookieConsentBanner show={true} />);

        expect(screen.getByText('Cookie Preferences')).toBeInTheDocument();
        expect(
            screen.getByText(/We use local storage to save your preferences/),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Accept All' }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Reject All' }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Customize' }),
        ).toBeInTheDocument();
    });

    it('does not render when show is false', () => {
        renderWithProvider(<CookieConsentBanner show={false} />);

        expect(
            screen.queryByText('Cookie Preferences'),
        ).not.toBeInTheDocument();
    });

    it('opens customization modal when Customize button is clicked', async () => {
        const user = userEvent.setup();
        renderWithProvider(<CookieConsentBanner show={true} />);

        const customizeButton = screen.getByRole('button', {
            name: 'Customize',
        });
        await user.click(customizeButton);

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(
            screen.getByText(/Choose which types of data storage/),
        ).toBeInTheDocument();
        expect(screen.getByText('Strictly Necessary')).toBeInTheDocument();
        expect(screen.getByText('Functional')).toBeInTheDocument();
    });

    it('sets consent when Accept All is clicked', async () => {
        const user = userEvent.setup();
        renderWithProvider(<CookieConsentBanner show={true} />);

        const acceptButton = screen.getByRole('button', { name: 'Accept All' });
        await user.click(acceptButton);

        // Check that consent was stored
        const consentData = window.localStorage.getItem(
            'nextshift_cookie_consent',
        );
        expect(consentData).not.toBeNull();

        if (consentData) {
            const parsed = JSON.parse(consentData);
            expect(parsed.consentGiven).toBe(true);
            expect(parsed.preferences.necessary).toBe(true);
            expect(parsed.preferences.functional).toBe(true);
            expect(parsed.preferences.analytics).toBe(true);
        }
    });

    it('sets consent when Reject All is clicked', async () => {
        const user = userEvent.setup();
        renderWithProvider(<CookieConsentBanner show={true} />);

        const rejectButton = screen.getByRole('button', { name: 'Reject All' });
        await user.click(rejectButton);

        // Check that consent was stored
        const consentData = window.localStorage.getItem(
            'nextshift_cookie_consent',
        );
        expect(consentData).not.toBeNull();

        if (consentData) {
            const parsed = JSON.parse(consentData);
            expect(parsed.consentGiven).toBe(true);
            expect(parsed.preferences.necessary).toBe(true);
            expect(parsed.preferences.functional).toBe(false);
            expect(parsed.preferences.analytics).toBe(false);
        }
    });

    it('allows customizing consent preferences', async () => {
        const user = userEvent.setup();
        renderWithProvider(<CookieConsentBanner show={true} />);

        // Open customization modal
        const customizeButton = screen.getByRole('button', {
            name: 'Customize',
        });
        await user.click(customizeButton);

        // Toggle functional consent (should be off by default)
        const functionalToggle = screen.getByRole('checkbox', {
            name: /Functional/,
        });
        await user.click(functionalToggle);

        // Save preferences
        const saveButton = screen.getByRole('button', {
            name: 'Save Preferences',
        });
        await user.click(saveButton);

        // Check that consent was stored
        const consentData = window.localStorage.getItem(
            'nextshift_cookie_consent',
        );
        expect(consentData).not.toBeNull();

        if (consentData) {
            const parsed = JSON.parse(consentData);
            expect(parsed.consentGiven).toBe(true);
            expect(parsed.preferences.necessary).toBe(true);
            expect(parsed.preferences.functional).toBe(true);
            expect(parsed.preferences.analytics).toBe(false);
        }
    });

    it('shows strictly necessary as always enabled', async () => {
        const user = userEvent.setup();
        renderWithProvider(<CookieConsentBanner show={true} />);

        // Open customization modal
        const customizeButton = screen.getByRole('button', {
            name: 'Customize',
        });
        await user.click(customizeButton);

        // Check that strictly necessary is checked and disabled
        const necessaryToggle = screen.getByRole('checkbox', {
            name: /Strictly Necessary/,
        });
        expect(necessaryToggle).toBeChecked();
        expect(necessaryToggle).toBeDisabled();
    });
});
