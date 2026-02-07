import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminPage from './AdminPage';

vi.mock('./supabaseClient', () => ({ supabase: null }));

describe('AdminPage', () => {
  it('shows not configured when Supabase is missing', () => {
    render(<AdminPage />);
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText(/Supabase is not configured/i)).toBeInTheDocument();
  });
});
