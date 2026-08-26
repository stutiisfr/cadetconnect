import React, { useState } from 'react';
import { Briefcase, Plus, Trash2, Calendar, ShieldCheck, Building } from 'lucide-react';

export const ExperienceSection = ({ experienceList = [], onAddExperience, onDeleteExperience, isOwner = true }) => {
  const [showModal, setShowModal] = useState(false);
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!organization || !role) return;

    onAddExperience({
      organization: organization.trim(),
      role: role.trim(),
      startDate: startDate.trim(),
      endDate: isCurrent ? 'Present' : endDate.trim(),
      isCurrent,
      description: description.trim()
    });

    setOrganization('');
    setRole('');
    setStartDate('');
    setEndDate('');
    setIsCurrent(false);
    setDescription('');
    setShowModal(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-navy-50 border border-navy-200 flex items-center justify-center text-navy-900">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-navy-900">Experience & Leadership History</h3>
            <p className="text-[11px] text-slate-500">Cadet leadership roles, internships, and duties</p>
          </div>
        </div>
        {isOwner && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-sand-100 hover:bg-sand-200 text-navy-900 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Experience</span>
          </button>
        )}
      </div>

      {experienceList.length === 0 ? (
        <div className="py-6 text-center text-slate-400 bg-sand-50/50 rounded-xl border border-dashed border-slate-200">
          <Building className="w-6 h-6 mx-auto mb-1.5 text-slate-300" />
          <p className="text-xs font-semibold">No experience or leadership roles recorded.</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {experienceList.map((exp, idx) => (
            <div key={exp.id || idx} className="p-3.5 bg-sand-50 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-all flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-navy-900 shrink-0" />
                  <h4 className="text-xs font-bold text-navy-900">{exp.role}</h4>
                </div>
                <p className="text-xs text-slate-700 font-semibold pl-6">{exp.organization}</p>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 pl-6 font-mono">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{exp.start_date || exp.startDate} – {exp.is_current || exp.isCurrent ? 'Present' : (exp.end_date || exp.endDate || 'N/A')}</span>
                </div>
                {exp.description && (
                  <p className="text-xs text-slate-600 pl-6 pt-1 leading-relaxed">{exp.description}</p>
                )}
              </div>

              {isOwner && (
                <button
                  onClick={() => onDeleteExperience(exp.id)}
                  className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg transition-colors shrink-0"
                  title="Delete record"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Experience Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-navy-900 border-b border-slate-100 pb-2.5">
              Add Leadership or Work Experience
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Organization / Battalion *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1 MAH Naval Unit NCC / Youth Red Cross"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full bg-sand-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-navy-900 focus:outline-none focus:border-olive-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Role / Position Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Under Officer / Guard of Honour Squad Commander"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-sand-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-navy-900 focus:outline-none focus:border-olive-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Start Date</label>
                  <input
                    type="text"
                    placeholder="e.g. Jan 2023"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-sand-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-navy-900 focus:outline-none focus:border-olive-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">End Date</label>
                  <input
                    type="text"
                    disabled={isCurrent}
                    placeholder="e.g. Dec 2024"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-sand-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-navy-900 focus:outline-none focus:border-olive-700 disabled:bg-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isCurrentExp"
                  checked={isCurrent}
                  onChange={(e) => setIsCurrent(e.target.checked)}
                  className="rounded text-olive-700 focus:ring-olive-700"
                />
                <label htmlFor="isCurrentExp" className="text-xs font-semibold text-slate-700">
                  I currently hold this role
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Role Responsibilities</label>
                <textarea
                  rows={2}
                  placeholder="Describe your parade command, drill instruction or volunteer work..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-sand-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-navy-900 focus:outline-none focus:border-olive-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-sand-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-olive-700 hover:bg-olive-600 text-white font-bold text-xs rounded-xl shadow"
                >
                  Save Experience
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
