import React from 'react';

function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-red-500 mb-2">404</h1>
      <p className="text-xl text-slate-600">Page Not Found</p>
    </div>
  );
}

export default NotFound;
