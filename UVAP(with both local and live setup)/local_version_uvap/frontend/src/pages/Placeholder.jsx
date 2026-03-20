import React from 'react';

const Placeholder = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500">
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <p className="text-lg">This feature is coming soon.</p>
    </div>
  );
};

export default Placeholder;
