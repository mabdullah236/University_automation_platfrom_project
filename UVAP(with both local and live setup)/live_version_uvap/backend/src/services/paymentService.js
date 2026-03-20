const Stripe = require('stripe');

exports.processPayment = async (amount, currency, source) => {
  if (process.env.STRIPE_KEY) {
    const stripe = Stripe(process.env.STRIPE_KEY);
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        payment_method: source,
        confirm: true,
      });
      return {
        success: true,
        transactionId: paymentIntent.id,
        amount,
        currency,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  } else {
    console.log(`[MOCK PAYMENT - LIVE] Processing payment of ${amount} ${currency} from ${source}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      success: true,
      transactionId: 'txn_live_mock_' + Date.now(),
      amount,
      currency,
    };
  }
};
