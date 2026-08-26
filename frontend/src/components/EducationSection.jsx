import React, { useState } from 'react';
import { GraduationCap, Plus, Trash2, Calendar, Award, Building2, BookOpen } from 'lucide-react';

export const EducationSection = ({ educationList = [], onAddEducation, onDeleteEducation, isOwner = true }) => {
  const [showModal, setShowModal] = useState(false);
  const [institution, setInstitution] = useState('');
  const [degree, setDegree] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [grade, setGrade] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!institution || !institution.trim()) return;

    onAddEducation({
      institution: institution.trim(),
      degree: degree.trim(),
      fieldOfStudy: fieldOfStudy.trim(),
      startYear: parseInt(startYear) || null,
      endYear: isCurrent ? null : parseInt(endYear) || null,
      isCurrent,
      grade: grade.trim(),
      description: description.trim()
    });

    setInstitution('');
    setDegree('');
    setFieldOfStudy('');
    setStartYear('');
    setEndYear('');
    setIsCurrent(false);
    setGrade('');
    setDescription('');
    setShowModal(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-olive-50 border border-olive-200 flex items-center justify-center text-olive-700">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-navy-900">Education & Academic Record</h3>
            <p className="text-[11px] text-slate-500">Degree, schools, and academic qualifications</p>
          </div>
        </div>
        {isOwner && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-sand-100 hover:bg-sand-200 text-navy-900 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Education</span>
          </button>
        )}
      </div>

      {educationList.length === 0 ? (
        <div className="py-6 text-center text-slate-400 bg-sand-50/50 rounded-xl border border-dashed border-slate-200">
          <BookOpen className="w-6 h-6 mx-auto mb-1.5 text-slate-300" />
          <p className="text-xs font-semibold">No education records added yet.</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {educationList.map((edu, idx) => (
            <div key={edu.id || idx} className="p-3.5 bg-sand-50 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-all flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-olive-700 shrink-0" />
                  <h4 className="text-xs font-bold text-navy-900">{edu.institution}</h4>
                </div>
                {(edu.degree || edu.field_of_study || edu.fieldOfStudy) && (
                  <p className="text-xs text-slate-700 font-semibold pl-6">
                    {edu.degree} {edu.degree && (edu.field_of_study || edu.fieldOfStudy) ? '• ' : ''}{edu.field_of_study || edu.fieldOfStudy}
                  </p>
                )}
                <div className="flex items-center gap-3 text-[11px] text-slate-500 pl-6 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {edu.start_year || edu.startYear} – {edu.is_current || edu.isCurrent ? 'Present' : (edu.end_year || edu.endYear || 'N/A')}
                  </span>
                  {edu.grade && (
                    <span className="flex items-center gap-1 font-bold text-amber-700">
                      <Award className="w-3 h-3" />
                      Grade: {edu.grade}
                    </span>
                  )}
                </div>
                {edu.description && (
                  <p className="text-xs text-slate-600 pl-6 pt-1 leading-relaxed">{edu.description}</p>
                )}
              </div>

              {isOwner && (
                <button
                  onClick={() => onDeleteEducation(edu.id)}
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

      {/* Add Education Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-navy-900 border-b border-slate-100 pb-2.5">
              Add Education Qualification
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">School / Institution Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. St. Xavier's College / National Defence Academy"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full bg-sand-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-navy-900 focus:outline-none focus:border-olive-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Degree / Certification</label>
                  <input
                    type="text"
                    placeholder="e.g. Bachelor of Science"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full bg-sand-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-navy-900 focus:outline-none focus:border-olive-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Field of Study</label>
                  <input
                    type="text"
                    placeholder="e.g. Computer Science / Defence Studies"
                    value={fieldOfStudy}
                    onChange={(e) => setFieldOfStudy(e.target.value)}
                    className="w-full bg-sand-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-navy-900 focus:outline-none focus:border-olive-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Start Year</label>
                  <input
                    type="number"
                    placeholder="2022"
                    value={startYear}
                    onChange={(e) => setStartYear(e.target.value)}
                    className="w-full bg-sand-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-navy-900 focus:outline-none focus:border-olive-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">End Year</label>
                  <input
                    type="number"
                    disabled={isCurrent}
                    placeholder="2025"
                    value={endYear}
                    onChange={(e) => setEndYear(e.target.value)}
                    className="w-full bg-sand-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-navy-900 focus:outline-none focus:border-olive-700 disabled:bg-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isCurrentEdu"
                  checked={isCurrent}
                  onChange={(e) => setIsCurrent(e.target.checked)}
                  className="rounded text-olive-700 focus:ring-olive-700"
                />
                <label htmlFor="isCurrentEdu" className="text-xs font-semibold text-slate-700">
                  I am currently studying here
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Grade / Percentage</label>
                <input
                  type="text"
                  placeholder="e.g. 8.5 CGPA or 85%"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full bg-sand-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-navy-900 focus:outline-none focus:border-olive-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Description / Key Achievements</label>
                <textarea
                  rows={2}
                  placeholder="Mention societies, leadership positions or honors..."
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
                  Save Education
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
