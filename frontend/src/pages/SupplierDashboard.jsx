import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const SupplierDashboard = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [trash, setTrash] = useState([]);
  const [activeTab, setActiveTab] = useState('products');
  const [isEditing, setIsEditing] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '', description: '', price: '', stock: '', category: '', image: null
  });

  const user = JSON.parse(localStorage.getItem('user'));

  const fetchProducts = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/suppliers/${user.id}/products`);
      const data = await res.json();
      setProducts(data);
    } catch {
      toast.error('Failed to fetch products');
    }
  };

  const fetchTrash = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/products/trash?supplierId=${user.id}`);
      const data = await res.json();
      setTrash(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/suppliers/${user.id}/orders`);
      const data = await res.json();
      setOrders(data);
    } catch {
      toast.error('Failed to fetch orders');
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchProducts();
      fetchOrders();
      fetchTrash();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleEditProduct = (product) => {
    setNewProduct({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      category: product.category || '',
      image: null
    });
    setEditProductId(product.id);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setNewProduct({ name: '', description: '', price: '', stock: '', category: '', image: null });
    setIsEditing(false);
    setEditProductId(null);
    if(document.getElementById('fileInput')) document.getElementById('fileInput').value = '';
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading(isEditing ? 'Updating product...' : 'Publishing product...');
    
    try {
      const formData = new FormData();
      if (!isEditing) formData.append('supplierId', user.id);
      formData.append('name', newProduct.name);
      formData.append('description', newProduct.description);
      formData.append('price', newProduct.price);
      formData.append('stock', newProduct.stock);
      formData.append('category', newProduct.category);
      if (newProduct.image) {
        formData.append('image', newProduct.image);
      }

      const url = isEditing 
        ? `http://localhost:3001/api/products/${editProductId}`
        : 'http://localhost:3001/api/suppliers/products';
      
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        body: formData
      });

      if (res.ok) {
        toast.success(isEditing ? 'Product updated!' : 'Product published!', { id: loadingToast });
        handleCancelEdit();
        fetchProducts();
      } else {
        const err = await res.json();
        toast.error(err.message || 'Failed to save product', { id: loadingToast });
      }
    } catch (error) {
      console.error(error);
      toast.error('Error connecting to server', { id: loadingToast });
    }
  };

  const handleDeleteProduct = (productId) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <span className="font-semibold text-gray-800 dark:text-white">Delete this product?</span>
        <span className="text-sm text-gray-500">It will be moved to trash.</span>
        <div className="flex gap-2 mt-2">
          <button 
            onClick={() => {
              performDelete(productId);
              toast.dismiss(t.id);
            }}
            className="px-3 py-1 bg-red-500 text-white rounded-md text-sm font-bold hover:bg-red-600 transition"
          >
            Yes, Delete
          </button>
          <button 
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
      icon: '🗑️',
      style: {
        background: '#fff',
        color: '#333',
        padding: '16px',
        borderRadius: '12px',
      },
      className: 'dark:bg-[#1E1E1E] dark:border dark:border-gray-700',
    });
  };

  const performDelete = async (productId) => {
    try {
      const res = await fetch(`http://localhost:3001/api/products/${productId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Product moved to trash');
        fetchProducts();
        fetchTrash();
      } else {
        const err = await res.json();
        toast.error(err.message || 'Failed to delete product');
      }
    } catch {
      toast.error('Error connecting to server');
    }
  };

  const handleRestoreProduct = async (productId) => {
    try {
      const res = await fetch(`http://localhost:3001/api/products/${productId}/restore`, { method: 'POST' });
      if (res.ok) {
        toast.success('Product restored!');
        fetchTrash();
        fetchProducts();
      } else {
        toast.error('Failed to restore product');
      }
    } catch {
      toast.error('Error restoring product');
    }
  };

  // Calculate Stats
  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.totalPrice || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="container mx-auto px-6 py-10 animate-fade-in-up">
      {/* Header & Stats */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">Supplier Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl p-6 text-white shadow-lg shadow-orange-500/30">
            <h3 className="text-sm font-semibold opacity-90 mb-1">Total Revenue</h3>
            <p className="text-3xl font-bold">{totalRevenue.toFixed(2)} ETH</p>
          </div>
          <div className="bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Total Products</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{products.length}</p>
          </div>
          <div className="bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Pending Orders</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{pendingOrders}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:w-1/4 h-fit sticky top-24">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-lg dark:shadow-none p-4 border border-gray-100 dark:border-gray-800">
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => setActiveTab('products')}
                  className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'products' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                  Product Management
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'orders' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                  Incoming Orders
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('trash')}
                  className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'trash' ? 'bg-red-50 dark:bg-red-900/20 text-red-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                  Trash ({trash.length})
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:w-3/4">
          {activeTab === 'products' && (
            <div className="space-y-8">
               {/* Add/Edit Product Card */}
               <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-8 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
                    {isEditing && (
                      <button 
                        onClick={handleCancelEdit}
                        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>
                  <form onSubmit={handleCreateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                     <input type="text" placeholder="Product Name" className="input-modern" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required />
                     <input type="text" placeholder="Category" className="input-modern" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} />
                     <input type="number" placeholder="Price (ETH)" className="input-modern" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} required />
                     <input type="number" placeholder="Stock" className="input-modern" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} required />
                     <input type="text" placeholder="Image URL (http://...)" className="input-modern md:col-span-2" value={newProduct.imageUrl} onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})} />
                     <div className="md:col-span-2">
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Image {isEditing && '(Leave empty to keep existing)'}</label>
                       <input 
                         id="fileInput"
                         type="file" 
                         accept="image/*"
                         className="block w-full text-sm text-gray-500
                           file:mr-4 file:py-2.5 file:px-4
                           file:rounded-full file:border-0
                           file:text-sm file:font-semibold
                           file:bg-orange-50 file:text-orange-700
                           hover:file:bg-orange-100 dark:file:bg-orange-900/20 dark:file:text-orange-400
                           cursor-pointer
                         " 
                         onChange={e => setNewProduct({...newProduct, image: e.target.files[0]})} 
                       />
                     </div>

                     <textarea placeholder="Product Description" className="input-modern md:col-span-2 h-32 resize-none" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                     <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                        {isEditing && (
                          <button type="button" onClick={handleCancelEdit} className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            Cancel
                          </button>
                        )}
                        <button type="submit" className="btn-primary w-full md:w-auto">
                          {isEditing ? 'Update Product' : 'Publish Product'}
                        </button>
                     </div>
                  </form>
               </div>

               {/* Product Grid */}
               <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Your Products</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {products.map(p => (
                      <div key={p.id} className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 flex gap-4 items-center group">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-xl flex-shrink-0 overflow-hidden">
                           {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                           <h4 className="font-bold text-gray-900 dark:text-white truncate">{p.name}</h4>
                           <p className="text-orange-500 font-bold text-sm">{p.price} ETH</p>
                           <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Stock: {p.stock} • {p.category}</p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEditProduct(p)}
                            className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all"
                            title="Edit"
                          >
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-2 bg-red-50 dark:bg-red-900/20 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all"
                            title="Move to trash"
                          >
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'trash' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-bold text-gray-900 dark:text-white">Trash Bin</h3>
                 <span className="text-sm text-gray-500">Items are safe here</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {trash.length > 0 ? trash.map(p => (
                  <div key={p.id} className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-4 shadow-none border border-red-100 dark:border-red-900/30 flex gap-4 items-center">
                    <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-xl flex-shrink-0 overflow-hidden grayscale opacity-70">
                        {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>}
                    </div>
                    <div className="flex-1 min-w-0 opacity-70">
                        <h4 className="font-bold text-gray-900 dark:text-white truncate">{p.name}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Deleted: {new Date(p.deletedAt).toLocaleDateString()}</p>
                    </div>
                    <button 
                      onClick={() => handleRestoreProduct(p.id)}
                      className="px-3 py-1.5 bg-white dark:bg-gray-800 text-green-600 text-xs font-bold rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-green-50 transition-colors"
                    >
                      Restore
                    </button>
                  </div>
                )) : (
                  <div className="col-span-2 text-center py-10 text-gray-400">Trash is empty</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
             <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden border border-gray-100 dark:border-gray-800">
                <div className="p-8 border-b border-gray-100 dark:border-gray-800">
                   <h3 className="text-xl font-bold text-gray-900 dark:text-white">Order Management</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        <th className="p-6 text-xs font-bold text-gray-400 uppercase">Product</th>
                        <th className="p-6 text-xs font-bold text-gray-400 uppercase">Qty</th>
                        <th className="p-6 text-xs font-bold text-gray-400 uppercase">Total</th>
                        <th className="p-6 text-xs font-bold text-gray-400 uppercase">Status</th>
                        <th className="p-6 text-xs font-bold text-gray-400 uppercase">Tx</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {orders.map(o => (
                        <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                          <td className="p-6">
                             <div className="font-bold text-gray-900 dark:text-white">{o.Product?.name}</div>
                             <div className="text-xs text-gray-400">Order #{o.id}</div>
                          </td>
                          <td className="p-6 text-gray-600 dark:text-gray-300">{o.quantity}</td>
                          <td className="p-6 font-bold text-orange-500">{o.totalPrice} ETH</td>
                          <td className="p-6">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${o.status === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                              {o.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-6 text-xs">
                             {o.txHash ? (
                               <a href={`https://etherscan.io/tx/${o.txHash}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
                                  View <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                               </a>
                             ) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;