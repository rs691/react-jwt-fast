// tests/AuthContext.test.tsx
import { act, renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from '.././context/AuthContext';

/**
 * AuthContext Test Suite
 * 
 * Tests the authentication context which manages:
 * - User state management
 * - JWT token storage and retrieval
 * - Login/register/logout operations
 * - Token persistence in localStorage
 */

vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  /**
   * Test: Initial state should have no user or token
   * Verifies the context starts in an unauthenticated state
   */
  it('should initialize with no user and no token', async () => {
    console.log('[TEST] Testing initial auth state...');
    
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    console.log('[TEST] ✓ Initial state verified: no user, no token');
  });

  /**
   * Test: Token restoration from localStorage on mount
   * Verifies that existing tokens are loaded on app restart
   */
  it('should restore token from localStorage on mount', async () => {
    console.log('[TEST] Testing token restoration from localStorage...');
    
    const mockToken = 'stored-jwt-token';
    const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
    
    localStorage.setItem('access_token', mockToken);
    console.log('[TEST] Token set in localStorage:', mockToken);
    
    mockedAxios.get.mockResolvedValueOnce({ data: mockUser });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    expect(result.current.token).toBe(mockToken);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'http://localhost:8000/users/me',
      { headers: { Authorization: `Bearer ${mockToken}` } }
    );
    console.log('[TEST] ✓ Token restored and user fetched successfully');
  });

  /**
   * Test: Successful login flow
   * Verifies login stores token, fetches user data, and updates state
   */
  it('should login successfully and store token', async () => {
    console.log('[TEST] Testing successful login flow...');
    
    const mockToken = 'new-jwt-token';
    const mockUser = { id: 1, username: 'loginuser', email: 'login@example.com' };
    
    mockedAxios.post.mockResolvedValueOnce({
      data: { access_token: mockToken, token_type: 'bearer' },
    });
    mockedAxios.get.mockResolvedValueOnce({ data: mockUser });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.login('loginuser', 'password123');
    });

    expect(result.current.token).toBe(mockToken);
    expect(result.current.user).toEqual(mockUser);
    expect(localStorage.getItem('access_token')).toBe(mockToken);
    console.log('[TEST] ✓ Login successful, token stored in localStorage');
  });

  /**
   * Test: Failed login with incorrect credentials
   * Verifies proper error handling and no state changes on failure
   */
  it('should handle login failure correctly', async () => {
    console.log('[TEST] Testing login failure handling...');
    
    const errorResponse = {
      response: {
        data: { detail: 'Incorrect username or password' },
      },
    };
    
    mockedAxios.post.mockRejectedValueOnce(errorResponse);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await expect(
      act(async () => {
        await result.current.login('wronguser', 'wrongpass');
      })
    ).rejects.toEqual(errorResponse);

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(localStorage.getItem('access_token')).toBeNull();
    console.log('[TEST] ✓ Login failure handled correctly, no state changes');
  });

  /**
   * Test: Successful registration and auto-login
   * Verifies registration creates user and automatically logs them in
   */
  it('should register successfully and auto-login', async () => {
    console.log('[TEST] Testing registration with auto-login...');
    
    const mockToken = 'registered-jwt-token';
    const mockUser = { id: 2, username: 'newuser', email: 'new@example.com' };
    
    // Mock registration
    mockedAxios.post.mockResolvedValueOnce({ data: mockUser });
    
    // Mock auto-login after registration
    mockedAxios.post.mockResolvedValueOnce({
      data: { access_token: mockToken, token_type: 'bearer' },
    });
    mockedAxios.get.mockResolvedValueOnce({ data: mockUser });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.register('newuser', 'new@example.com', 'password123');
    });

    expect(result.current.token).toBe(mockToken);
    expect(result.current.user).toEqual(mockUser);
    expect(localStorage.getItem('access_token')).toBe(mockToken);
    console.log('[TEST] ✓ Registration successful with auto-login');
  });

  /**
   * Test: Registration with duplicate username
   * Verifies proper error handling for duplicate users
   */
  it('should handle registration failure for duplicate user', async () => {
    console.log('[TEST] Testing duplicate user registration...');
    
    const errorResponse = {
      response: {
        data: { detail: 'Username or email already registered' },
      },
    };
    
    mockedAxios.post.mockRejectedValueOnce(errorResponse);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await expect(
      act(async () => {
        await result.current.register('duplicate', 'dup@example.com', 'pass');
      })
    ).rejects.toEqual(errorResponse);

    expect(result.current.user).toBeNull();
    console.log('[TEST] ✓ Duplicate registration rejected correctly');
  });

  /**
   * Test: Logout clears user state and localStorage
   * Verifies complete cleanup on logout
   */
  it('should logout and clear user data', async () => {
    console.log('[TEST] Testing logout functionality...');
    
    const mockToken = 'logout-test-token';
    const mockUser = { id: 1, username: 'logoutuser', email: 'logout@example.com' };
    
    localStorage.setItem('access_token', mockToken);
    mockedAxios.get.mockResolvedValueOnce({ data: mockUser });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    console.log('[TEST] User logged in, now testing logout...');

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(localStorage.getItem('access_token')).toBeNull();
    console.log('[TEST] ✓ Logout successful, all data cleared');
  });
});