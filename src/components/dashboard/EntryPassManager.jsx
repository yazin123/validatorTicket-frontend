import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Users, Clock, Plus, Minus, CreditCard } from 'lucide-react';
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

  function incrementHeadCount() {
    setHeadCount(prev => prev + 1);
  }

  function decrementHeadCount() {
    setHeadCount(prev => prev > 1 ? prev - 1 : 1);
  }

  async function handlePurchase(e) {
    if (e) e.preventDefault();
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

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6 mb-6 border border-gray-100 flex justify-center items-center h-48">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading entry pass...</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  const hasValidPass = entryPass && new Date(entryPass.expiresAt) > new Date();
  const isExpired = entryPass && new Date(entryPass.expiresAt) <= new Date();

  return (
    <div className="bg-white rounded-xl shadow p-4 md:p-6 mb-6 border border-gray-100 transition-all">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg md:text-xl font-bold">Entry Pass</h2>
        {hasValidPass && (
          <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium flex items-center">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </div>
        )}
        {isExpired && (
          <div className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-medium flex items-center">
            <AlertCircle className="w-3 h-3 mr-1" />
            Expired
          </div>
        )}
        {!entryPass && (
          <div className="bg-gray-50 text-gray-700 px-3 py-1 rounded-full text-xs font-medium flex items-center">
            <AlertCircle className="w-3 h-3 mr-1" />
            Not Active
          </div>
        )}
      </div>

      {entryPass ? (
        <div className="mb-6 space-y-3">
          <div className="bg-gray-50 rounded-lg p-3 flex items-center">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Head Count Remaining</p>
              <p className="font-semibold text-lg">{entryPass.headCount}</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 flex items-center">
            <div className="bg-purple-100 p-2 rounded-full mr-3">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Valid Until</p>
              <p className="font-semibold">{formatDate(entryPass.expiresAt)}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 bg-red-50 p-4 rounded-lg text-red-700 flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <p>No active entry pass found. Purchase a pass to continue.</p>
        </div>
      )}

      {showForm ? (
        <div className="flex flex-col gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="font-medium text-gray-700 block mb-2">Number of Entry Passes</label>
            <div className="flex items-center">
              <button 
                type="button" 
                onClick={decrementHeadCount} 
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Minus className="w-5 h-5" />
              </button>
              <input
                type="number"
                min={1}
                value={headCount}
                onChange={e => setHeadCount(Math.max(1, Number(e.target.value)))}
                className="text-center border-y border-gray-200 py-2 w-16 focus:outline-none"
                required
              />
              <button 
                type="button" 
                onClick={incrementHeadCount} 
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-r-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700">Price per entry:</span>
              <span className="font-medium">₹{ENTRY_PASS_RATE}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Number of entries:</span>
              <span className="font-medium">{headCount}</span>
            </div>
            <div className="border-t border-blue-200 my-2 pt-2"></div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Amount:</span>
              <span className="font-bold text-lg">₹{(headCount * ENTRY_PASS_RATE).toLocaleString()}</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <Button 
              onClick={handlePurchase} 
              disabled={processing} 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Pay & Update Entry Pass
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowForm(false)} 
              disabled={processing} 
              className="flex-1 py-3 border border-gray-300 bg-white hover:bg-gray-50"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button 
          onClick={() => setShowForm(true)} 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 flex items-center justify-center gap-2"
        >
          <CreditCard className="w-4 h-4" />
          {entryPass ? 'Add More Entries' : 'Purchase Entry Pass'}
        </Button>
      )}
    </div>
  );
}