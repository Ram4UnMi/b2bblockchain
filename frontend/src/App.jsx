import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SupplierDashboard from './pages/SupplierDashboard';
import ResellerDashboard from './pages/ResellerDashboard';
import CustomerStorefront from './pages/CustomerStorefront';
import './App.css';

function App() {
    return (
        <Router>
            <div>
                <nav>
                    <ul>
                        <li>
                            <Link to="/supplier">Supplier Dashboard</Link>
                        </li>
                        <li>
                            <Link to="/reseller">Reseller Dashboard</Link>
                        </li>
                        <li>
                            <Link to="/customer">Customer Storefront</Link>
                        </li>
                    </ul>
                </nav>

                <hr />

                <Routes>
                    <Route path="/supplier" element={<SupplierDashboard />} />
                    <Route path="/reseller" element={<ResellerDashboard />} />
                    <Route path="/customer" element={<CustomerStorefront />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
