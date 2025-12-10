import { Navigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, role } = useStore();

  if (!user) {
    toast.error('Please login first');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    toast.error('Access denied - insufficient permissions');
    return <Navigate to="/" replace />;
  }

  return children;
}

// Usage in App.jsx:
// <Route path="/analytics" element={
//   <ProtectedRoute allowedRoles={['admin', 'manager']}>
//     <Analytics />
//   </ProtectedRoute>
// } />
