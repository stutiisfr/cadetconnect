import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NccJourneyTimeline } from '../components/NccJourneyTimeline';
import { DigitalProfileCardModal } from '../components/DigitalProfileCardModal';
import { PostCard } from '../components/PostCard';
import { API_BASE_URL } from '../config';
import { 
  Shield, Award, CheckCircle, MapPin, Building, GraduationCap, 
  Calendar, BookOpen, QrCode, Plus, UserPlus, MessageSquare, Lock, Edit, Phone, User
} from 'lucide-react';

export const ProfilePage = () => {
  const { username } = useParams();
  const { user: currentUser, token, updateUserProfile } = useAuth();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardData, setCardData] = useState(null);

  // Edit Profile Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCollege, setEditCollege] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editDirectorate, setEditDirectorate] = useState('');
  const [editUnit, setEditUnit] = useState('');
  const [editRank, setEditRank] = useState('');
  const [editTargetExams, setEditTargetExams] = useState('CDS, NDA, AFCAT');
  const [editPreferredService, setEditPreferredService] = useState('Indian Army');
  const [isUpdating, setIsUpdating] = useState(false);

  // New Journey Item Modal state
  const [showJourneyModal, setShowJourneyModal] = useState(false);
  const [jYear, setJYear] = useState('2026');
  const [jTitle, setJTitle] = useState('');
  const [jDetail, setJDetail] = useState('');
  const [jCategory, setJCategory] = useState('Camp');

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const targetUser = username || (currentUser ? currentUser.username : '');
      const res = await fetch(`${API_BASE_URL}/api/profiles/${targetUser}`);
      const data = await res.json();
      if (data.success) {
        setProfileData(data.profile);
        populateEditForm(data.profile);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const populateEditForm = (prof) => {
    if (!prof) return;
    setEditName(prof.name || '');
    setEditBio(prof.bio || '');
    setEditAvatar(prof.avatar || '');
    setEditPhone(prof.phone || '');
    setEditCollege(prof.college || '');
    setEditLocation(prof.location || '');

    if (prof.cadetDetails) {
      setEditDirectorate(prof.cadetDetails.directorate || '');
      setEditUnit(prof.cadetDetails.unit || '');
      setEditRank(prof.cadetDetails.rank || '');
    }

    if (prof.aspirantDetails) {
      setEditTargetExams((prof.aspirantDetails.targetExams || []).join(', '));
      setEditPreferredService(prof.aspirantDetails.preferredService || 'Indian Army');
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [username, currentUser]);

  const handleOpenCard = async () => {
    if (!token) return alert('Please sign in to generate digital identity card.');
    try {
      const res = await fetch(`${API_BASE_URL}/api/profiles/me/card-data`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCardData(data.cardData);
        setShowCardModal(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!token) return alert('Please sign in to save profile edits.');

    setIsUpdating(true);
    try {
      const targetExamsArray = editTargetExams.split(',').map(s => s.trim()).filter(Boolean);

      const res = await fetch(`${API_BASE_URL}/api/profiles/me/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editName,
          bio: editBio,
          avatar: editAvatar,
          phone: editPhone,
          college: editCollege,
          location: editLocation,
          directorate: editDirectorate,
          unit: editUnit,
          rank: editRank,
          targetExams: targetExamsArray,
          preferredService: editPreferredService
        })
      });

      const data = await res.json();
      if (data.success) {
        setShowEditModal(false);
        if (updateUserProfile) updateUserProfile(data.user);
        fetchProfile();
        alert('Personal details updated successfully!');
      } else {
        alert(data.error || 'Failed to update profile.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddJourneyMilestone = async (e) => {
    e.preventDefault();
    if (!jTitle.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/profiles/me/journey`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          year: jYear,
          title: jTitle,
          detail: jDetail,
          category: jCategory
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowJourneyModal(false);
        fetchProfile();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center text-slate-500">
        Loading defence profile...
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <h3 className="text-lg font-bold text-navy-900">Profile Not Found</h3>
      </div>
    );
  }

  const isOwner = currentUser && currentUser.id === profileData.id;
  const isCadet = profileData.role === 'CADET';
  const isAspirant = profileData.role === 'ASPIRANT';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Profile Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="h-32 bg-navy-900 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-900 to-olive-900 opacity-90"></div>
          <div className="absolute bottom-3 right-4 flex space-x-2">
            {isOwner && (
              <button
                onClick={() => setShowEditModal(true)}
                className="bg-white/90 hover:bg-white text-navy-950 text-xs font-bold px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-md transition-colors"
              >
                <Edit className="w-4 h-4 text-olive-700" />
                <span>Edit Profile Details</span>
              </button>
            )}

            <button
              onClick={handleOpenCard}
              className="bg-amber-500 hover:bg-amber-400 text-navy-950 text-xs font-bold px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-md transition-colors"
            >
              <QrCode className="w-4 h-4" />
              <span>Digital Identity Card</span>
            </button>
          </div>
        </div>

        <div className="p-6 relative pt-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between -mt-12 mb-4 gap-4">
            <div className="flex items-end space-x-4">
              <img
                src={profileData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                alt={profileData.name}
                className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-md bg-white"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-extrabold text-navy-900 font-heading">{profileData.name}</h1>
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-xs font-mono font-semibold text-olive-800">
                  {profileData.verificationBadge || profileData.role}
                </p>
              </div>
            </div>

            {!isOwner && (
              <div className="flex space-x-2">
                <button
                  onClick={() => alert(`Connection request sent to ${profileData.name}`)}
                  className="bg-olive-700 hover:bg-olive-600 text-white text-xs font-semibold px-4 py-2 rounded-md flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Connect</span>
                </button>
                <button
                  onClick={() => alert(`Direct message opened with ${profileData.name}`)}
                  className="bg-navy-800 hover:bg-navy-700 text-white text-xs font-semibold px-4 py-2 rounded-md flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Message</span>
                </button>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-700 max-w-2xl leading-relaxed mb-4">{profileData.bio}</p>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <Building className="w-4 h-4 text-slate-400" />
              <span>{profileData.college || 'Institution'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{profileData.location || 'India'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>{profileData.phone || 'Mobile Verified'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-amber-600" />
              <span className="text-amber-800 font-medium">Regimental Encrypted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Role Specific Detail Card */}
      {isCadet && profileData.cadetDetails && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Shield className="w-4 h-4 text-olive-700" />
            NCC Unit & Service Information
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-sand-50 p-3 rounded border border-slate-200">
              <span className="text-slate-500 block text-[10px]">Directorate</span>
              <span className="font-semibold text-navy-900">{profileData.cadetDetails.directorate}</span>
            </div>
            <div className="bg-sand-50 p-3 rounded border border-slate-200">
              <span className="text-slate-500 block text-[10px]">Group / Battalion</span>
              <span className="font-semibold text-navy-900">{profileData.cadetDetails.group}</span>
            </div>
            <div className="bg-sand-50 p-3 rounded border border-slate-200">
              <span className="text-slate-500 block text-[10px]">Unit</span>
              <span className="font-semibold text-navy-900">{profileData.cadetDetails.unit}</span>
            </div>
            <div className="bg-sand-50 p-3 rounded border border-slate-200">
              <span className="text-slate-500 block text-[10px]">Certificate Status</span>
              <span className="font-semibold text-olive-800">{profileData.cadetDetails.certificateStatus}</span>
            </div>
          </div>
        </div>
      )}

      {isAspirant && profileData.aspirantDetails && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
            <BookOpen className="w-4 h-4 text-blue-700" />
            Defence Aspirant Preparation Goals
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-sand-50 p-3 rounded border border-slate-200">
              <span className="text-slate-500 block text-[10px]">Target Examinations</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {(profileData.aspirantDetails.targetExams || []).map((ex, i) => (
                  <span key={i} className="bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded text-[10px]">
                    {ex}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-sand-50 p-3 rounded border border-slate-200">
              <span className="text-slate-500 block text-[10px]">Preferred Service</span>
              <span className="font-semibold text-navy-900">{profileData.aspirantDetails.preferredService}</span>
            </div>

            <div className="bg-sand-50 p-3 rounded border border-slate-200">
              <span className="text-slate-500 block text-[10px]">Preparation Level</span>
              <span className="font-semibold text-emerald-800">{profileData.aspirantDetails.prepLevel}</span>
            </div>
          </div>
        </div>
      )}

      {/* Visual NCC Journey Timeline Section */}
      <NccJourneyTimeline
        items={profileData.achievements || []}
        isOwner={isOwner}
        onAddMilestone={() => setShowJourneyModal(true)}
      />

      {/* User Posts Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider">
          Posts by {profileData.name}
        </h3>
        {profileData.posts && profileData.posts.length > 0 ? (
          profileData.posts.map(post => <PostCard key={post.id} post={post} />)
        ) : (
          <div className="bg-white p-6 rounded-lg border border-slate-200 text-center text-xs text-slate-500">
            No published posts yet.
          </div>
        )}
      </div>

      {/* EDIT PROFILE & PERSONAL DETAILS MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-300 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-navy-900 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-navy-900 flex items-center gap-2">
                <Edit className="w-5 h-5 text-olive-700" />
                Edit Personal & Defence Details
              </h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-sand-50 border border-slate-300 rounded px-3 py-2 text-navy-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Avatar Image URL</label>
                <input
                  type="url"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  className="w-full bg-sand-50 border border-slate-300 rounded px-3 py-2 text-navy-900"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bio / Headline</label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-sand-50 border border-slate-300 rounded p-2 text-navy-900"
                  placeholder="Tell us about your rank, unit, or target exams..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-sand-50 border border-slate-300 rounded px-3 py-2 text-navy-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location / State</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full bg-sand-50 border border-slate-300 rounded px-3 py-2 text-navy-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">College / Institution</label>
                <input
                  type="text"
                  value={editCollege}
                  onChange={(e) => setEditCollege(e.target.value)}
                  className="w-full bg-sand-50 border border-slate-300 rounded px-3 py-2 text-navy-900"
                />
              </div>

              {/* Role specific inputs */}
              {isCadet && (
                <div className="bg-sand-100 p-3 rounded-lg space-y-2 border border-slate-200">
                  <span className="font-bold text-olive-800 block text-[11px]">NCC Cadet Details</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600">Directorate</label>
                      <input
                        type="text"
                        value={editDirectorate}
                        onChange={(e) => setEditDirectorate(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600">Unit</label>
                      <input
                        type="text"
                        value={editUnit}
                        onChange={(e) => setEditUnit(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600">Rank</label>
                      <input
                        type="text"
                        value={editRank}
                        onChange={(e) => setEditRank(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {isAspirant && (
                <div className="bg-sand-100 p-3 rounded-lg space-y-2 border border-slate-200">
                  <span className="font-bold text-blue-800 block text-[11px]">Aspirant Goals</span>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600">Target Exams (comma separated)</label>
                    <input
                      type="text"
                      value={editTargetExams}
                      onChange={(e) => setEditTargetExams(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600">Preferred Service</label>
                    <input
                      type="text"
                      value={editPreferredService}
                      onChange={(e) => setEditPreferredService(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 bg-olive-700 text-white font-bold rounded hover:bg-olive-600 transition-colors"
                >
                  {isUpdating ? 'Saving...' : 'Save Personal Details'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Digital Profile Card Modal */}
      <DigitalProfileCardModal
        isOpen={showCardModal}
        onClose={() => setShowCardModal(false)}
        cardData={cardData}
      />

      {/* Add Journey Milestone Modal */}
      {showJourneyModal && (
        <div className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-300 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-navy-900">Add NCC Journey Milestone</h3>

            <form onSubmit={handleAddJourneyMilestone} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-navy-900 mb-1">Year</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2025"
                  value={jYear}
                  onChange={(e) => setJYear(e.target.value)}
                  className="w-full bg-sand-50 border border-slate-300 rounded px-3 py-2 text-navy-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-navy-900 mb-1">Category</label>
                <select
                  value={jCategory}
                  onChange={(e) => setJCategory(e.target.value)}
                  className="w-full bg-sand-50 border border-slate-300 rounded px-3 py-2 text-navy-900"
                >
                  <option value="Camp">Camp (CATC, RDC, TSC)</option>
                  <option value="Rank">Rank / Appointment</option>
                  <option value="Certificate">Certificate (A/B/C)</option>
                  <option value="Achievement">Achievement / Award</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-navy-900 mb-1">Milestone Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Republic Day Camp (RDC 2025 - New Delhi)"
                  value={jTitle}
                  onChange={(e) => setJTitle(e.target.value)}
                  className="w-full bg-sand-50 border border-slate-300 rounded px-3 py-2 text-navy-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-navy-900 mb-1">Details / Description</label>
                <textarea
                  rows={2}
                  placeholder="Marched at Kartavya Path contingent..."
                  value={jDetail}
                  onChange={(e) => setJDetail(e.target.value)}
                  className="w-full bg-sand-50 border border-slate-300 rounded p-2 text-navy-900"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJourneyModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-olive-700 text-white font-semibold rounded hover:bg-olive-600"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
