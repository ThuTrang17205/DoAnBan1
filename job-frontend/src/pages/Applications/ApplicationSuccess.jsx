import React from 'react';
import { useNavigate } from 'react-router-dom';

const ApplicationSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold text-green-600 mb-4">✅ Application Submitted!</h1>
      <p className="text-xl mb-8">Your application has been sent successfully.</p>
      <button
        onClick={() => navigate('/jobs')}
        className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600"
      >
        Browse More Jobs
      </button>
    </div>
  );
};

export default ApplicationSuccess;