// src/pages/Dashboard.tsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../index.css';

const Dashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  console.log('[DASHBOARD] Component rendered');
  console.log('[DASHBOARD] Current user:', user);
  console.log('[DASHBOARD] Current token:', token?.substring(0, 20) + '...');

  const handleLogout = () => {
    console.log('[DASHBOARD] Logout button clicked');
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">
            Welcome, {user?.username}! 🎉
          </h2>
          
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">User Information</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-600"><strong>ID:</strong> {user?.id}</p>
                <p className="text-gray-600"><strong>Username:</strong> {user?.username}</p>
                <p className="text-gray-600"><strong>Email:</strong> {user?.email}</p>
              </div>
            </div>

            <div className="border-b pb-4">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">JWT Token (First 50 chars)</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-600 font-mono text-sm break-all">
                  {token?.substring(0, 50)}...
                </p>
                <p className="text-gray-500 text-xs mt-2">
                  Check browser console for full token details
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Session Status</h3>
              <div className="bg-green-50 p-4 rounded-md border border-green-200">
                <p className="text-green-700">✅ Authenticated and authorized</p>
                <p className="text-green-600 text-sm mt-1">
                  Your JWT token is valid and stored in localStorage
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;