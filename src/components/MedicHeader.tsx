
import React from 'react';
import { Button } from '@/components/ui/button';

export const MedicHeader = () => {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-blue-600">medic</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
              About Us
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
              Tools
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
              Research
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
              Stories
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
              Reports & Financials
            </a>
          </nav>

          {/* CTA Button */}
          <div className="flex items-center">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Donate
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
