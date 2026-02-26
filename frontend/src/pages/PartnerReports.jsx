import React from 'react';

// Temporary stub to remove recharts dependency causing Layer.js runtime error
const PartnerReports = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-gray-900">Reports temporarily unavailable</h1>
        <p className="text-gray-600 max-w-xl">
          Partner analytics are temporarily disabled while we upgrade the chart library. Core site functionality remains available.
        </p>
      </div>
    </div>
  );
};

export default PartnerReports;
