import React, { useState, useEffect } from 'react';
import { Briefcase, ExternalLink, ShieldCheck, CheckCircle } from 'lucide-react';

export const OpportunitiesPage = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/opportunities')
      .then(res => res.json())
      .then(data => {
        if (data.success) setOpportunities(data.opportunities);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Banner */}
      <div className="bg-navy-900 text-white p-6 rounded-xl border border-navy-800 shadow-md">
        <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 text-xs px-3 py-1 rounded-full border border-amber-500/30 mb-2 font-mono">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Verified Defence Postings & Scholarships</span>
        </div>
        <h2 className="text-2xl font-bold font-heading">Defence Opportunity Board</h2>
        <p className="text-xs text-slate-300 mt-1">
          Explore official defence entry notifications, NCC scholarships, competitions, and leadership internships. Zero fake postings.
        </p>
      </div>

      <div className="space-y-4">
        {opportunities.map((opp) => (
          <div key={opp.id} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:border-olive-500 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold bg-olive-100 text-olive-800 px-2.5 py-0.5 rounded border border-olive-200">
                  {opp.category}
                </span>
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Verified Source ({opp.source})
                </span>
              </div>

              <h3 className="text-base font-bold text-navy-900">{opp.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{opp.description}</p>

              <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-1">
                <span>Eligibility: <strong>{opp.eligibility}</strong></span>
                <span>Deadline: <strong className="text-red-700">{opp.deadline}</strong></span>
              </div>
            </div>

            <a
              href={opp.officialLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold px-4 py-2.5 rounded-md flex items-center gap-1.5 whitespace-nowrap shadow-sm"
            >
              <span>Apply / Official Notice</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
