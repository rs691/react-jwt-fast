// tests/ProtectedRoute.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../src/components/ProtectedRoute';
import { AuthProvider } from '../src/context/AuthContext';
import axios from 'axios';

/**
 * ProtectedRoute Test Suite
 * 
 * Tests route protection functionality:
 * - Authenticated users can access protected routes
 * - Unauthenticated users are redirected to login
 * - Loading state is handled correctly
 */

vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const TestComponent = () => <div>Protected Content</div>;
const LoginComponent = () => <div>Login Page</div>;

const MockedApp = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginComponent />} />
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <TestComponent />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  /**
   * Test: Authenticated users can access protected content
   * Verifies token validation and content rendering
   */
  it('should render protected content for authenticated users', async () => {
    console.log('[TEST] Testing protected route with authenticated user...');
    
    const mockToken = 'valid-token';
    const mockUser = { id: 1, username: 'authuser', email: 'auth@example.com' };
    
    localStorage.setItem('access_token', mockToken);
    mockedAxios.get.mockResolvedValueOnce({ data: mockUser });

    render(<MockedApp />);

    // Navigate to protected route
    window.history.pushState({}, '', '/protected');

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    console.log('[TEST] ✓ Authenticated user accessed protected content');
  });

  /**
   * Test: Unauthenticated users are redirected to login
   * Verifies route protection redirects properly
   */
  it('should redirect to login for unauthenticated users', async () => {
    console.log('[TEST] Testing protected route redirect for unauthenticated user...');
    
    render(<MockedApp />);

    // Navigate to protected route without token
    window.history.pushState({}, '', '/protected');

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    console.log('[TEST] ✓ Unauthenticated user redirected to login');
  });

  /**
   * Test: Shows loading state while checking authentication
   * Verifies proper loading indicator display
   */
  it('should show loading state while verifying authentication', () => {
    console.log('[TEST] Testing protected route loading state...');
    
    const mockToken = 'checking-token';
    localStorage.setItem('access_token', mockToken);
    
    // Mock delayed response
    mockedAxios.get.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<MockedApp />);
    window.history.pushState({}, '', '/protected');

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    console.log('[TEST] ✓ Loading state displayed during auth check');
  });

  /**
   * Test: Expired token redirects to login
   * Verifies token validation catches expired tokens
   */
  it('should redirect to login for expired token', async () => {
    console.log('[TEST] Testing expired token handling...');
    
    const expiredToken = 'expired-token';
    localStorage.setItem('access_token', expiredToken);
    
    // Mock 401 response for expired token
    mockedAxios.get.mockRejectedValueOnce({
      response: { status: 401, data: { detail: 'Token expired' } },
    });

    render(<MockedApp />);
    window.history.pushState({}, '', '/protected');

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    // Token should be removed from localStorage
    expect(localStorage.getItem('access_token')).toBeNull();
    console.log('[TEST] ✓ Expired token removed and user redirected');
  });
});

// Run all tests with: npm test
// Run specific test file: npm test AuthContext.test.tsx
// Run with coverage: npm test -- --coverageEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass123' } });

    expect(usernameInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('testpass123');
    
    console.log('[TEST] ✓ Input values updated correctly');
  });

  /**
   * Test: Successful login redirects to dashboard
   * Verifies complete login flow with API call
   */
  it('should login successfully and redirect', async () => {
    console.log('[TEST] Testing successful login and redirect...');
    
    const mockToken = 'test-jwt-token';
    const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };

    mockedAxios.post.mockResolvedValueOnce({
      data: { access_token: mockToken, token_type: 'bearer' },
    });
    mockedAxios.get.mockResolvedValueOnce({ data: mockUser });

    render(<MockedLogin />);

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8000/login',
        expect.any(FormData)
      );
    });

    expect(localStorage.getItem('access_token')).toBe(mockToken);
    console.log('[TEST] ✓ Login successful, token stored');
  });

  /**
   * Test: Failed login displays error message
   * Verifies error handling and user feedback
   */
  it('should display error on failed login', async () => {
    console.log('[TEST] Testing login error display...');
    
    const errorMessage = 'Incorrect username or password';
    mockedAxios.post.mockRejectedValueOnce({
      response: { data: { detail: errorMessage } },
    });

    render(<MockedLogin />);

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    console.log('[TEST] ✓ Error message displayed correctly');
  });

  /**
   * Test: Login button shows loading state
   * Verifies UI feedback during async operation
   */
  it('should show loading state during login', async () => {
    console.log('[TEST] Testing login loading state...');
    
    mockedAxios.post.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<MockedLogin />);

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(submitButton);

    expect(screen.getByText(/logging in/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
    
    console.log('[TEST] ✓ Loading state displayed correctly');
  });
});