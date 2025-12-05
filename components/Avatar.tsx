import React from 'react';

interface AvatarProps {
  seed?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ seed, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  };

  const avatarUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${seed || 'default'}&backgroundColor=ffdfbf,ffd5dc,c0aede,b6e3f4,c1f4c5`;

  return (
    <div className={`relative rounded-full overflow-hidden bg-slate-100 ring-2 ring-white/20 ${sizeClasses[size]} ${className}`}>
      <img
        src={avatarUrl}
        alt="Avatar"
        className="w-full h-full object-cover"
      />
    </div>
  );
};