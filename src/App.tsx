import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthState } from './hooks/useAuthState';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Competitors from './pages/Competitors';
import Planning from './pages/Planning';
import Randomizer from './pages/Randomizer';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { user, loading } = useAuthState();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/competitors" element={
            <ProtectedRoute>
              <Competitors />
            </ProtectedRoute>
          } />
          <Route path="/planning" element={
            <ProtectedRoute>
              <Planning />
            </ProtectedRoute>
          } />
          <Route path="/randomizer" element={
            <ProtectedRoute>
              <Randomizer />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </>
  );
}

export default App;