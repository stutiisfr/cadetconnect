import React from 'react';
import { Shield, CheckCircle, X, Download, Share2, QrCode } from 'lucide-react';

export const DigitalProfileCardModal = ({ isOpen, onClose, cardData }) => {
  if (!isOpen || !cardData) return null;

  return (
    <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-slate-300 rounded-xl max-w-md w-full overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200">
        
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/80 hover:text-white bg-navy-900/50 hover:bg-navy-900 p-1.5 rounded-full z-10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Digital Profile Card Header Banner */}
        <div className="bg-navy-900 text-white p-6 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-olive-700/20 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="inline-flex items-center gap-1.5 bg-olive-700 text-white px-3 py-1 rounded-full text-xs font-semibold mb-3 border border-olive-500 shadow-sm">
            <Shield className="w-3.5 h-3.5" />
            <span>CadetConnect Official Digital Identity</span>
          </div>

          <img
            src={cardData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
            alt={cardData.name}
            className="w-24 h-24 rounded-full mx-auto border-4 border-amber-500 object-cover shadow-lg"
          />

          <h3 className="text-xl font-extrabold text-white mt-3 font-heading flex items-center justify-center gap-1.5">
            {cardData.name}
            <CheckCircle className="w-5 h-5 text-amber-400" />
          </h3>
          <p className="text-xs text-amber-400 font-mono font-semibold uppercase tracking-wide mt-0.5">
            {cardData.rankOrTarget || 'NCC Cadet'}
          </p>
          <p className="text-xs text-slate-300 mt-1">{cardData.unitOrDept}</p>
        </div>

        {/* Card Body & Details */}
        <div className="p-6 bg-sand-50 space-y-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Institution:</span>
              <span className="font-semibold text-navy-900">{cardData.college || 'Ravenshaw University'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Platform Status:</span>
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {cardData.verificationBadge || '✓ Verified Cadet'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Profile Identifier:</span>
              <span className="font-mono text-slate-700">@{cardData.username}</span>
            </div>
          </div>

          {/* QR Code Payload Simulation */}
          <div className="bg-navy-900 text-white p-4 rounded-lg flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                <QrCode className="w-4 h-4" />
                <span>Verification QR</span>
              </div>
              <p className="text-[11px] text-slate-300">Scan to view verified public identity profile</p>
            </div>
            <div className="bg-white p-2 rounded shadow-inner">
              {/* SVG QR Code Simulation */}
              <svg className="w-14 h-14" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" fill="white"/>
                <path d="M10 10h30v30H10zM60 10h30v30H60zM10 60h30v30H10z" fill="#0F172A"/>
                <path d="M20 20h10v10H20zM70 20h10v10H70zM20 70h10v10H20z" fill="white"/>
                <path d="M50 20h5v20h-5zM60 60h30v5H60zM60 80h10v10H60zM80 70h10v20H80z" fill="#0F172A"/>
              </svg>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 text-center italic">
            🔒 Private sensitive documents and regimental registration numbers are never stored in QR profiles.
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-2">
            <button
              onClick={() => alert('Digital Profile Card saved to downloads.')}
              className="flex-1 bg-olive-700 text-white text-xs font-semibold py-2.5 rounded-md hover:bg-olive-600 flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download Card</span>
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(cardData.publicProfileUrl);
                alert('Profile link copied to clipboard!');
              }}
              className="flex-1 bg-navy-800 text-white text-xs font-semibold py-2.5 rounded-md hover:bg-navy-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
