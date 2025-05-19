import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-hot-toast';

export default function EntryPassManager({ onSuccess }) {
  const [entryPass, setEntryPass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [headCount, setHeadCount] = useState(1);
  const [processing, setProcessing] = useState(false);
  const ENTRY_PASS_RATE = 100; // Example: ₹100 per head

  useEffect(() => {
    fetchEntryPass();
  }, []);

  async function fetchEntryPass() {
    setLoading(true);
    try {
      const res = await api.get('/entrypass/me');
      setEntryPass(res.data.entryPass);
    } catch (err) {
      setEntryPass(null);
    } finally {
      setLoading(false);
    }
  }

  async function handlePurchase(e) {
    e.preventDefault();
    setProcessing(true);
    try {
      // Simulate payment gateway
      await new Promise(r => setTimeout(r, 1200));
      const amount = headCount * ENTRY_PASS_RATE;
      const res = await api.post('/entrypass/purchase', {
        headCount,
        amount,
        paymentId: 'SIMULATED_PAYMENT_ID_' + Date.now(),
        transactionInfo: { method: 'simulated' }
      });
      toast.success('Entry pass updated!');
      setShowForm(false);
      setHeadCount(1);
      setEntryPass(res.data.entryPass);
      if (onSuccess) onSuccess(res.data.entryPass);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to purchase entry pass');
    } finally {
      setProcessing(false);
    }
  }

  if (loading) return <div className="p-4 text-center">Loading entry pass...</div>;

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6 border border-gray-100">
      <h2 className="text-lg font-bold mb-2">Entry Pass</h2>
      {entryPass ? (
        <div className="mb-4">
          <div>Head Count Remaining: <span className="font-semibold">{entryPass.headCount}</span></div>
          <div>Expires At: <span className="font-semibold">{new Date(entryPass.expiresAt).toLocaleString()}</span></div>
        </div>
      ) : (
        <div className="mb-4 text-red-600">No active entry pass found.</div>
      )}
      {showForm ? (
        <form onSubmit={handlePurchase} className="flex flex-col gap-3">
          <label className="font-medium">How many heads to add?</label>
          <input
            type="number"
            min={1}
            value={headCount}
            onChange={e => setHeadCount(Number(e.target.value))}
            className="input border rounded px-3 py-2"
            required
          />
          <div>Total Amount: <span className="font-semibold">₹{(headCount * ENTRY_PASS_RATE).toLocaleString()}</span></div>
          <Button type="submit" loading={processing} disabled={processing} className="w-full">Pay & Update Entry Pass</Button>
          <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={processing} className="w-full">Cancel</Button>
        </form>
      ) : (
        <Button onClick={() => setShowForm(true)} className="w-full">
          {entryPass ? 'Add More Heads' : 'Purchase Entry Pass'}
        </Button>
      )}
    </div>
  );
} 