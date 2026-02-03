import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState('reseller'); 
  const [formData, setFormData] = useState({
    email: '', password: '', name: '', walletAddress: '', companyName: '', storeName: ''
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = role === 'supplier' ? '/api/suppliers' : '/api/resellers';
    const url = `http://localhost:3001${endpoint}/${isRegister ? 'register' : 'login'}`;
    
    const loadingToast = toast.loading(isRegister ? 'Creating account...' : 'Signing in...');

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      
      if (response.ok) {
        toast.success(isRegister ? 'Account created successfully!' : 'Welcome back!', { id: loadingToast });
        localStorage.setItem('user', JSON.stringify({ ...data, role }));
        setTimeout(() => {
          if (role === 'supplier') navigate('/supplier');
          else navigate('/');
          window.location.reload();
        }, 1000);
      } else {
        toast.error(data.message || 'Authentication failed', { id: loadingToast });
      }
    } catch (error) {
      console.error(error);
      toast.error('Connection error. Please try again.', { id: loadingToast });
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-gray-50 dark:bg-[#0a0a0a]">
      {/* Left Side - Image/Background with Animated Overlay */}
      <div className="hidden md:flex w-1/2 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transform scale-105 hover:scale-100 transition-transform duration-[10s]"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556740758-90de374c12ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-12">
           <div className="text-white animate-fade-in-up">
              <h1 className="text-5xl font-bold mb-4 leading-tight">Empowering <br/>B2B Commerce</h1>
              <p className="text-xl text-gray-200 max-w-md">Join the next generation supply chain network secured by blockchain technology.</p>
           </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md animate-fade-in-up animate-delay-100">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {isRegister ? 'Start your journey with us today' : 'Please enter your details to sign in'}
            </p>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-800/50 p-1.5 rounded-2xl flex mb-8">
            <button 
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${role === 'reseller' ? 'bg-white dark:bg-[#1E1E1E] shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              onClick={() => setRole('reseller')}
            >
              Reseller
            </button>
            <button 
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${role === 'supplier' ? 'bg-white dark:bg-[#1E1E1E] shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              onClick={() => setRole('supplier')}
            >
              Supplier
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="text" placeholder="Full Name" className="input-modern"
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                  <input 
                    type="text" placeholder="Wallet Address" className="input-modern"
                    onChange={e => setFormData({...formData, walletAddress: e.target.value})}
                  />
                </div>
                <input 
                  type="text" placeholder={role === 'supplier' ? "Company Name" : "Store Name"} className="input-modern"
                  onChange={e => role === 'supplier' ? setFormData({...formData, companyName: e.target.value}) : setFormData({...formData, storeName: e.target.value})}
                />
              </>
            )}
            
            <input 
              type="email" placeholder="Email Address" className="input-modern"
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
            <input 
              type="password" placeholder="Password" className="input-modern"
              onChange={e => setFormData({...formData, password: e.target.value})}
            />

            <button type="submit" className="w-full btn-primary mt-4">
              {isRegister ? 'Get Started' : 'Sign In'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            {isRegister ? 'Already have an account? ' : 'New to B2B Chain? '}
            <button className="text-orange-500 font-bold hover:underline" onClick={() => setIsRegister(!isRegister)}>
              {isRegister ? 'Sign In' : 'Create Account'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;