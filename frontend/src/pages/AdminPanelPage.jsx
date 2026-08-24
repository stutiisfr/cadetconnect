import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, CheckCircle, XCircle, Users, Award, Shield, FileText, BarChart3, AlertTriangle } from 'lucide-react';

export const AdminPanelPage = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [verificationQueue, setVerificationQueue] = useState([]);
  const [reportsQueue, setReportsQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminDashboard = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setVerificationQueue(data.verificationQueue);
        setReportsQueue(data.reportsQueue);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminDashboard();
  }, [token]);

  const handleVerificationAction = async (id, action) => {
    try {
      const res = await fetch(`/api/admin/verification/${id}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchAdminDashboard();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleModeratePost = async (postId) => {
    try {
      const res = await fetch(`/api/admin/posts/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchAdminDashboard();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center text-xs text-slate-500">Loading admin panel...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-navy-900 text-white p-6 rounded-xl border border-navy-800 shadow-md">
        <div className="inline-flex items-center gap-1.5 bg-red-500/20 text-red-300 text-xs px-3 py-1 rounded-full border border-red-500/30 mb-2 font-mono">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Platform Verification & Moderation Desk</span>
        </div>
        <h2 className="text-2xl font-bold font-heading">CadetConnect Admin Control Panel</h2>
        <p className="text-xs text-slate-300 mt-1">Review regimental number verification queues, approve verified badges, and moderate platform reports.</p>
      </div>

      {/* Platform Analytics Metrics Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <span className="text-slate-500 text-xs block font-semibold">Total Registered Users</span>
            <span className="text-2xl font-extrabold text-navy-900 font-mono mt-1 block">{stats.totalUsers}</span>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <span className="text-slate-500 text-xs block font-semibold">Verified Cadets</span>
            <span className="text-2xl font-extrabold text-olive-700 font-mono mt-1 block">{stats.verifiedCadets}</span>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <span className="text-slate-500 text-xs block font-semibold">Defence Aspirants</span>
            <span className="text-2xl font-extrabold text-blue-700 font-mono mt-1 block">{stats.totalAspirants}</span>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <span className="text-slate-500 text-xs block font-semibold">Pending Verifications</span>
            <span className="text-2xl font-extrabold text-amber-600 font-mono mt-1 block">{stats.pendingVerifications}</span>
          </div>
        </div>
      )}

      {/* Verification Queue Table */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-olive-700" />
          Regimental Verification Queue
        </h3>

        {verificationQueue.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">No pending verification requests.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-sand-100 text-navy-900 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="p-3">Cadet Name</th>
                  <th className="p-3">Private Regimental Number</th>
                  <th className="p-3">Institution</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {verificationQueue.map((item) => (
                  <tr key={item.id} className="hover:bg-sand-50">
                    <td className="p-3 font-semibold text-navy-900">{item.userName}</td>
                    <td className="p-3 font-mono text-olive-800 bg-olive-50 rounded">{item.regimentalNumber}</td>
                    <td className="p-3 text-slate-600">{item.institution}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                        item.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      {item.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleVerificationAction(item.id, 'APPROVE')}
                            className="bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-semibold px-2.5 py-1 rounded"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleVerificationAction(item.id, 'REJECT')}
                            className="bg-red-700 hover:bg-red-600 text-white text-[11px] font-semibold px-2.5 py-1 rounded"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
