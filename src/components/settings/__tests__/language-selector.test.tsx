import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageSelector } from '../language-selector';

describe('LanguageSelector', () => {
  const mockOnLocaleChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render a button for each supported locale', () => {
    render(
      <LanguageSelector currentLocale="en" onLocaleChange={mockOnLocaleChange} />,
    );

    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('should mark the current locale button as selected with aria-pressed', () => {
    render(
      <LanguageSelector currentLocale="en" onLocaleChange={mockOnLocaleChange} />,
    );

    const button = screen.getByRole('button', { name: /English/i });
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('should show a checkmark icon for the selected locale', () => {
    const { container } = render(
      <LanguageSelector currentLocale="en" onLocaleChange={mockOnLocaleChange} />,
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should call onLocaleChange when a locale button is clicked', () => {
    render(
      <LanguageSelector currentLocale="en" onLocaleChange={mockOnLocaleChange} />,
    );

    const button = screen.getByRole('button', { name: /English/i });
    fireEvent.click(button);

    expect(mockOnLocaleChange).toHaveBeenCalledWith('en');
  });

  it('should render all buttons with type="button"', () => {
    render(
      <LanguageSelector currentLocale="en" onLocaleChange={mockOnLocaleChange} />,
    );

    const buttons = screen.getAllByRole('button');
    for (const button of buttons) {
      expect(button).toHaveAttribute('type', 'button');
    }
  });

  it('should apply selected styling to the current locale', () => {
    const { container } = render(
      <LanguageSelector currentLocale="en" onLocaleChange={mockOnLocaleChange} />,
    );

    const selectedButton = screen.getByRole('button', { name: /English/i });
    expect(selectedButton.className).toContain('border-[var(--teal)]');
  });
});
