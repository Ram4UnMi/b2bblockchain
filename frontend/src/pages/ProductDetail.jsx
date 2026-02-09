import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import SupplyChainB2B from '../abi/SupplyChainB2B.json';
import toast from 'react-hot-toast';

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  
  // Rating State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const [showBuyModal, setShowBuyModal] = useState(false);
  const [purchaseQty, setPurchaseQty] = useState(1);

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchProductDetail();
  }, [id]);

  const fetchProductDetail = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/products/${id}`);
      if (!res.ok) throw new Error('Product not found');
      const data = await res.json();
      setProduct(data);
    } catch (error) {
      toast.error('Failed to load product');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBuyModal = () => {
    if (!user || user.role !== 'reseller') {
      toast.error('Please login as a Reseller to buy.');
      return;
    }
    setPurchaseQty(1);
    setShowBuyModal(true);
  };

  const handleBuy = async () => {
    if (!window.ethereum) {
      toast.error('Please install MetaMask!');
      return;
    }

    const quantity = parseInt(purchaseQty);
    if (isNaN(quantity) || quantity <= 0) {
      toast.error('Invalid quantity');
      return;
    }
    
    if (quantity > product.stock) {
      toast.error('Insufficient stock');
      return;
    }

    setShowBuyModal(false);
    const loadingToast = toast.loading('Processing transaction...');
    setBuying(true);

    try {
      const totalPrice = parseFloat(product.price) * quantity;
      
      // 1. Backend Order
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
      
      // 2. Blockchain Payment
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, SupplyChainB2B, signer);
      const amountInWei = ethers.utils.parseEther(totalPrice.toString());
      
      const tx = await contract.payOrder(order.id, product.Supplier.walletAddress, {
        value: amountInWei
      });
      
      toast.loading('Confirming payment...', { id: loadingToast });
      await tx.wait();
      
      // 3. Confirm
      await fetch(`http://localhost:3001/api/orders/${order.id}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txHash: tx.hash })
      });

      toast.success('Purchase successful!', { id: loadingToast });
      fetchProductDetail();
    } catch (error) {
      console.error(error);
      toast.error('Transaction failed', { id: loadingToast });
    } finally {
      setBuying(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user || user.role !== 'reseller') {
      toast.error('Only resellers can rate products');
      return;
    }
    
    setSubmittingReview(true);
    try {
      const res = await fetch(`http://localhost:3001/api/products/${id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resellerId: user.id, rating, comment })
      });
      
      if (res.ok) {
        toast.success('Review added!');
        setComment('');
        fetchProductDetail();
      } else {
        toast.error('Failed to add review');
      }
    } catch (error) {
      toast.error('Error submitting review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!product) return null;

  const averageRating = product.Ratings?.length 
    ? (product.Ratings.reduce((a, b) => a + b.rating, 0) / product.Ratings.length).toFixed(1) 
    : 0;

  return (
    <div className="container mx-auto px-6 py-10 animate-fade-in-up">
      <div className="flex flex-col md:flex-row gap-10">
        {/* Left: Image */}
        <div className="md:w-1/2">
           <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800 p-8 flex items-center justify-center">
             {product.imageUrl ? (
               <img src={product.imageUrl} alt={product.name} className="max-h-[400px] object-contain" />
             ) : (
               <div className="h-64 flex items-center justify-center text-gray-400">No Image</div>
             )}
           </div>
        </div>

        {/* Right: Details */}
        <div className="md:w-1/2 space-y-6">
           <div>
              <div className="flex justify-between items-start">
                 <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">{product.name}</h1>
                 <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {product.Supplier?.companyName}
                 </span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                 <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-5 h-5 ${i < Math.round(averageRating) ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    ))}
                 </div>
                 <span className="text-gray-500 font-medium">({product.Ratings?.length || 0} reviews)</span>
              </div>
           </div>

           <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {product.price} <span className="text-base font-medium text-gray-500">ETH</span>
           </div>

           <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
             <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">Description</h3>
             <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                {product.description || 'No description provided by the supplier.'}
             </p>
           </div>

           <div className="border-t border-b border-gray-100 dark:border-gray-800 py-4 flex justify-between items-center text-sm">
              <span className="text-gray-500 dark:text-gray-400">Category: <span className="font-semibold text-gray-900 dark:text-white">{product.category || 'General'}</span></span>
              <span className="text-gray-500 dark:text-gray-400">Stock: <span className="font-semibold text-gray-900 dark:text-white">{product.stock} units</span></span>
           </div>

           <button 
             onClick={handleOpenBuyModal}
             disabled={buying || product.stock === 0}
             className="w-full btn-primary py-4 text-lg shadow-xl hover:shadow-orange-500/40"
           >
             {buying ? 'Processing Order...' : (product.stock === 0 ? 'Out of Stock' : 'Buy Now')}
           </button>
        </div>
      </div>

      {/* Purchase Modal */}
      {showBuyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-zoom-in">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Order Details</h3>
                <button onClick={() => setShowBuyModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4 items-center bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl">
                  <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-xl overflow-hidden flex-shrink-0">
                    {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">No Image</div>}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white truncate max-w-[200px]">{product.name}</h4>
                    <p className="text-orange-500 font-bold text-sm">{product.price} ETH</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Purchase Quantity</label>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setPurchaseQty(Math.max(1, purchaseQty - 1))}
                      className="w-12 h-12 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-bold text-xl"
                    >
                      -
                    </button>
                    <input 
                      type="number" 
                      min="1" 
                      max={product.stock}
                      value={purchaseQty}
                      onChange={(e) => setPurchaseQty(Math.min(product.stock, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="flex-1 h-12 text-center bg-gray-50 dark:bg-gray-800 border-none rounded-xl font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                    />
                    <button 
                      onClick={() => setPurchaseQty(Math.min(product.stock, purchaseQty + 1))}
                      className="w-12 h-12 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-bold text-xl"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 text-right">Available Stock: {product.stock}</p>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-gray-500 font-medium">Total Payment</span>
                    <span className="text-2xl font-black text-gray-900 dark:text-white">{(product.price * purchaseQty).toFixed(4)} ETH</span>
                  </div>
                  <button 
                    onClick={handleBuy}
                    className="w-full btn-primary py-4 text-lg shadow-lg"
                  >
                    Confirm Purchase
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div className="mt-16 max-w-4xl">
         <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Customer Reviews</h2>
         
         {/* Review Form */}
         {user && user.role === 'reseller' && (
           <form onSubmit={handleSubmitReview} className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl shadow-sm mb-8 border border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold mb-4 text-gray-800 dark:text-white">Write a Review</h3>
              <div className="flex gap-2 mb-4">
                 {[1, 2, 3, 4, 5].map((star) => (
                   <button 
                     key={star} 
                     type="button" 
                     onClick={() => setRating(star)}
                     className={`text-2xl transition-transform hover:scale-110 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                   >
                     ★
                   </button>
                 ))}
              </div>
              <textarea 
                className="input-modern mb-4 h-24 resize-none"
                placeholder="Share your experience..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                required
              />
              <button type="submit" disabled={submittingReview} className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg font-bold hover:opacity-90 disabled:opacity-50">
                 {submittingReview ? 'Posting...' : 'Post Review'}
              </button>
           </form>
         )}

         {/* Review List */}
         <div className="space-y-6">
            {product.Ratings?.length > 0 ? product.Ratings.map(review => (
               <div key={review.id} className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl">
                  <div className="flex justify-between mb-2">
                     <span className="font-bold text-gray-900 dark:text-white">{review.Reseller?.storeName || 'Reseller'}</span>
                     <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex text-yellow-400 text-sm mb-2">
                     {[...Array(5)].map((_, i) => (
                       <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                     ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">{review.comment}</p>
               </div>
            )) : (
              <p className="text-gray-500 italic">No reviews yet. Be the first to rate!</p>
            )}
         </div>
      </div>
    </div>
  );
};

export default ProductDetail;