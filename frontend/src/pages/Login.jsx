import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState('reseller'); // 'reseller' or 'supplier'
  const [formData, setFormData] = useState({
    email: '', password: '', name: '', walletAddress: '', companyName: '', storeName: ''
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = role === 'supplier' ? '/api/suppliers' : '/api/resellers';
    const url = `http://localhost:3001${endpoint}/${isRegister ? 'register' : 'login'}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      
      if (response.ok) {
        // Save user & role to local storage for simple auth
        localStorage.setItem('user', JSON.stringify({ ...data, role }));
        if (role === 'supplier') navigate('/supplier');
        else navigate('/');
        window.location.reload(); // Quick fix to refresh navbar state
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert('Connection error');
    }
  };

  return (
    <div className="flex justify-center items-center h-[80vh]">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-alibaba-orange">
          {isRegister ? 'Join Free' : 'Sign In'}
        </h2>
        
        <div className="flex justify-center mb-4">
          <button 
            className={`px-4 py-1 ${role === 'reseller' ? 'border-b-2 border-alibaba-orange font-bold' : ''}`}
            onClick={() => setRole('reseller')}
          >
            Reseller
          </button>
          <button 
            className={`px-4 py-1 ${role === 'supplier' ? 'border-b-2 border-alibaba-orange font-bold' : ''}`}
            onClick={() => setRole('supplier')}
          >
            Supplier
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <input 
                type="text" placeholder="Full Name" className="w-full border p-2 rounded"
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
              <input 
                type="text" placeholder="Wallet Address (0x...)" className="w-full border p-2 rounded"
                onChange={e => setFormData({...formData, walletAddress: e.target.value})}
              />
              {role === 'supplier' ? (
                 <input 
                 type="text" placeholder="Company Name" className="w-full border p-2 rounded"
                 onChange={e => setFormData({...formData, companyName: e.target.value})}
               />
              ) : (
                <input 
                type="text" placeholder="Store Name" className="w-full border p-2 rounded"
                onChange={e => setFormData({...formData, storeName: e.target.value})}
              />
              )}
            </>
          )}
          
          <input 
            type="email" placeholder="Email" className="w-full border p-2 rounded"
            onChange={e => setFormData({...formData, email: e.target.value})}
          />
          <input 
            type="password" placeholder="Password" className="w-full border p-2 rounded"
            onChange={e => setFormData({...formData, password: e.target.value})}
          />

          <button type="submit" className="w-full bg-alibaba-orange text-white py-2 rounded hover:bg-orange-600 transition">
            {isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600 cursor-pointer" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? 'Already have an account? Sign in' : 'New user? Register for free'}
        </p>
      </div>
    </div>
  );
};

export default Login;