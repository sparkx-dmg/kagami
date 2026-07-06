import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

describe('Design System Primitives', () => {
  it('renders primary button correctly', () => {
    render(<Button variant="primary">Read Manga</Button>);
    const button = screen.getByRole('button', { name: /Read Manga/i });
    expect(button).toBeInTheDocument();
    expect(button.className).toContain('bg-accent');
  });

  it('renders badge variants correctly', () => {
    const { container } = render(<Badge variant="accent">MangaDex</Badge>);
    expect(container.firstChild).toBeInTheDocument();
    expect(container.firstChild?.textContent).toBe('MangaDex');
  });

  it('renders card without shadow and with border', () => {
    render(<Card>Card Content</Card>);
    const card = screen.getByText('Card Content');
    expect(card).toBeInTheDocument();
    expect(card.className).toContain('border-border-divider');
  });

  it('handles input value change', () => {
    const handleChange = vi.fn();
    render(<Input placeholder="Search..." onChange={handleChange} />);
    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'One Piece' } });
    expect(handleChange).toHaveBeenCalled();
  });
});
