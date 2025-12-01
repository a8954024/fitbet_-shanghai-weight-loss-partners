import React from 'react';

interface AvatarProps {
  seed: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animate?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({ seed, size = 'md', className = '', animate = true }) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  const src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=c0aede,b6e3f4,ffdfbf&clothing=collarAndSweater,hoodie,shirtCrewNeck&mouth=smile,default&eyebrows=default`;

  return (
    <div className={`rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 ${sizeClasses[size]} ${className} ${animate ? 'animate-float' : ''}`}>
      <img 
        src={src} 
        alt="Avatar" 
        className="w-full h-full object-cover"
      />
    </div>
  );
};