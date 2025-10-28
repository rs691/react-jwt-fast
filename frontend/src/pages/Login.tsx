// src/pages/Login.tsx
import { AxiosError } from 'axios';
import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { ApiErrorResponse } from '../types';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  console.log('[LOGIN PAGE] Component rendered');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log('[LOGIN PAGE] Form submitted with username:', username);
    
    setError('');
    setIsLoading(true);

    try {
      console.log('[LOGIN PAGE] Calling login function...');
      await login(username, password);
      console.log('[LOGIN PAGE] Login successful, navigating to dashboard');
      navigate('/dashboard');
    } catch (err) {
      console.error('[LOGIN PAGE] Login error:', err);
      
      const axiosError = err as AxiosError<ApiErrorResponse>;
      setError(axiosError.response?.data?.detail || 'Login failed. Please try again.');
      
      console.log('[LOGIN PAGE] Error message set:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-96">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Login</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Username
            </label>
            <input
                title="username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                console.log('[LOGIN PAGE] Username updated:', e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              title='password'
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                console.log('[LOGIN PAGE] Password updated (length):', e.target.value.length);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-500 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;