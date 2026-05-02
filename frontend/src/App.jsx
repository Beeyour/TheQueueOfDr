import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './views/AdminDashboard';
import DoctorControl from './views/DoctorControl';
import PatientView from './views/PatientView';

// Secure admin path - obscure and hard to guess
const ADMIN_PATH = '/admin-secure-gate-7a3f9k2m';

// Simple 404 component
function NotFound() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-gray-600">Page not found</p>
      </div>
    </div>
  );
}

// Simple landing page
function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-blue-900 mb-4">Hospital Queue System</h1>
        <p className="text-gray-600">Please scan your QR code to proceed</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          {/* Secure admin route - obscure path */}
          <Route path={ADMIN_PATH} element={<AdminDashboard />} />
          
          {/* Public routes for doctors and patients */}
          <Route path="/dr/:uuid" element={<DoctorControl />} />
          <Route path="/patient/:uuid" element={<PatientView />} />
          
          {/* Root redirects to landing page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* All other routes show 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
// Export admin path for use in other components if needed
export { ADMIN_PATH };
