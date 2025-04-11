import React from 'react';
import './AvatarGen.css'; // Import your CSS file for avatar styling (create one if needed)

export const AvatarGen = ({ username, className }) => {
  const getInitial = (username) => {
    if (!username) return '?';
    if (typeof username === 'object' && username.name) {
      return username.name.charAt(0).toUpperCase();
    }
    if (typeof username === 'string') {
      return username.charAt(0).toUpperCase();
    }
    return '?';
  };

  return (
    <div className={`avatar ${className || ''}`}>
      {getInitial(username)}
    </div>
  );
};

