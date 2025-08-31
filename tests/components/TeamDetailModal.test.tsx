import { fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import { TeamDetailModal } from '../../src/components/TeamDetailModal';
import { setupLocalStorage } from '../utils/localStorageHelpers';
import { renderWithProviders } from '../utils/renderWithProviders';

describe('TeamDetailModal', () => {
    it('disables View Transfers button and shows tooltip when viewing own team', async () => {
        setupLocalStorage({ myTeam: 2 });
        renderWithProviders(
            <TeamDetailModal
                show={true}
                onHide={() => {}}
                teamNumber={2}
                onViewTransfers={vi.fn()}
            />,
        );

        // Simulate user is on team 2 (default selectedTeam is null, so we need to set it)
        // For this test, we assume the context is set up so myTeam === teamNumber
        // The button should be disabled
        const button = screen.getByRole('button', { name: /view transfers/i });
        expect(button).toBeDisabled();

        // Tooltip should show correct message when hovered
        if (!button.parentElement) {
            throw new Error('Button has no parent element');
        }
        fireEvent.mouseOver(button.parentElement);
        const tooltip = await screen.findByText(
            /you are viewing your own team/i,
        );
        expect(tooltip).toBeTruthy();
    });

    it('enables View Transfers button for other teams', () => {
        setupLocalStorage({ myTeam: 2 });

        renderWithProviders(
            <TeamDetailModal
                show={true}
                onHide={() => {}}
                teamNumber={3}
                onViewTransfers={vi.fn()}
            />,
        );
        // The button should be enabled (unless there are no transfers, but we are not testing that here)
        const button = screen.getByRole('button', { name: /view transfers/i });
        expect(button).not.toBeDisabled();
    });
});
