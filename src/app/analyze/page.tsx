'use client';
import AnalyzeForm from '@/components/AnalyzeForm';

export default function AnalyzePage() {
  return (
    <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Analyze a Deal
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600">
          Enter property details to get an instant analysis.
        </p>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          <AnalyzeForm />
        </div>
      </div>
    </div>
  );
} 
