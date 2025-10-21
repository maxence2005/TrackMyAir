import React from 'react';
import './Header.css';
import icon from '../assets/airplane-icon.png';

const Header: React.FC = () => {
  return (
    <header className="header">
      <img 
        src={icon} 
        alt="Logo Track My Air" 
        className="header-icon" 
      />
      <h1 className="header-title">Track My Air</h1>
    </header>
  );
};

export default Header;
