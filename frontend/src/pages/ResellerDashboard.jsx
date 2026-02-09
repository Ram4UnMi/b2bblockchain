import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

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

  const handleExportData = () => {
    if (orders.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = ["Order ID", "Product Name", "Supplier", "Quantity", "Total Price (ETH)", "Status", "Transaction Hash"];
    const csvData = orders.map(order => [
      `"${order.id}"`,
      `"${order.Product?.name || 'N/A'}"`,
      `"${order.Supplier?.name || 'N/A'}"`,
      `"${order.quantity}"`,
      `"${order.totalPrice}"`,
      `"${order.status}"`,
      `"${order.txHash || 'N/A'}"`
    ]);

    const csvContent = [headers.join(","), ...csvData.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `reseller_orders_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Data exported successfully!");
  };

  return (
    <div className="container mx-auto px-6 py-10 animate-fade-in-up">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Order History</h1>
        <button 
          onClick={handleExportData}
          className="px-5 py-2 rounded-xl bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 text-sm font-semibold shadow-sm hover:shadow-md transition-all active:scale-95"
        >
          Export Data
        </button>
      </div>
      
      <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden border border-gray-100 dark:border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Product</th>
                <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Supplier</th>
                <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Qty</th>
                <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Total</th>
                <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Tx Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {orders.map((order, index) => (
                <tr 
                  key={order.id} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="p-6">
                    <div className="font-bold text-gray-900 dark:text-white">{order.Product?.name}</div>
                    <div className="text-xs text-gray-400 mt-1">ID: #{order.id}</div>
                  </td>
                  <td className="p-6">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{order.Supplier?.name}</div>
                  </td>
                  <td className="p-6 text-sm text-gray-600 dark:text-gray-400">{order.quantity}</td>
                  <td className="p-6 font-bold text-gray-900 dark:text-white font-mono">{order.totalPrice} ETH</td>
                  <td className="p-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border
                      ${order.status === 'paid' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900' : 
                        order.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-2 
                        ${order.status === 'paid' ? 'bg-green-500' : order.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'}`}></span>
                      {order.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-6">
                    {order.txHash ? (
                      <a href={`https://sepolia.etherscan.io/tx/${order.txHash}`} target="_blank" rel="noreferrer" className="text-xs font-mono text-blue-500 hover:text-blue-600 hover:underline truncate max-w-[100px] block" title={order.txHash}>
                        {order.txHash.substring(0, 10)}...{order.txHash.substring(order.txHash.length - 4)}
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Pending</span>
                    )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <svg className="w-12 h-12 mb-4 text-gray-300 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                      <p className="text-lg font-medium">No orders yet</p>
                      <p className="text-sm mt-1">Start trading in the marketplace to see your history.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResellerDashboard;