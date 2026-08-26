import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, CheckCircle, XCircle, Users, Award, Shield, FileText, BarChart3, AlertTriangle, Trash2, Flag } from 'lucide-react';

export const AdminPanelPage = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [verificationQueue, setVerificationQueue] = useState([]);
  const [reportsQueue, setReportsQueue] = useState([]);
  const [recentResources, setRecentResources] = useState({ posts: [], notes: [], videos: [], events: [] });
  const [activeTab, setActiveTab] = useState('VERIFICATIONS'); // 'VERIFICATIONS' | 'REPORTS' | 'RESOURCES'
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
        setVerificationQueue(data.verificationQueue || []);
        setReportsQueue(data.reportsQueue || []);
        setRecentResources(data.recentResources || { posts: [], notes: [], videos: [], events: [] });
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

  const handleDeleteResource = async (type, id) => {
    if (!window.confirm(`🛡️ Admin Confirmation: Delete this ${type} (ID: ${id}) permanently?`)) return;
    try {
      const res = await fetch(`/api/admin/resources/${type}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchAdminDashboard();
      } else {
        alert(data.error || 'Deletion failed.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center text-xs text-slate-500">Loading admin control desk...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-navy-900 text-white p-6 rounded-xl border border-navy-800 shadow-md">
        <div className="inline-flex items-center gap-1.5 bg-red-500/20 text-red-300 text-xs px-3 py-1 rounded-full border border-red-500/30 mb-2 font-mono">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Platform Verification & Content Moderation Desk</span>
        </div>
        <h2 className="text-2xl font-bold font-heading">CadetConnect Admin Control Panel</h2>
        <p className="text-xs text-slate-300 mt-1">Review regimental verifications, moderate flagged posts/resources, and delete inappropriate content.</p>
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
            <span className="text-slate-500 text-xs block font-semibold">Pending Verifications</span>
            <span className="text-2xl font-extrabold text-amber-600 font-mono mt-1 block">{stats.pendingVerifications}</span>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <span className="text-slate-500 text-xs block font-semibold">Pending Content Reports</span>
            <span className="text-2xl font-extrabold text-red-600 font-mono mt-1 block">{stats.pendingReports}</span>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 space-x-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('VERIFICATIONS')}
          className={`pb-2 transition-colors ${
            activeTab === 'VERIFICATIONS' ? 'border-b-2 border-olive-700 text-olive-800' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Regimental Verification Queue ({verificationQueue.length})
        </button>

        <button
          onClick={() => setActiveTab('REPORTS')}
          className={`pb-2 transition-colors ${
            activeTab === 'REPORTS' ? 'border-b-2 border-red-600 text-red-700' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Flagged Content Reports ({reportsQueue.length})
        </button>

        <button
          onClick={() => setActiveTab('RESOURCES')}
          className={`pb-2 transition-colors ${
            activeTab === 'RESOURCES' ? 'border-b-2 border-blue-600 text-blue-700' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Manage & Delete Platform Resources
        </button>
      </div>

      {/* TAB 1: Verification Queue Table */}
      {activeTab === 'VERIFICATIONS' && (
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
      )}

      {/* TAB 2: Flagged Content Reports */}
      {activeTab === 'REPORTS' && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            Flagged Content Moderation Queue
          </h3>

          {reportsQueue.length === 0 ? (
            <p className="text-xs text-slate-500 py-4">No content reports pending review.</p>
          ) : (
            <div className="space-y-3">
              {reportsQueue.map((rep) => (
                <div key={rep.id} className="p-4 bg-sand-50 border border-slate-200 rounded-lg flex items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2 font-bold text-navy-900">
                      <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-[10px] uppercase font-mono">{rep.targetType}</span>
                      <span>Target ID: {rep.targetId}</span>
                    </div>
                    <p className="text-slate-600 mt-1">Reason: <strong className="text-red-700">{rep.reason}</strong></p>
                    <span className="text-[10px] text-slate-400 font-mono">Reported by @{rep.reporterName} on {new Date(rep.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteResource(rep.targetType || 'posts', rep.targetId)}
                      className="bg-red-700 hover:bg-red-600 text-white font-bold px-3 py-1.5 rounded flex items-center gap-1 text-xs shadow"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Resource</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Resource Moderation & Deletion Hub */}
      {activeTab === 'RESOURCES' && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider mb-1">
              Active Platform Resources Moderation
            </h3>
            <p className="text-xs text-slate-500">Admins can review and permanently delete any post, study note, video, event, or community item.</p>
          </div>

          {/* Posts Moderation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b pb-1">
              Recent Social Posts ({recentResources.posts.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {recentResources.posts.map((post) => (
                <div key={post.id} className="p-3 bg-sand-50 border border-slate-200 rounded-lg flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="font-bold text-navy-900">{post.authorName} <span className="text-slate-400 font-normal text-[10px]">({post.category})</span></div>
                    <p className="text-slate-700 line-clamp-2">{post.content}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteResource('posts', post.id)}
                    className="bg-red-100 hover:bg-red-200 text-red-800 p-1.5 rounded border border-red-300 shrink-0"
                    title="Delete Post"
                  >
                    <Trash2 className="w-4 h-4 text-red-700" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Study Notes Moderation */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b pb-1">
              Knowledge Hub Notes ({recentResources.notes.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {recentResources.notes.map((note) => (
                <div key={note.id} className="p-3 bg-sand-50 border border-slate-200 rounded-lg flex items-start justify-between gap-3">
                  <div>
                    <div className="font-bold text-navy-900">{note.title}</div>
                    <span className="text-[10px] text-olive-800 font-mono">{note.subject || note.category}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteResource('notes', note.id)}
                    className="bg-red-100 hover:bg-red-200 text-red-800 p-1.5 rounded border border-red-300 shrink-0"
                    title="Delete Note"
                  >
                    <Trash2 className="w-4 h-4 text-red-700" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
