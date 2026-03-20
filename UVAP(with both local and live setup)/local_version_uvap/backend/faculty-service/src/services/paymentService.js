exports.processPayment = async (amount, currency, source) => {
  console.log(`[MOCK PAYMENT] Processing payment of ${amount} ${currency} from ${source}`);
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    success: true,
    transactionId: 'txn_mock_' + Date.now(),
    amount,
    currency,
  };
};
