import { useState, useEffect } from 'react';
import { X, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function OTPModal({ action, itemValue, onConfirm, onCancel }) {
  const [otp, setOtp] = useState('');
  const [sent, setSent] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutes
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    sendOTP();
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const sendOTP = async () => {
    try {
      await api.post('/auth/send-otp', {
        reason: `High-value action: ${action}`,
        value: itemValue,
      });
      setSent(true);
      toast.success('OTP sent to your phone/email');
    } catch (err) {
      toast.error('Failed to send OTP');
    }
  };

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error('Enter 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', { otp });
      
      if (data.valid) {
        toast.success('OTP verified!');
        onConfirm(otp);
      } else {
        toast.error('Invalid OTP');
      }
    } catch (err) {
      toast.error('OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <Shield className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-black">Security Verification</h2>
              <p className="text-sm text-black/60">High-value transaction</p>
            </div>
          </div>
          <button onClick={onCancel} className="text-black/50 hover:text-black">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-900">
            <strong>Action:</strong> {action}
          </p>
          <p className="text-sm text-amber-900 mt-1">
            <strong>Value:</strong> ${itemValue.toLocaleString()}
          </p>
        </div>

        {sent && (
          <>
            <label className="block text-sm font-medium text-black mb-2">
              Enter 6-digit OTP
            </label>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-3 text-center text-2xl tracking-widest font-mono border border-black/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              placeholder="000000"
            />
            <p className="text-xs text-black/60 text-center mb-6">
              OTP expires in {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
            </p>

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-2 border border-black/20 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={verifyOTP}
                disabled={loading || otp.length !== 6}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Proceed'}
              </button>
            </div>

            <button
              onClick={sendOTP}
              disabled={timer > 240}
              className="w-full mt-3 text-sm text-blue-600 hover:underline disabled:text-black/30"
            >
              Resend OTP
            </button>
          </>
        )}
      </div>
    </div>
  );
}
