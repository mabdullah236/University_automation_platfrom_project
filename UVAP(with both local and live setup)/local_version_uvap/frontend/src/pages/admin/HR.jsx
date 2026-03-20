import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaUserTie, FaMoneyCheckAlt, FaCheckCircle, FaSpinner } from 'react-icons/fa';

const HR = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const fetchPayrolls = async () => {
    try {
      const res = await api.get('/hr/payroll');
      setPayrolls(res.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching payrolls:', error);
      setLoading(false);
    }
  };

  const processPayroll = async () => {
    if (window.confirm('Are you sure you want to process payroll for ALL faculty members for this month?')) {
      try {
        setProcessing(true);
        const res = await api.post('/hr/payroll/process');
        alert(res.data.message);
        fetchPayrolls();
      } catch (error) {
        console.error('Error processing payroll:', error);
        alert('Failed to process payroll');
      } finally {
        setProcessing(false);
      }
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <FaUserTie className="mr-3 text-blue-500" /> HR & Payroll Management
        </h1>
        <button
          onClick={processPayroll}
          disabled={processing}
          className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center transition-all shadow-lg transform hover:scale-105 ${
            processing ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {processing ? <FaSpinner className="animate-spin mr-2" /> : <FaMoneyCheckAlt className="mr-2" />}
          {processing ? 'Processing...' : 'Process Monthly Payroll'}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center mt-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-700 text-gray-300 uppercase text-sm">
                <tr>
                  <th className="py-4 px-6">Faculty Name</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Month</th>
                  <th className="py-4 px-6">Salary Amount</th>
                  <th className="py-4 px-6">Payment Date</th>
                  <th className="py-4 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="text-gray-300 divide-y divide-gray-700">
                {payrolls.length > 0 ? (
                  payrolls.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-750 transition-colors">
                      <td className="py-4 px-6 font-medium text-white">{record.staff?.name || 'Unknown'}</td>
                      <td className="py-4 px-6">{record.staff?.email}</td>
                      <td className="py-4 px-6">{record.month}</td>
                      <td className="py-4 px-6 font-medium">PKR {record.salaryAmount.toLocaleString()}</td>
                      <td className="py-4 px-6 text-sm">{new Date(record.paymentDate).toLocaleDateString()}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-200">
                          <FaCheckCircle className="mr-1" />
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-500">
                      No payroll records found. Process payroll to generate records.
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

export default HR;
