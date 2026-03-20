import { useState, useEffect } from 'react';
import api from '../services/api';

const Finance = () => {
  const [vouchers, setVouchers] = useState([]);

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const res = await api.get('/finance/my-vouchers');
      setVouchers(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePay = async (voucherId, amount) => {
    try {
      await api.post('/finance/pay', { voucherId, amount, source: 'pm_card_visa' });
      alert('Payment Successful!');
      fetchVouchers();
    } catch (error) {
      alert('Payment Failed');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Finance & Fees</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vouchers.map(voucher => (
          <div key={voucher._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div className={`absolute top-0 right-0 p-2 px-4 text-xs font-bold text-white ${voucher.status === 'Paid' ? 'bg-green-500' : 'bg-red-500'}`}>
              {voucher.status}
            </div>
            <h3 className="font-bold text-lg text-gray-800 mb-1">{voucher.type}</h3>
            <p className="text-3xl font-bold text-primary mb-4">${voucher.amount}</p>
            <p className="text-sm text-gray-500 mb-4">Due: {new Date(voucher.dueDate).toLocaleDateString()}</p>
            
            {voucher.status !== 'Paid' && (
              <button 
                onClick={() => handlePay(voucher._id, voucher.amount)}
                className="w-full bg-dark text-white py-2 rounded hover:bg-black transition"
              >
                Pay Now
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Finance;
