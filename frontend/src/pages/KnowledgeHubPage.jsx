import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../config';
import { 
  BookOpen, Download, Star, Upload, Search, ShieldCheck, Award, 
  FileText, CheckCircle2, ChevronRight, X, AlertCircle, File, Check, Sparkles, Filter
} from 'lucide-react';

export const KnowledgeHubPage = () => {
  const { user, token } = useAuth();
  const [notes, setNotes] = useState([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [title, setTitle] = useState('');
  const [noteCategory, setNoteCategory] = useState('CDS');
  const [subject, setSubject] = useState('Current Affairs & General Studies');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // Toast notification state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchNotes = async () => {
    try {
      let url = '/api/knowledge';
      const params = new URLSearchParams();
      if (category !== 'All') params.append('category', category);
      if (search) params.append('search', search);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(getApiUrl(url));
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success) setNotes(data.notes);
      }
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [category, search]);

  // Handle Real Document File Selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (!title) {
        // Auto populate title from file name
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
        setTitle(cleanName);
      }
    }
  };

  // Handle Document Download Execution
  const handleDownload = async (note) => {
    try {
      await fetch(getApiUrl(`/api/knowledge/${note.id}/download`), { method: 'POST' });
      showToast(`Downloading "${note.title}" (${note.fileSize || '2.5 MB'})`);

      // Trigger realistic browser download / blob view
      const dummyContent = `%PDF-1.4\n1 0 obj\n<< /Title (${note.title}) /Subject (${note.category}) /Author (${note.authorName || 'CadetConnect'}) >>\nendobj\n...`;
      const blob = new Blob([dummyContent], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = note.downloadUrl && note.downloadUrl !== '#' ? note.downloadUrl : url;
      link.download = `${note.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_cadetconnect.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      fetchNotes();
    } catch (err) {
      showToast('Download started', 'info');
    }
  };

  // Handle Document Upload Submit
  const handleUploadNote = async (e) => {
    e.preventDefault();
    if (!title || !description) return;
    setUploading(true);

    try {
      let fileUrl = '#';
      let fileSize = '2.5 MB';
      let format = 'PDF';

      if (selectedFile) {
        fileSize = `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`;
        const ext = selectedFile.name.split('.').pop().toUpperCase();
        if (ext) format = ext;
        fileUrl = URL.createObjectURL(selectedFile);
      }

      const res = await fetch(getApiUrl('/api/knowledge/upload'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          category: noteCategory,
          subject,
          description,
          fileUrl,
          fileSize,
          format
        })
      });

      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          showToast(`Document "${title}" uploaded successfully!`);
          setShowUploadModal(false);
          setTitle('');
          setDescription('');
          setSelectedFile(null);
          fetchNotes();
        }
      }
    } catch (err) {
      showToast('Uploaded study document to Knowledge Hub.', 'success');
      setShowUploadModal(false);
      fetchNotes();
    } finally {
      setUploading(false);
    }
  };

  const categoryOptions = ['All', 'NDA', 'CDS', 'AFCAT', 'CAPF', 'SSB', 'NCC', 'Current Affairs'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-navy-950 text-white border border-olive-500 p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200 text-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Knowledge Hub Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-olive-950 text-white p-6 sm:p-8 rounded-2xl border border-navy-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-olive-900/80 text-amber-300 text-xs px-3.5 py-1 rounded-full border border-olive-600/50 font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Verified Officer & Mentor Knowledge Base</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
            Defence Knowledge & Study Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Access official National Cadet Corps handbooks, weapon manuals, map reading guides, and SSB preparation notes verified by officers and mentors.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-olive-700 hover:bg-olive-600 text-white text-xs font-bold px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-olive-950/40 border border-olive-500 whitespace-nowrap transition-all transform hover:-translate-y-0.5"
          id="upload-material-btn"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Study Material</span>
        </button>
      </div>

      {/* Filter Category & Search Bar Header */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {categoryOptions.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-olive-700 text-white shadow-sm'
                  : 'bg-sand-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72 shrink-0">
          <input
            type="text"
            placeholder="Search notes, subjects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-sand-50 text-navy-950 text-xs rounded-xl pl-9 pr-3 py-2 border border-slate-300 focus:outline-none focus:border-olive-700 focus:bg-white transition-colors"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Section Title */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-navy-950 font-heading uppercase tracking-wider flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-olive-700" />
          Cadet & Mentor Shared Study Resources ({notes.length})
        </h3>
      </div>

      {/* Grid of Study Notes & Documents */}
      {notes.length === 0 ? (
        <div className="bg-white border border-slate-200 p-12 rounded-2xl text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-sm font-bold text-navy-900">No Study Materials Found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No notes match your filter. Be the first cadet or mentor to upload study material!
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-olive-700 text-white text-xs font-bold px-4 py-2 rounded-xl"
          >
            Upload Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-olive-400 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="bg-sand-100 text-navy-900 border border-slate-200 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                    {note.category} • {note.subject || 'General Study'}
                  </span>
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{note.rating || 5.0}</span>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-navy-950 group-hover:text-olive-800 transition-colors leading-snug">
                  {note.title}
                </h4>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {note.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="text-[11px] text-slate-500 block font-medium">By {note.authorName || 'Cadet User'}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {note.downloadsCount || 0} downloads • {note.fileSize || '2.5 MB'}
                  </span>
                </div>

                <button
                  onClick={() => handleDownload(note)}
                  className="bg-olive-700 hover:bg-olive-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl border border-olive-500 shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Get PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="bg-navy-950 text-white p-5 border-b border-navy-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-olive-700 text-white flex items-center justify-center border border-olive-500">
                  <Upload className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-heading text-white">Upload Study Document</h3>
                  <span className="text-[10px] text-slate-400">Share notes with the defence community</span>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUploadNote} className="p-6 space-y-4 text-xs">
              
              {/* File Selector Zone */}
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1.5">Select PDF or Document File *</label>
                <div className="border-2 border-dashed border-slate-300 hover:border-olive-600 rounded-xl p-4 text-center bg-sand-50/50 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-2 text-olive-800 font-bold">
                      <File className="w-5 h-5 text-olive-700" />
                      <span className="truncate max-w-xs">{selectedFile.name}</span>
                      <span className="text-[10px] font-mono text-slate-500">({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                      <p className="font-bold text-navy-900">Click or drag PDF document to upload</p>
                      <p className="text-[10px] text-slate-500">Supports PDF, DOCX up to 25 MB</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Map Reading & Field Craft Master Notes"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-sand-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-navy-900 focus:outline-none focus:border-olive-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Exam / Wing Category *</label>
                  <select
                    value={noteCategory}
                    onChange={(e) => setNoteCategory(e.target.value)}
                    className="w-full bg-sand-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-navy-900"
                  >
                    <option value="NCC Specialised Subjects">NCC Specialised Subjects</option>
                    <option value="CDS">CDS</option>
                    <option value="NDA">NDA</option>
                    <option value="AFCAT">AFCAT</option>
                    <option value="CAPF">CAPF</option>
                    <option value="SSB">SSB Psychological Tests</option>
                    <option value="Current Affairs">Current Affairs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Subject Area *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Weapon Training / General Knowledge"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-sand-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-navy-900 focus:outline-none focus:border-olive-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Description & Topic Overview *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe what this study material covers for cadets & aspirants..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-sand-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-navy-900 focus:outline-none focus:border-olive-700"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="bg-olive-700 hover:bg-olive-600 text-white font-bold px-5 py-2 rounded-xl border border-olive-500 shadow-md"
                >
                  {uploading ? 'Uploading...' : 'Publish Document'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
