import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaMoneyBillWave, FaFileInvoiceDollar, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const Finance = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ collected: 0, pending: 0 });

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const res = await api.get('/finance');
      setVouchers(res.data.data);
      calculateStats(res.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    let collected = 0;
    let pending = 0;
    data.forEach(v => {
      if (v.status === 'Paid') collected += v.amount;
      else pending += v.amount;
    });
    setStats({ collected, pending });
  };

  const generateVouchers = async () => {
    if (window.confirm('Are you sure you want to generate vouchers for ALL students for this month?')) {
      try {
        setLoading(true);
        const res = await api.post('/finance/generate');
        alert(res.data.message);
        fetchVouchers();
      } catch (error) {
        console.error('Error generating vouchers:', error);
        alert('Failed to generate vouchers');
        setLoading(false);
      }
    }
  };

  const markAsPaid = async (id) => {
    if (window.confirm('Mark this voucher as PAID?')) {
      try {
        await api.put(`/finance/${id}/pay`);
        fetchVouchers();
      } catch (error) {
        console.error('Error updating voucher:', error);
        alert('Failed to update voucher');
      }
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <FaMoneyBillWave className="mr-3 text-green-500" /> Finance Management
        </h1>
        <button
          onClick={generateVouchers}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center transition-all shadow-lg transform hover:scale-105"
        >
          <FaFileInvoiceDollar className="mr-2" /> Generate Monthly Challans
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-green-500">
          <h3 className="text-gray-400 text-sm uppercase font-semibold">Total Collected</h3>
          <p className="text-3xl font-bold text-white mt-2">PKR {stats.collected.toLocaleString()}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-red-500">
          <h3 className="text-gray-400 text-sm uppercase font-semibold">Pending Dues</h3>
          <p className="text-3xl font-bold text-white mt-2">PKR {stats.pending.toLocaleString()}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center mt-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-700 text-gray-300 uppercase text-sm">
                <tr>
                  <th className="py-4 px-6">Challan No</th>
                  <th className="py-4 px-6">Student</th>
                  <th className="py-4 px-6">Month</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Due Date</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Action</th>
                </tr>
              </thead>
              <tbody className="text-gray-300 divide-y divide-gray-700">
                {vouchers.length > 0 ? (
                  vouchers.map((voucher) => (
                    <tr key={voucher._id} className="hover:bg-gray-750 transition-colors">
                      <td className="py-4 px-6 font-mono text-sm">{voucher.challanNo}</td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-white">{voucher.student?.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{voucher.student?.rollNumber}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">{voucher.month}</td>
                      <td className="py-4 px-6 font-medium">PKR {voucher.amount.toLocaleString()}</td>
                      <td className="py-4 px-6 text-sm">{new Date(voucher.dueDate).toLocaleDateString()}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            voucher.status === 'Paid'
                              ? 'bg-green-900 text-green-200'
                              : 'bg-red-900 text-red-200'
                          }`}
                        >
                          {voucher.status === 'Paid' ? <FaCheckCircle className="mr-1" /> : <FaTimesCircle className="mr-1" />}
                          {voucher.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {voucher.status === 'Unpaid' && (
                          <button
                            onClick={() => markAsPaid(voucher._id)}
                            className="text-green-400 hover:text-green-300 font-medium text-sm transition-colors"
                          >
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-500">
                      No vouchers found. Generate some to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
