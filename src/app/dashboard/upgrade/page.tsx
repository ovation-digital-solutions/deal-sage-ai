'use client';
import { useEffect, useState } from 'react';

export default function UpgradePage() {
  const [isCanceled, setIsCanceled] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const canceled = params.get('canceled');
    if (canceled) {
      setIsCanceled(true);
    }
  }, []);

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 xs:px-5 sm:px-6 py-4 sm:py-6">
      {/* Your existing upgrade page content */}
      {isCanceled && (
        <div className="text-red-500">
          Payment canceled. Please try again.
        </div>
      )}
      {/* Rest of your upgrade page content */}
    </div>
  );
}
