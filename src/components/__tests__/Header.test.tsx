// src/components/__tests__/Header.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Header from '../Header';

// Mock the useAuth hook
const mockUseAuth = vi.fn();
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Menu: () => <div data-testid="menu-icon">Menu</div>,
  X: () => <div data-testid="x-icon">X</div>,
  User: () => <div data-testid="user-icon">User</div>,
  ChevronDown: () => <div data-testid="chevron-down-icon">ChevronDown</div>,
  Globe: () => <div data-testid="globe-icon">Globe</div>,
}));

const renderHeader = () => {
  return render(
    <BrowserRouter>
      <Header />
    </BrowserRouter>
  );
};

describe('Header Component', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      loading: false,
    });
  });

  it('renders the header with logo and navigation', () => {
    renderHeader();

    // Check if logo is present
    expect(screen.getByText('FlightBook')).toBeInTheDocument();

    // Check if navigation links are present
    expect(screen.getByText('Flights')).toBeInTheDocument();
    expect(screen.getByText('Hotels')).toBeInTheDocument();
    expect(screen.getByText('Visa')).toBeInTheDocument();
    expect(screen.getByText('Packages')).toBeInTheDocument();
  });

  it('shows login and register buttons when user is not authenticated', () => {
    renderHeader();

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  it('shows user menu when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      currentUser: {
        displayName: 'John Doe',
        email: 'john@example.com',
      },
      loading: false,
    });

    renderHeader();

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
    expect(screen.queryByText('Register')).not.toBeInTheDocument();
  });

  it('toggles mobile menu when hamburger button is clicked', () => {
    renderHeader();

    const menuButton = screen.getByTestId('menu-icon').closest('button');
    expect(menuButton).toBeInTheDocument();

    // Menu should be closed initially
    expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument();

    // Click to open menu
    fireEvent.click(menuButton!);

    // Menu should now be open
    const mobileMenu = screen.getByTestId('mobile-menu');
    expect(mobileMenu).toBeInTheDocument();
    expect(mobileMenu).toHaveClass('translate-x-0');
  });

  it('closes mobile menu when close button is clicked', () => {
    renderHeader();

    const menuButton = screen.getByTestId('menu-icon').closest('button');
    fireEvent.click(menuButton!);

    const mobileMenu = screen.getByTestId('mobile-menu');
    expect(mobileMenu).toBeInTheDocument();

    const closeButton = screen.getByTestId('x-icon').closest('button');
    fireEvent.click(closeButton!);

    // Menu should be closed (translated to the right)
    expect(mobileMenu).toHaveClass('translate-x-full');
  });

  it('displays country selector', () => {
    renderHeader();

    expect(screen.getByText('🇺🇸')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    renderHeader();

    const menuButton = screen.getByTestId('menu-icon').closest('button');
    expect(menuButton).toHaveAttribute('aria-label', 'Toggle menu');

    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
  });
});
