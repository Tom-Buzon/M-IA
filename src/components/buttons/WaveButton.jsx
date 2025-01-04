import React from 'react';
import { Link } from 'react-router-dom';
import './WaveButton.css';

const WaveButton = ({ to, children, className = '' }) => {
  return (
    <Link to={to} className={`wave-button ${className}`}>
      <span>{children}</span>
      <i></i>
    </Link>
  );
};

export default WaveButton;
