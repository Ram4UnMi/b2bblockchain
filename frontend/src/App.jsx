import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Marketplace from './pages/Marketplace';
import SupplierDashboard from './pages/SupplierDashboard';
import ResellerDashboard from './pages/ResellerDashboard';
import Navbar from './components/Navbar';

function App() {
  // Simple check for role (in real app, use Context/State)
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <Router>
      <div className="min-h-screen bg-alibaba-gray font-sans">
        <Navbar user={user} />
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Marketplace is public/reseller view */}
          <Route path="/" element={<Marketplace />} />
          
          <Route path="/supplier" element={
            user && user.role === 'supplier' ? <SupplierDashboard /> : <Navigate to="/login" />
          } />
          
          <Route path="/reseller" element={
            user && user.role === 'reseller' ? <ResellerDashboard /> : <Navigate to="/login" />
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;