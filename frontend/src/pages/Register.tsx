// src/pages/Register.tsx
import { AxiosError } from 'axios';
import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { ApiErrorResponse } from '../types';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  console.log('[REGISTER PAGE] Component rendered');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log('[REGISTER PAGE] Form submitted with username:', username, 'email:', email);
    
    setError('');

    if (password !== confirmPassword) {
      console.log('[REGISTER PAGE] Password mismatch detected');
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      console.log('[REGISTER PAGE] Password too short');
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      console.log('[REGISTER PAGE] Calling register function...');
      await register(username, email, password);
      console.log('[REGISTER PAGE] Registration successful, navigating to dashboard');
      navigate('/dashboard');
    } catch (err) {
      console.error('[REGISTER PAGE] Registration error:', err);
      
      const axiosError = err as AxiosError<ApiErrorResponse>;
      setError(axiosError.response?.data?.detail || 'Registration failed. Please try again.');
      
      console.log('[REGISTER PAGE] Error message set:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-600">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-96">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Register</h2>
        
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
            title='username'
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                console.log('[REGISTER PAGE] Username updated:', e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
            title='email'
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                console.log('[REGISTER PAGE] Email updated:', e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                console.log('[REGISTER PAGE] Password updated (length):', e.target.value.length);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Confirm Password
            </label>
            <input
            title='confirmPassword'
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                console.log('[REGISTER PAGE] Confirm password updated');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-500 text-white py-2 rounded-md hover:bg-purple-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;