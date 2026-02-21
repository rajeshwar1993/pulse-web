import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WisdomCard } from '../wisdom-card';

// Mock the wisdom service
vi.mock('@/lib/services/wisdom-service', () => ({
  getRandomWisdom: () => 'Test wisdom phrase for testing',
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: (namespace: string) => (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      common: { tapToDismiss: 'Tap to dismiss' },
      'dashboard.wisdomCard': { ariaLabel: 'Wisdom card - click to dismiss' },
    };
    return translations[namespace]?.[key] || key;
  },
}));

describe('WisdomCard', () => {
  it('should render wisdom text', () => {
    render(<WisdomCard autoDismiss={false} />);

    expect(screen.getByText('"Test wisdom phrase for testing"')).toBeInTheDocument();
  });

  it('should show dismiss hint text', () => {
    render(<WisdomCard autoDismiss={false} />);

    expect(screen.getByText('Tap to dismiss')).toBeInTheDocument();
  });

  it('should render as a button with correct role', () => {
    render(<WisdomCard autoDismiss={false} />);

    const card = screen.getByRole('button', { name: /wisdom card/i });
    expect(card).toBeInTheDocument();
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  it('should have gradient accent bar', () => {
    const { container } = render(<WisdomCard autoDismiss={false} />);

    const accentBar = container.querySelector('.bg-gradient-to-r');
    expect(accentBar).toBeInTheDocument();
  });

  it('should have glassmorph styling', () => {
    const { container } = render(<WisdomCard autoDismiss={false} />);

    const card = container.querySelector('.backdrop-blur-md');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('bg-white/80');
  });

  it('should call handleDismiss on click', () => {
    const onDismiss = vi.fn();
    render(<WisdomCard autoDismiss={false} onDismiss={onDismiss} />);

    const card = screen.getByRole('button', { name: /wisdom card/i });
    fireEvent.click(card);

    // Check that the card starts the dismiss animation (opacity changes)
    expect(card).toHaveClass('opacity-0');
  });

  it('should call handleDismiss on Enter key press', () => {
    const onDismiss = vi.fn();
    render(<WisdomCard autoDismiss={false} onDismiss={onDismiss} />);

    const card = screen.getByRole('button', { name: /wisdom card/i });
    fireEvent.keyDown(card, { key: 'Enter' });

    // Check that the card starts the dismiss animation
    expect(card).toHaveClass('opacity-0');
  });

  it('should call handleDismiss on Space key press', () => {
    const onDismiss = vi.fn();
    render(<WisdomCard autoDismiss={false} onDismiss={onDismiss} />);

    const card = screen.getByRole('button', { name: /wisdom card/i });
    fireEvent.keyDown(card, { key: ' ' });

    // Check that the card starts the dismiss animation
    expect(card).toHaveClass('opacity-0');
  });

  it('should accept autoDismiss prop', () => {
    const { rerender } = render(<WisdomCard autoDismiss={false} />);
    expect(screen.getByText('"Test wisdom phrase for testing"')).toBeInTheDocument();

    rerender(<WisdomCard autoDismiss={true} />);
    expect(screen.getByText('"Test wisdom phrase for testing"')).toBeInTheDocument();
  });

  it('should accept dismissDelay prop', () => {
    render(<WisdomCard autoDismiss={true} dismissDelay={5000} />);
    expect(screen.getByText('"Test wisdom phrase for testing"')).toBeInTheDocument();
  });
});
