import React from 'react';

export const Logo = ({ size = 'md', showText = true, className = '' }) => {
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Official Military Shield Emblem SVG */}
      <div className={`${sizeClasses[size] || 'w-10 h-10'} relative flex-shrink-0 bg-navy-950 rounded-xl p-1 shadow-lg border border-navy-700 flex items-center justify-center`}>
        <svg viewBox="0 0 100 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Shield Outer Path */}
          <path d="M50 5 L90 20 V60 C90 85 50 115 50 115 C50 115 10 85 10 60 V20 L50 5 Z" fill="#0F172A" stroke="#3F6212" strokeWidth="4"/>
          {/* Shield Inner Border */}
          <path d="M50 12 L82 24 V58 C82 78 50 104 50 104 C50 104 18 78 18 58 V24 L50 12 Z" fill="#1E293B" stroke="#D97706" strokeWidth="2"/>
          {/* Saluting Cadet Silhouette */}
          <path d="M50 25 C45 25 41 29 41 34 C41 39 45 43 50 43 C55 43 59 39 59 34 C59 29 55 25 50 25 Z" fill="#FFFFFF"/>
          <path d="M32 60 C32 50 40 45 50 45 C58 45 64 48 67 52 L62 55 M60 33 L73 38 L65 46" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M30 68 C30 55 40 50 50 50 C60 50 70 55 70 68 V75 H30 V68 Z" fill="#FFFFFF"/>
          {/* Two Olive Chevrons */}
          <path d="M30 82 L50 92 L70 82" stroke="#4D7C0F" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M30 90 L50 100 L70 90" stroke="#3F6212" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
          {/* Star at base */}
          <path d="M50 68 L52 73 L57 73 L53 76 L55 81 L50 78 L45 81 L47 76 L43 73 L48 73 Z" fill="#F59E0B"/>
        </svg>
      </div>

      {showText && (
        <div className="flex items-center gap-1">
          <span className="text-xl font-extrabold tracking-wider text-white font-heading">
            CADET
          </span>
          <span className="text-xl font-extrabold tracking-wider text-olive-500 font-heading">
            CONNECT
          </span>
        </div>
      )}
    </div>
  );
};
