import { useState, useEffect } from 'react';

const ResellerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user?.id) {
      fetchOrders();
    }
  }, []);

  const fetchOrders = async () => {
    const res = await fetch(`http://localhost:3001/api/resellers/${user.id}/orders`);
    const data = await res.json();
    setOrders(data);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 border-b">Product</th>
              <th className="p-4 border-b">Supplier</th>
              <th className="p-4 border-b">Quantity</th>
              <th className="p-4 border-b">Total Price</th>
              <th className="p-4 border-b">Status</th>
              <th className="p-4 border-b">Transaction</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-bold">{order.Product?.name}</div>
                </td>
                <td className="p-4">{order.Supplier?.name}</td>
                <td className="p-4">{order.quantity}</td>
                <td className="p-4 text-alibaba-orange font-bold">{order.totalPrice} ETH</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold
                    ${order.status === 'paid' ? 'bg-green-100 text-green-800' : 
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100'}`}>
                    {order.status.toUpperCase()}
                  </span>
                </td>
                <td className="p-4 text-sm font-mono text-gray-500">
                  {order.txHash ? order.txHash.substring(0, 16) + '...' : 'Pending'}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">No orders found. Go to Marketplace to buy something!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResellerDashboard;