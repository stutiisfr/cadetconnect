import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NccJourneyTimeline } from '../components/NccJourneyTimeline';
import { DigitalProfileCardModal } from '../components/DigitalProfileCardModal';
import { EducationSection } from '../components/EducationSection';
import { ExperienceSection } from '../components/ExperienceSection';
import { ProfileCompletionBar } from '../components/ProfileCompletionBar';
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
  const [educationList, setEducationList] = useState([]);
  const [experienceList, setExperienceList] = useState([]);
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
        setEditName(data.profile.name || '');
        setEditBio(data.profile.bio || '');
        setEditAvatar(data.profile.avatar || '');
        setEditPhone(data.profile.phone || '');
        setEditCollege(data.profile.college || '');
        setEditLocation(data.profile.location || '');
        if (data.profile.cadetDetails) {
          setEditDirectorate(data.profile.cadetDetails.directorate || '');
          setEditUnit(data.profile.cadetDetails.unit || '');
          setEditRank(data.profile.cadetDetails.rank || '');
        }
        if (data.profile.aspirantDetails) {
          setEditTargetExams((data.profile.aspirantDetails.targetExams || []).join(', '));
          setEditPreferredService(data.profile.aspirantDetails.preferredService || '');
        }
      }

      // Fetch Education & Experience
      const eduRes = await fetch(`${API_BASE_URL}/api/profiles/${targetUser}/education`);
      const eduData = await eduRes.json();
      if (eduData.success) setEducationList(eduData.education || []);

      const expRes = await fetch(`${API_BASE_URL}/api/profiles/${targetUser}/experience`);
      const expData = await expRes.json();
      if (expData.success) setExperienceList(expData.experience || []);
    } catch (err) {
      console.error('Failed to load profile data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [username, currentUser]);

  const handleAddEducation = async (eduPayload) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/profiles/education`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eduPayload)
      });
      const data = await res.json();
      if (data.success) {
        setEducationList(prev => [data.record, ...prev]);
      }
    } catch (err) {
      console.error('Failed to add education', err);
    }
  };

  const handleDeleteEducation = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/profiles/education/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setEducationList(prev => prev.filter(e => e.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete education', err);
    }
  };

  const handleAddExperience = async (expPayload) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/profiles/experience`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(expPayload)
      });
      const data = await res.json();
      if (data.success) {
        setExperienceList(prev => [data.record, ...prev]);
      }
    } catch (err) {
      console.error('Failed to add experience', err);
    }
  };

  const handleDeleteExperience = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/profiles/experience/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setExperienceList(prev => prev.filter(e => e.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete experience', err);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const payload = {
        name: editName,
        bio: editBio,
        avatar: editAvatar,
        phone: editPhone,
        college: editCollege,
        location: editLocation,
        directorate: editDirectorate,
        unit: editUnit,
        rank: editRank,
        targetExams: editTargetExams.split(',').map(s => s.trim()).filter(Boolean),
        preferredService: editPreferredService
      };
      await updateUserProfile(payload);
      setShowEditModal(false);
      fetchProfile();
    } catch (err) {
      alert(err.message || 'Failed to update profile details.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddJourneyMilestone = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/profiles/me/journey`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
        setJTitle('');
        setJDetail('');
        fetchProfile();
      }
    } catch (err) {
      alert('Failed to add journey milestone');
    }
  };

  const handleOpenCard = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/profiles/me/card-data`, {
        headers: { 'Authorization': `Bearer ${token}` }
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        <div className="bg-white rounded-lg h-48 animate-pulse border border-slate-200"></div>
        <div className="bg-white rounded-lg h-64 animate-pulse border border-slate-200"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-lg border border-slate-200 text-center">
        <h2 className="text-lg font-bold text-navy-900">Profile Not Found</h2>
        <p className="text-xs text-slate-500 mt-2">The user profile you are looking for does not exist or has been removed.</p>
      </div>
    );
  }

  const isOwner = currentUser && (currentUser.id === profileData.id || currentUser.username === profileData.username);
  const isCadet = profileData.role === 'CADET';
  const isAspirant = profileData.role === 'ASPIRANT';

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      
      {/* Header Banner & Core Card */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="h-32 bg-navy-900 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-900 to-olive-900 opacity-90"></div>
          <div className="absolute bottom-3 right-4 flex space-x-2">
            {isOwner && (
              <button
                onClick={() => setShowEditModal(true)}
                className="bg-white/90 hover:bg-white text-navy-950 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md transition-colors"
              >
                <Edit className="w-4 h-4 text-olive-700" />
                <span>Edit Profile</span>
              </button>
            )}

            <button
              onClick={handleOpenCard}
              className="bg-amber-500 hover:bg-amber-400 text-navy-950 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md transition-colors"
            >
              <QrCode className="w-4 h-4" />
              <span>Digital Card</span>
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
                  className="bg-olive-700 hover:bg-olive-600 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Connect</span>
                </button>
                <button
                  onClick={() => alert(`Direct message opened with ${profileData.name}`)}
                  className="bg-navy-800 hover:bg-navy-700 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
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

      {/* Profile Completion Indicator */}
      {isOwner && (
        <ProfileCompletionBar profile={{ ...profileData, education: educationList, experience: experienceList }} />
      )}

      {/* Role Specific Detail Card */}
      {isCadet && profileData.cadetDetails && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Shield className="w-4 h-4 text-olive-700" />
            NCC Unit & Service Information
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-sand-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-[10px]">Directorate</span>
              <span className="font-semibold text-navy-900">{profileData.cadetDetails.directorate}</span>
            </div>
            <div className="bg-sand-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-[10px]">Group / Battalion</span>
              <span className="font-semibold text-navy-900">{profileData.cadetDetails.group}</span>
            </div>
            <div className="bg-sand-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-[10px]">Unit</span>
              <span className="font-semibold text-navy-900">{profileData.cadetDetails.unit}</span>
            </div>
            <div className="bg-sand-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-[10px]">Certificate Status</span>
              <span className="font-semibold text-olive-800">{profileData.cadetDetails.certificateStatus}</span>
            </div>
          </div>
        </div>
      )}

      {/* Education Section */}
      <EducationSection
        educationList={educationList}
        onAddEducation={handleAddEducation}
        onDeleteEducation={handleDeleteEducation}
        isOwner={isOwner}
      />

      {/* Experience Section */}
      <ExperienceSection
        experienceList={experienceList}
        onAddExperience={handleAddExperience}
        onDeleteExperience={handleDeleteExperience}
        isOwner={isOwner}
      />

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
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
            No published posts yet.
          </div>
        )}
      </div>

      {/* Digital Identity Card Modal */}
      {showCardModal && cardData && (
        <DigitalProfileCardModal
          cardData={cardData}
          onClose={() => setShowCardModal(false)}
        />
      )}
    </div>
  );
};
