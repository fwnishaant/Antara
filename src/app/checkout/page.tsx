'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, ShieldCheck, Lock, AlertTriangle, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { Product } from '@/types';
import { Navbar } from '@/components/layout/Navbar';
import { RecoveryAgent } from '@/lib/agents/recoveryAgent';
import { store } from '@/lib/db/store';

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<Array<{ product: Product; quantity: number }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [failedAlert, setFailedAlert] = useState<any>(null);

  useEffect(() => {
    const raw = localStorage.getItem('antara_cart');
    if (raw) {
      try {
        setCartItems(JSON.parse(raw));
      } catch (err) {}
    } else {
      const seedProd = store.getProductById('prod_1')!;
      setCartItems([{ product: seedProd, quantity: 1 }]);
    }

    // Record CHECKOUT_STARTED Event
    store.recordEvent({
      type: 'CHECKOUT_STARTED',
      customerId: 'cust_1042',
      customerName: 'Rahul Sharma',
      sessionId: `sess_${Date.now()}`,
      metadata: { itemsCount: cartItems.length },
    });
  }, []);

  const totalAmount = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handlePaySuccess = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalAmount, customerId: 'cust_1042', cartItems }),
      });

      const orderData = await res.json();

      // Verify payment signature
      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: orderData.order.id,
          razorpay_payment_id: `pay_demo_${Date.now()}`,
          razorpay_signature: 'valid_demo_sig',
          orderDetails: {
            customerId: 'cust_1042',
            customerName: 'Rahul Sharma',
            items: cartItems,
            totalAmount,
            baseAmount: cartItems[0]?.product.price || totalAmount,
            aiInfluencedAmount: Math.max(0, totalAmount - (cartItems[0]?.product.price || totalAmount)),
            isAiAttributed: cartItems.length > 1,
            attributionType: cartItems.length > 1 ? 'bundle' : 'discount_conversion',
          },
        }),
      });

      const verifyData = await verifyRes.json();

      localStorage.removeItem('antara_cart');
      router.push(`/order-success?orderId=${verifyData.order.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulateFailure = async () => {
    setIsProcessing(true);

    // Trigger Recovery Agent
    const recoveryOutput = await RecoveryAgent.analyzeRecoveryOpportunity(
      'cust_1088',
      totalAmount,
      'Bank UPI Timeout / Issue Gate Error'
    );

    setFailedAlert(recoveryOutput);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#111318] font-sans pb-16">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-teal-700">
              Razorpay Secured Checkout
            </span>
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight">
              Review & Payment Authorization
            </h1>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>

        {/* Payment Failure Recovery Alert Modal */}
        {failedAlert && (
          <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase text-amber-800 font-mono flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Payment Gateway Failure Detected (Demo Recovery Simulator)
              </span>
              <span className="text-xs font-bold text-amber-800 font-mono">
                Recovery Intent Score: {failedAlert.intentScore}%
              </span>
            </div>

            <p className="text-xs text-amber-900 leading-relaxed font-medium">
              Payment failed at issuing bank gateway. The ANTARA Revenue Recovery Agent has automatically generated an instant Razorpay Payment Link ({failedAlert.paymentLinkId}).
            </p>

            <div className="p-3.5 rounded-xl bg-white border border-amber-200 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-zinc-900 block">{failedAlert.incentiveOffer}</span>
                <span className="text-zinc-500 font-mono">{failedAlert.paymentUrl}</span>
              </div>

              <button
                onClick={handlePaySuccess}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-extrabold text-xs hover:bg-emerald-700"
              >
                Execute Recovery Payment
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Customer Details & Payment Options */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-subtle space-y-4">
              <h3 className="text-sm font-bold text-zinc-900">Customer Delivery Information</h3>
              <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                <div>
                  <label className="text-zinc-400 block mb-1">Full Name</label>
                  <input
                    type="text"
                    defaultValue="Rahul Sharma"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50 font-bold text-zinc-900"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Email Address</label>
                  <input
                    type="email"
                    defaultValue="rahul.sharma@example.com"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50 font-bold text-zinc-900"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-subtle space-y-4">
              <h3 className="text-sm font-bold text-zinc-900">Razorpay Payment Gateway Mode</h3>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'upi', label: 'Razorpay UPI Instant' },
                  { id: 'card', label: 'Credit / Debit Card' },
                  { id: 'netbanking', label: 'NetBanking' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                      paymentMethod === m.id
                        ? 'border-teal-600 bg-teal-50 text-teal-900'
                        : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Summary & Payment Execution Buttons */}
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-subtle space-y-6">
            <h3 className="text-sm font-extrabold text-zinc-900">Order Items</h3>

            <div className="space-y-2 text-xs">
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-zinc-700">
                  <span className="truncate pr-2">{item.product.name} (x{item.quantity})</span>
                  <span className="font-bold shrink-0">{formatINR(item.product.price * item.quantity)}</span>
                </div>
              ))}

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-sm font-black text-zinc-900">
                <span>Total Amount</span>
                <span>{formatINR(totalAmount)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handlePaySuccess}
                disabled={isProcessing}
                className="w-full py-3.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                {isProcessing ? 'Processing Payment...' : `Complete Payment (${formatINR(totalAmount)})`}
              </button>

              <button
                onClick={handleSimulateFailure}
                disabled={isProcessing}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 font-bold text-xs border border-amber-500/30 transition-all flex items-center justify-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Simulate Payment Failure & Recovery
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
