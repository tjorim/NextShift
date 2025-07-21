import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { TeamSelector } from '../../src/components/TeamSelector';

describe('TeamSelector Component', () => {
    it('should render when show is true', () => {
        const mockOnTeamSelect = vi.fn();
        const mockOnHide = vi.fn();

        render(
            <TeamSelector
                show={true}
                onTeamSelect={mockOnTeamSelect}
                onHide={mockOnHide}
            />,
        );

        expect(screen.getByText('Select Your Team')).toBeInTheDocument();
        expect(
            screen.getByText('Please select which team you belong to:'),
        ).toBeInTheDocument();
    });

    it('should render all team buttons', () => {
        const mockOnTeamSelect = vi.fn();
        const mockOnHide = vi.fn();

        render(
            <TeamSelector
                show={true}
                onTeamSelect={mockOnTeamSelect}
                onHide={mockOnHide}
            />,
        );

        for (let i = 1; i <= 5; i++) {
            expect(screen.getByText(`Team ${i}`)).toBeInTheDocument();
        }
    });

    it('should call onTeamSelect and onHide when team is selected', async () => {
        const mockOnTeamSelect = vi.fn();
        const mockOnHide = vi.fn();
        const user = userEvent.setup();

        render(
            <TeamSelector
                show={true}
                onTeamSelect={mockOnTeamSelect}
                onHide={mockOnHide}
            />,
        );

        const team3Button = screen.getByText('Team 3');
        await user.click(team3Button);

        expect(mockOnTeamSelect).toHaveBeenCalledWith(3);
        expect(mockOnHide).toHaveBeenCalled();
    });

    it('should not render when show is false', () => {
        const mockOnTeamSelect = vi.fn();
        const mockOnHide = vi.fn();

        render(
            <TeamSelector
                show={false}
                onTeamSelect={mockOnTeamSelect}
                onHide={mockOnHide}
            />,
        );

        expect(screen.queryByText('Select Your Team')).not.toBeInTheDocument();
    });
});
