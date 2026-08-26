import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const { resetPassword, loading } = useAuth();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!token) {
      setError('Invalid or missing password reset token. Please request a new link.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify your new password.');
      return;
    }

    try {
      const res = await resetPassword(token, newPassword);
      setSuccessMsg(res.message || 'Password reset successfully! Redirecting to sign in...');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setError(err.message || 'Password reset failed. Token may be expired or already used.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-sand-100 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-navy-950 text-white p-6 sm:p-8 text-center border-b border-navy-800 relative overflow-hidden">
          <div className="w-12 h-12 bg-olive-700 rounded-xl flex items-center justify-center mx-auto mb-3 border border-olive-500 shadow-md">
            <Shield className="w-6 h-6 text-amber-300" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-white tracking-tight">
            Reset Your Password
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Create a strong new password for your CadetConnect account
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-5">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-xl border border-red-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-200 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-sand-50 border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 text-xs text-navy-900 focus:outline-none focus:border-olive-700 focus:bg-white transition-colors"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1.5">Confirm New Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-sand-50 border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 text-xs text-navy-900 focus:outline-none focus:border-olive-700 focus:bg-white transition-colors"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !!successMsg}
              className="w-full bg-olive-700 hover:bg-olive-600 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Updating Password...' : 'Save New Password & Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-slate-600 pt-2">
            Remember your password?{' '}
            <Link to="/login" className="font-bold text-olive-700 hover:underline">
              Back to Sign In
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
