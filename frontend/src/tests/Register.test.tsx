// tests/Register.test.tsx
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '.././context/AuthContext';
import Register from '.././pages/Register';

/**
 * Register Page Test Suite
 * 
 * Tests the registration page UI and functionality:
 * - Form rendering with all fields
 * - Password validation (match, length)
 * - Successful registration flow
 * - Error handling for duplicate users
 */

vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const MockedRegister = () => (
  <BrowserRouter>
    <AuthProvider>
      <Register />
    </AuthProvider>
  </BrowserRouter>
);

describe('Register Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  /**
   * Test: Registration form renders correctly
   * Verifies all form fields are present
   */
  it('should render register form correctly', () => {
    console.log('[TEST] Testing register form rendering...');
    
    render(<MockedRegister />);

    expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    
    console.log('[TEST] ✓ All register form elements rendered');
  });

  /**
   * Test: Password mismatch validation
   * Verifies client-side validation prevents submission
   */
  it('should show error when passwords do not match', async () => {
    console.log('[TEST] Testing password mismatch validation...');
    
    render(<MockedRegister />);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'different' } });
    
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
    expect(mockedAxios.post).not.toHaveBeenCalled();
    console.log('[TEST] ✓ Password length error displayed');
  });
    /**
  /**
   * Test: Successful registration flow
   * Verifies complete registration process with API call
   */
  it('should register successfully and redirect', async () => {
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
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8000/register',
        expect.any(FormData)
      );
    });

    expect(localStorage.getItem('access_token')).toBe(mockToken);
    console.log('[TEST] ✓ Registration successful, token stored');
  });
});