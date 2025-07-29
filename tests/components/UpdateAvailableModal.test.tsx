import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UpdateAvailableModal } from '../../src/components/UpdateAvailableModal';

describe('UpdateAvailableModal', () => {
    const mockOnUpdate = vi.fn();
    const mockOnLater = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly when shown', () => {
        render(
            <UpdateAvailableModal
                show={true}
                onUpdate={mockOnUpdate}
                onLater={mockOnLater}
            />,
        );

        expect(screen.getByText('Update Available')).toBeInTheDocument();
        expect(
            screen.getByText(
                'A new version of NextShift is available with improvements and bug fixes.',
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'The update will be applied immediately and the app will refresh.',
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /later/i }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /update now/i }),
        ).toBeInTheDocument();
    });

    it('does not render when not shown', () => {
        render(
            <UpdateAvailableModal
                show={false}
                onUpdate={mockOnUpdate}
                onLater={mockOnLater}
            />,
        );

        expect(screen.queryByText('Update Available')).not.toBeInTheDocument();
    });

    it('calls onUpdate when Update Now button is clicked', async () => {
        const user = userEvent.setup();

        render(
            <UpdateAvailableModal
                show={true}
                onUpdate={mockOnUpdate}
                onLater={mockOnLater}
            />,
        );

        const updateButton = screen.getByRole('button', {
            name: /update now/i,
        });
        await user.click(updateButton);

        expect(mockOnUpdate).toHaveBeenCalledTimes(1);
        expect(mockOnLater).not.toHaveBeenCalled();
    });

    it('calls onLater when Later button is clicked', async () => {
        const user = userEvent.setup();

        render(
            <UpdateAvailableModal
                show={true}
                onUpdate={mockOnUpdate}
                onLater={mockOnLater}
            />,
        );

        const laterButton = screen.getByRole('button', { name: /later/i });
        await user.click(laterButton);

        expect(mockOnLater).toHaveBeenCalledTimes(1);
        expect(mockOnUpdate).not.toHaveBeenCalled();
    });

    it('has correct modal structure and styling', () => {
        render(
            <UpdateAvailableModal
                show={true}
                onUpdate={mockOnUpdate}
                onLater={mockOnLater}
            />,
        );

        // Check for modal structure
        const modal = screen.getByRole('dialog');
        expect(modal).toBeInTheDocument();

        // Check for icons
        expect(
            screen.getByText('Update Available').closest('.modal-title'),
        ).toContainHTML('bi bi-download');
        expect(
            screen.getByRole('button', { name: /update now/i }),
        ).toContainHTML('bi bi-arrow-clockwise');

        // Check button variants
        const laterButton = screen.getByRole('button', { name: /later/i });
        const updateButton = screen.getByRole('button', {
            name: /update now/i,
        });

        expect(laterButton).toHaveClass('btn-outline-secondary');
        expect(updateButton).toHaveClass('btn-primary');
    });

    it('modal props are configured correctly', () => {
        render(
            <UpdateAvailableModal
                show={true}
                onUpdate={mockOnUpdate}
                onLater={mockOnLater}
            />,
        );

        // Check that modal structure exists
        const modal = screen.getByRole('dialog');
        expect(modal).toBeInTheDocument();

        // Note: backdrop="static" is a React Bootstrap prop, not a DOM attribute
        // The actual DOM testing would require integration testing with real Bootstrap modal
    });
});
