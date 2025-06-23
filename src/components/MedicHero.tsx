
import React from 'react';
import { Heart } from 'lucide-react';

export const MedicHero = () => {
  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Hero Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-200 mb-6">
            <Heart className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-800">Community Health Toolkit</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Building tools for people who care
          </h1>

          {/* Subheading */}
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Create powerful community health worker applications using natural language descriptions. 
            Transform your healthcare workflows into digital tools that make a difference.
          </p>

          {/* Description */}
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Powered by the Community Health Toolkit, this app builder helps you design and configure 
            digital health applications without technical complexity.
          </p>
        </div>
      </div>
    </section>
  );
};
