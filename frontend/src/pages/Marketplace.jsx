import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import SupplyChainB2B from '../abi/SupplyChainB2B.json';

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Local Hardhat Address

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(null);

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
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (product) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'reseller') {
      alert('Please login as a Reseller to buy.');
      return;
    }

    if (!window.ethereum) {
      alert('Please install MetaMask!');
      return;
    }

    const qty = prompt(`How many ${product.name} do you want to buy? (Stock: ${product.stock})`, "1");
    if (!qty) return;
    const quantity = parseInt(qty);
    if (quantity > product.stock) {
      alert('Insufficient stock');
      return;
    }

    setBuying(product.id);
    
    try {
      // 1. Create Order in Backend (Pending)
      const totalPrice = parseFloat(product.price) * quantity;
      const orderRes = await fetch('http://localhost:3001/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resellerId: user.id,
          supplierId: product.supplierId,
          productId: product.id,
          quantity,
          totalPrice
        })
      });
      const order = await orderRes.json();
      
      if (!order.id) throw new Error('Failed to create order');

      // 2. Pay via Blockchain
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, SupplyChainB2B, signer);

      const amountInWei = ethers.utils.parseEther(totalPrice.toString()); // Assuming price is in ETH for demo
      
      const tx = await contract.payOrder(order.id, product.Supplier.walletAddress, {
        value: amountInWei
      });
      
      await tx.wait();
      
      // 3. Confirm Payment to Backend
      await fetch(`http://localhost:3001/api/orders/${order.id}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txHash: tx.hash })
      });

      alert('Order Placed & Paid Successfully!');
      fetchProducts(); // Refresh stock
    } catch (error) {
      console.error(error);
      alert('Transaction failed: ' + error.message);
    } finally {
      setBuying(null);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Marketplace...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Sourced Products</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden border border-gray-200">
             <div className="h-48 bg-gray-200 flex items-center justify-center">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-gray-400">No Image</span>
                )}
             </div>
             <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-800 truncate">{product.name}</h3>
                <p className="text-alibaba-orange font-bold text-xl mt-1">{product.price} ETH</p>
                <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                   <span>Min. Order: 1</span>
                   <span>Stock: {product.stock}</span>
                </div>
                <div className="mt-2 text-xs text-gray-400 truncate">
                   Supplier: {product.Supplier?.companyName || product.Supplier?.name}
                </div>
                <button 
                  onClick={() => handleBuy(product)}
                  disabled={buying === product.id || product.stock === 0}
                  className="mt-4 w-full bg-alibaba-orange text-white py-2 rounded font-bold hover:bg-orange-600 disabled:bg-gray-300 transition"
                >
                  {buying === product.id ? 'Processing...' : (product.stock === 0 ? 'Out of Stock' : 'Contact Supplier / Buy')}
                </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marketplace;