import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Marketplace from './pages/Marketplace';
import ProductDetail from './pages/ProductDetail';
import SupplierDashboard from './pages/SupplierDashboard';
import ResellerDashboard from './pages/ResellerDashboard';
import Navbar from './components/Navbar';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';

function App() {
  // Simple check for role (in real app, use Context/State)
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg font-sans text-gray-900 dark:text-dark-text transition-colors duration-200">
          <Navbar user={user} />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Marketplace />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/supplier" element={
              user && user.role === 'supplier' ? <SupplierDashboard /> : <Navigate to="/login" />
            } />
            <Route path="/reseller" element={
              user && user.role === 'reseller' ? <ResellerDashboard /> : <Navigate to="/login" />
            } />
          </Routes>
          <Toaster 
            position="bottom-right"
            toastOptions={{
              className: 'dark:bg-[#1E1E1E] dark:text-white',
              style: {
                borderRadius: '16px',
                padding: '12px 24px',
              },
            }}
          />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;