import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleViewProduct = (id) => {
    navigate(`/product/${id}`);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-[60vh]">
      <div className="relative">
         <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-6 py-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 animate-fade-in-up">
        <div>
           <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Marketplace</h1>
           <p className="text-gray-500 mt-2">Discover premium products from verified suppliers</p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
           <button className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">Newest</button>
           <button className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-black text-white dark:bg-white dark:text-black shadow-lg hover:shadow-xl transition-all">Popular</button>
        </div>
      </div>
      
      {/* Grid Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
        {products.map((product, index) => (
          <div 
            key={product.id} 
            className="group relative bg-white dark:bg-[#1E1E1E] rounded-3xl overflow-hidden card-hover border border-gray-100 dark:border-gray-800 animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => handleViewProduct(product.id)}
          >
             
             {/* Image Area with Gradient Overlay on Hover */}
             <div className="relative h-64 bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden cursor-pointer">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-300 dark:text-gray-600">
                    <svg className="w-16 h-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span className="text-sm font-medium">No Image</span>
                  </div>
                )}
                
                {/* Floating Badge */}
                {product.stock <= 5 && product.stock > 0 && (
                   <span className="absolute top-4 right-4 bg-red-500/90 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">Low Stock</span>
                )}
             </div>

             {/* Content Area */}
             <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                   <div className="text-xs font-bold text-orange-500 uppercase tracking-wider bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-md">
                      {product.Supplier?.companyName || 'Supplier'}
                   </div>
                   <div className="flex items-center text-xs text-gray-400">
                      <svg className="w-3 h-3 mr-1 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      {/* Rating Placeholder - could be dynamic later */}
                      5.0
                   </div>
                </div>

                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-orange-500 transition-colors">
                   {product.name}
                </h3>
                
                <div className="flex items-baseline space-x-1 mb-4">
                   <span className="text-2xl font-extrabold text-gray-900 dark:text-white">{product.price}</span>
                   <span className="text-sm font-medium text-gray-500">ETH</span>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-700 pt-4 flex items-center justify-between gap-4">
                   <div className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="block text-xs">Stock</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{product.stock} units</span>
                   </div>
                   
                   <button 
                     className="flex-1 bg-black dark:bg-white text-white dark:text-black py-3 rounded-xl font-bold text-sm hover:bg-orange-600 dark:hover:bg-gray-200 transition-all shadow-lg hover:shadow-xl transform active:scale-95"
                   >
                     View Details
                   </button>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marketplace;