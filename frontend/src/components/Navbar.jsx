import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-alibaba-orange flex items-center">
          B2B Chain
        </Link>

        {/* Search Bar (Visual Only) */}
        <div className="flex-1 mx-10 max-w-2xl hidden md:flex">
          <input 
            type="text" 
            placeholder="What are you looking for..." 
            className="w-full border-2 border-alibaba-orange rounded-l-full px-4 py-2 focus:outline-none"
          />
          <button className="bg-alibaba-orange text-white px-6 rounded-r-full font-bold hover:bg-orange-600">
            Search
          </button>
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-6 text-gray-600">
          {user ? (
            <>
              <span className="text-sm">Hi, {user.name}</span>
              {user.role === 'supplier' && (
                 <Link to="/supplier" className="hover:text-alibaba-orange">Dashboard</Link>
              )}
              {user.role === 'reseller' && (
                 <Link to="/reseller" className="hover:text-alibaba-orange">My Orders</Link>
              )}
              <button onClick={handleLogout} className="text-sm hover:text-red-500">Sign Out</button>
            </>
          ) : (
            <Link to="/login" className="flex items-center hover:text-alibaba-orange">
              <span className="ml-1">Sign In / Join</span>
            </Link>
          )}
          
          <div className="flex flex-col items-center cursor-pointer hover:text-alibaba-orange">
             <span className="text-xs">Messages</span>
          </div>
          <div className="flex flex-col items-center cursor-pointer hover:text-alibaba-orange">
             <span className="text-xs">Cart</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;