import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminPage from './src/AdminPage';

vi.mock('./src/supabaseClient', () => ({ supabase: null }));

describe('AdminPage Debug', () => {
  it('renders without crashing', () => {
    console.log('Starting test...');
    const { container } = render(<AdminPage />);
    console.log('Component rendered');
    console.log('Container HTML:', container.innerHTML);
    
    // Check if "Admin" text exists
    const adminText = screen.queryByText('Admin');
    console.log('Admin text found:', !!adminText);
    
    // Check if the Supabase message exists
    const supabaseText = screen.queryByText(/Supabase is not configured/i);
    console.log('Supabase text found:', !!supabaseText);
    
    expect(adminText).toBeInTheDocument();
    expect(supabaseText).toBeInTheDocument();
  });
});
