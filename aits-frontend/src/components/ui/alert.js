
// src/components/ui/alert.js
import React from 'react';

export const Alert = ({ variant = "default", children }) => {
  const baseStyles = "p-3 rounded-md text-sm";
  const variantStyles = {
    default: "bg-gray-100 text-gray-800 border border-gray-300",
    success: "bg-green-100 text-green-700 border border-green-300",
    destructive: "bg-red-100 text-red-700 border border-red-300",
    warning: "bg-yellow-100 text-yellow-700 border border-yellow-300",
    info: "bg-blue-100 text-blue-700 border border-blue-300",
  };

  return (
    <div className={`${baseStyles} ${variantStyles[variant]}`}>
      {children}
    </div>
  );
};

export const AlertDescription = ({ children }) => {
  return <p>{children}</p>;
};