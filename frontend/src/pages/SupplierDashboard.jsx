import { useState, useEffect } from 'react';

const SupplierDashboard = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('products');
  const [newProduct, setNewProduct] = useState({
    name: '', description: '', price: '', stock: '', imageUrl: '', category: ''
  });

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user?.id) {
      fetchProducts();
      fetchOrders();
    }
  }, []);

  const fetchProducts = async () => {
    const res = await fetch(`http://localhost:3001/api/suppliers/${user.id}/products`);
    const data = await res.json();
    setProducts(data);
  };

  const fetchOrders = async () => {
    const res = await fetch(`http://localhost:3001/api/suppliers/${user.id}/orders`);
    const data = await res.json();
    setOrders(data);
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3001/api/suppliers/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newProduct, supplierId: user.id })
      });
      if (res.ok) {
        alert('Product Added');
        setNewProduct({ name: '', description: '', price: '', stock: '', imageUrl: '', category: '' });
        fetchProducts();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 flex">
      {/* Sidebar */}
      <div className="w-1/4 bg-white rounded shadow p-4 mr-6 h-fit">
        <h2 className="font-bold text-xl mb-4">Supplier Center</h2>
        <ul className="space-y-2">
          <li 
            className={`cursor-pointer p-2 rounded ${activeTab === 'products' ? 'bg-alibaba-gray font-bold' : 'hover:bg-gray-100'}`}
            onClick={() => setActiveTab('products')}
          >
            My Products
          </li>
          <li 
            className={`cursor-pointer p-2 rounded ${activeTab === 'orders' ? 'bg-alibaba-gray font-bold' : 'hover:bg-gray-100'}`}
            onClick={() => setActiveTab('orders')}
          >
            Incoming Orders
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="w-3/4">
        {activeTab === 'products' && (
          <div>
             <div className="bg-white p-6 rounded shadow mb-6">
                <h3 className="font-bold mb-4">Add New Product</h3>
                <form onSubmit={handleCreateProduct} className="grid grid-cols-2 gap-4">
                   <input type="text" placeholder="Product Name" className="border p-2 rounded" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required />
                   <input type="text" placeholder="Category" className="border p-2 rounded" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} />
                   <input type="number" placeholder="Price (ETH)" className="border p-2 rounded" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} required />
                   <input type="number" placeholder="Stock" className="border p-2 rounded" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} required />
                   <input type="text" placeholder="Image URL" className="border p-2 rounded col-span-2" value={newProduct.imageUrl} onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})} />
                   <textarea placeholder="Description" className="border p-2 rounded col-span-2" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                   <button type="submit" className="bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 col-span-2">Publish Product</button>
                </form>
             </div>

             <div className="bg-white p-6 rounded shadow">
                <h3 className="font-bold mb-4">Product List</h3>
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2">Name</th>
                      <th className="p-2">Price</th>
                      <th className="p-2">Stock</th>
                      <th className="p-2">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">{p.name}</td>
                        <td className="p-2 text-alibaba-orange">{p.price} ETH</td>
                        <td className="p-2">{p.stock}</td>
                        <td className="p-2">{p.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
        )}

        {activeTab === 'orders' && (
           <div className="bg-white p-6 rounded shadow">
              <h3 className="font-bold mb-4">Order Management</h3>
              <table className="w-full text-left">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2">Order ID</th>
                      <th className="p-2">Product</th>
                      <th className="p-2">Qty</th>
                      <th className="p-2">Total</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Blockchain Tx</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">#{o.id}</td>
                        <td className="p-2">{o.Product?.name}</td>
                        <td className="p-2">{o.quantity}</td>
                        <td className="p-2 font-bold">{o.totalPrice} ETH</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded text-xs ${o.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {o.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-2 text-xs text-blue-500 truncate max-w-[150px]">
                           {o.txHash ? <a href="#" title={o.txHash}>{o.txHash.substring(0, 10)}...</a> : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
           </div>
        )}
      </div>
    </div>
  );
};

export default SupplierDashboard;