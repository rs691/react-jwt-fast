// tests/Login.test.tsx
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '.././context/AuthContext';
import Login from '.././pages/Login';

/**
 * Login Page Test Suite
 * 
 * Tests the login page UI and functionality:
 * - Form rendering and user input
 * - Form validation
 * - Successful login navigation
 * - Error display for failed login
 */

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

const MockedLogin = () => (
  <BrowserRouter>
    <AuthProvider>
      <Login />
    </AuthProvider>
  </BrowserRouter>
);

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  /**
   * Test: Login form renders all required elements
   * Verifies all form fields and buttons are present
   */
  it('should render login form correctly', () => {
    console.log('[TEST] Testing login form rendering...');
    
    render(<MockedLogin />);

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    
    console.log('[TEST] ✓ All login form elements rendered');
  });

  /**
   * Test: Form inputs update on user typing
   * Verifies two-way data binding works correctly
   */
  it('should update input values on change', () => {
    console.log('[TEST] Testing form input updates...');
    
    render(<MockedLogin />);

    const usernameInput = screen.getByLabelText(/username/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;

    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });

    expect(mockedAxios.post).not.toHaveBeenCalled();
    console.log('[TEST] ✓ Password mismatch error displayed');
  });

  /**
   * Test: Password length validation
   * Verifies minimum password length requirement
   */
  it('should show error for password shorter than 6 characters', async () => {
    console.log('[TEST] Testing password length validation...');
    
    render(<MockedRegister />);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'short' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'short' } });
    
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });

    console.log('[TEST] ✓ Password length validation working');
  });

  /**
   * Test: Successful registration and auto-login
   * Verifies complete registration flow
   */
  it('should register successfully and auto-login', async () => {
    console.log('[TEST] Testing successful registration...');
    
    const mockToken = 'new-user-token';
    const mockUser = { id: 1, username: 'newuser', email: 'new@example.com' };

    // Mock registration
    mockedAxios.post.mockResolvedValueOnce({ data: mockUser });
    // Mock auto-login
    mockedAxios.post.mockResolvedValueOnce({
      data: { access_token: mockToken, token_type: 'bearer' },
    });
    mockedAxios.get.mockResolvedValueOnce({ data: mockUser });

    render(<MockedRegister />);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalled();
    });

    expect(localStorage.getItem('access_token')).toBe(mockToken);
    console.log('[TEST] ✓ Registration and auto-login successful');
  });

  /**
   * Test: Duplicate user registration error
   * Verifies proper error handling for existing users
   */
  it('should display error for duplicate username or email', async () => {
    console.log('[TEST] Testing duplicate user error...');
    
    const errorMessage = 'Username or email already registered';
    mockedAxios.post.mockRejectedValueOnce({
      response: { data: { detail: errorMessage } },
    });

    render(<MockedRegister />);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'duplicate' } });
    fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: 'dup@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    console.log('[TEST] ✓ Duplicate user error displayed');
  });
});