import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hoverEffect = false, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl
        bg-slate-800/40 backdrop-blur-md border border-white/10
        shadow-lg shadow-black/20
        ${hoverEffect ? 'cursor-pointer hover:bg-slate-800/60 hover:scale-[1.01] hover:border-indigo-500/30 hover:shadow-indigo-500/10 transition-all duration-300' : ''}
        ${className}
      `}
    >
      {/* Glossy highlight effect on top */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />
      
      {children}
    </div>
  );
};
