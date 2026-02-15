import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusCard } from '../status-card';

describe('StatusCard', () => {
  describe('Active state', () => {
    it('should render active state correctly', () => {
      const pulseTime = new Date('2025-01-15T08:30:00');

      render(<StatusCard isActive={true} pulseTime={pulseTime} />);

      expect(screen.getByText('You are active today')).toBeInTheDocument();
      expect(screen.getByText(/Pulsed/)).toBeInTheDocument();
    });

    it('should display formatted pulse time', () => {
      const pulseTime = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago

      render(<StatusCard isActive={true} pulseTime={pulseTime} />);

      expect(screen.getByText('You are active today')).toBeInTheDocument();
      expect(screen.getByText(/2 hours ago/)).toBeInTheDocument();
    });

    it('should show green indicator for active state', () => {
      const pulseTime = new Date();

      const { container } = render(<StatusCard isActive={true} pulseTime={pulseTime} />);

      // Check for green background color (var(--green))
      const greenIndicator = container.querySelector('.bg-\\[var\\(--green\\)\\]');
      expect(greenIndicator).toBeInTheDocument();
    });

    it('should show checkmark icon for active state', () => {
      const pulseTime = new Date();

      const { container } = render(<StatusCard isActive={true} pulseTime={pulseTime} />);

      // Check for SVG checkmark path
      const checkmark = container.querySelector('path[clip-rule="evenodd"]');
      expect(checkmark).toBeInTheDocument();
    });

    it('should have pulse animation on active indicator', () => {
      const pulseTime = new Date();

      const { container } = render(<StatusCard isActive={true} pulseTime={pulseTime} />);

      // Check for ping animation
      const pingElement = container.querySelector('.animate-ping');
      expect(pingElement).toBeInTheDocument();
    });
  });

  describe('Inactive state', () => {
    it('should render inactive state correctly', () => {
      render(<StatusCard isActive={false} pulseTime={null} />);

      expect(screen.getByText("You haven't pulsed yet today")).toBeInTheDocument();
      expect(screen.getByText('Your pulse was sent automatically')).toBeInTheDocument();
    });

    it('should show grey indicator for inactive state', () => {
      const { container } = render(<StatusCard isActive={false} pulseTime={null} />);

      // Check for grey background color (var(--slate-300))
      const greyIndicator = container.querySelector('.bg-\\[var\\(--slate-300\\)\\]');
      expect(greyIndicator).toBeInTheDocument();
    });

    it('should show clock icon for inactive state', () => {
      const { container } = render(<StatusCard isActive={false} pulseTime={null} />);

      // Check for SVG clock path
      const clockIcon = container.querySelector('path[stroke-linecap="round"]');
      expect(clockIcon).toBeInTheDocument();
    });

    it('should not show pulse animation for inactive state', () => {
      const { container } = render(<StatusCard isActive={false} pulseTime={null} />);

      // Should not have ping animation
      const pingElement = container.querySelector('.animate-ping');
      expect(pingElement).not.toBeInTheDocument();
    });

    it('should not display pulse time when inactive', () => {
      render(<StatusCard isActive={false} pulseTime={null} />);

      expect(screen.queryByText(/Pulsed/)).not.toBeInTheDocument();
      expect(screen.queryByText(/ago/)).not.toBeInTheDocument();
    });
  });

  describe('Component structure', () => {
    it('should render with correct title', () => {
      render(<StatusCard isActive={false} pulseTime={null} />);

      expect(screen.getByText('Your Status')).toBeInTheDocument();
    });

    it('should have white background and border', () => {
      const { container } = render(<StatusCard isActive={false} pulseTime={null} />);

      const card = container.querySelector('.bg-white');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('border');
    });
  });
});
