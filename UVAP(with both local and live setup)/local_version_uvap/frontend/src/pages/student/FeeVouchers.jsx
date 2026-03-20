import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';

// Replace with your actual Stripe Publishable Key
const STRIPE_PUBLISHABLE_KEY = 'pk_test_mock_key_replace_me';

const CheckoutForm = ({ voucherId, amount, onSuccess, onCancel }) => {
  const cardElementRef = useRef(null);
  const [stripe, setStripe] = useState(null);
  const [elements, setElements] = useState(null);
  const [card, setCard] = useState(null);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Initialize Stripe
    if (window.Stripe) {
      const stripeInstance = window.Stripe(STRIPE_PUBLISHABLE_KEY);
      setStripe(stripeInstance);
      
      const elementsInstance = stripeInstance.elements();
      setElements(elementsInstance);

      const cardInstance = elementsInstance.create('card');
      setCard(cardInstance);
      cardInstance.mount(cardElementRef.current);

      return () => {
        cardInstance.destroy();
      };
    } else {
      setError("Stripe.js not loaded");
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);

    if (!stripe || !elements || !card) {
      return;
    }

    try {
      // 1. Create Payment Intent
      const { data } = await api.post('/payments/create-payment-intent', {
        amount: amount,
        currency: 'pkr',
      });

      if (data.mock) {
          // Mock Success
          setTimeout(async () => {
             await api.post('/payments/webhook', {
                challanNo: voucherId, 
                status: 'success',
                transactionId: 'mock_txn_' + Date.now()
             });
             onSuccess();
             setProcessing(false);
          }, 1000);
          return;
      }

      // 2. Confirm Card Payment
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: card,
        },
      });

      if (result.error) {
        setError(result.error.message);
        setProcessing(false);
      } else {
        if (result.paymentIntent.status === 'succeeded') {
           // 3. Call Webhook
           await api.post('/payments/webhook', {
              challanNo: voucherId, 
              status: 'success',
              transactionId: result.paymentIntent.id
           });
           onSuccess();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 border rounded bg-gray-50">
      <h3 className="text-md font-semibold mb-4">Pay via Card</h3>
      <div ref={cardElementRef} className="p-3 border rounded bg-white mb-4 h-12" />
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!stripe || processing}
          className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50"
        >
          {processing ? 'Processing...' : `Pay Rs. ${amount.toLocaleString()}`}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

const FeeVouchers = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const res = await api.get('/payments/my-vouchers'); 
      if (res.data.success) {
        setVouchers(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching vouchers:', err);
      // Fallback to mock data
      setVouchers([
          { _id: '1', challanNo: 'CH-MOCK-1', month: 'Fall 2024', amount: 50000, dueDate: '2024-12-31', status: 'Unpaid' },
          { _id: '2', challanNo: 'CH-MOCK-2', month: 'Spring 2025', amount: 50000, dueDate: '2025-06-30', status: 'Unpaid' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handlePayClick = (voucher) => {
    setSelectedVoucher(voucher);
  };

  const handleSuccess = () => {
    alert('Payment Successful!');
    setSelectedVoucher(null);
    fetchVouchers(); // Refresh list
  };

  if (loading) return <div className="p-8 text-center">Loading Fee Vouchers...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">My Fee Vouchers</h1>
      <p className="text-gray-600 mb-8">View your fee history and payment status.</p>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                <th className="px-6 py-4">Voucher ID</th>
                <th className="px-6 py-4">Month</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vouchers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No fee vouchers found.</td>
                </tr>
              ) : (
                vouchers.map((voucher) => (
                  <React.Fragment key={voucher._id}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-600 font-mono text-sm">{voucher.challanNo}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{voucher.month || voucher.type}</td>
                      <td className="px-6 py-4 text-gray-600">Rs. {voucher.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(voucher.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            voucher.status === 'Paid'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {voucher.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {voucher.status === 'Unpaid' ? (
                          <button
                            onClick={() => handlePayClick(voucher)}
                            className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700 transition-colors"
                          >
                            Pay Now
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm italic">Paid</span>
                        )}
                      </td>
                    </tr>
                    {selectedVoucher && selectedVoucher._id === voucher._id && (
                      <tr>
                        <td colSpan="6" className="px-6 pb-6 pt-0">
                           <CheckoutForm 
                              voucherId={voucher.challanNo} 
                              amount={voucher.amount} 
                              onSuccess={handleSuccess}
                              onCancel={() => setSelectedVoucher(null)}
                           />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FeeVouchers;
