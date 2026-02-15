import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyConnectionsView } from '../empty-connections-view';

describe('EmptyConnectionsView', () => {
  it('should render empty state message', () => {
    render(<EmptyConnectionsView />);

    expect(screen.getByText('No connections yet')).toBeInTheDocument();
    expect(
      screen.getByText(/You haven't added any connections to your Pulse network/)
    ).toBeInTheDocument();
  });

  it('should render invite button', () => {
    render(<EmptyConnectionsView />);

    const inviteButton = screen.getByRole('button', { name: /invite someone/i });
    expect(inviteButton).toBeInTheDocument();
  });

  it('should have disabled invite button', () => {
    render(<EmptyConnectionsView />);

    const inviteButton = screen.getByRole('button', { name: /invite someone/i });
    expect(inviteButton).toBeDisabled();
  });

  it('should show "Coming soon" notice', () => {
    render(<EmptyConnectionsView />);

    expect(screen.getByText('Coming soon in Unit 3: Connections')).toBeInTheDocument();
  });

  it('should render icon/illustration', () => {
    const { container } = render(<EmptyConnectionsView />);

    // Check for SVG icon
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('text-[var(--teal)]');
  });

  it('should have white background and border', () => {
    const { container } = render(<EmptyConnectionsView />);

    const card = container.querySelector('.bg-white');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('border');
    expect(card).toHaveClass('border-[var(--slate-200)]');
  });

  it('should have centered content', () => {
    const { container } = render(<EmptyConnectionsView />);

    const centeredContent = container.querySelector('.text-center');
    expect(centeredContent).toBeInTheDocument();
  });

  it('should render all descriptive text', () => {
    render(<EmptyConnectionsView />);

    expect(
      screen.getByText(
        /Start connecting with family and friends to share your daily check-ins/
      )
    ).toBeInTheDocument();
  });

  it('should have plus icon in button', () => {
    const { container } = render(<EmptyConnectionsView />);

    // Check for plus icon SVG path
    const plusIcon = container.querySelector('button svg path');
    expect(plusIcon).toBeInTheDocument();
  });

  it('should have tooltip on disabled button', () => {
    render(<EmptyConnectionsView />);

    const inviteButton = screen.getByRole('button', { name: /invite someone/i });
    expect(inviteButton).toHaveAttribute('title', 'Coming soon in Unit 3');
  });
});
