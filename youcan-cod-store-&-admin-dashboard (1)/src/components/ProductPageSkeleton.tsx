import React from 'react';
import { ChevronLeft } from 'lucide-react';

export const ProductPageSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50/60 animate-in fade-in duration-300">
      {/* Top clean header bar placeholder */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-gray-200/70 w-36 h-7 animate-pulse" />
        <div className="w-24 h-6 rounded-full bg-gray-200/70 animate-pulse" />
      </div>

      {/* Main Product Layout matching ProductPage.tsx */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Left Column: Visual Media Gallery skeleton */}
          <div className="lg:col-span-6 space-y-4">
            {/* Main Featured Image Skeleton */}
            <div className="relative w-full aspect-square sm:aspect-4/3 rounded-2xl bg-gray-200/80 animate-pulse overflow-hidden shadow-xs">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
            </div>
            {/* Thumbnails row */}
            <div className="flex gap-2.5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-16 h-16 rounded-xl bg-gray-200/70 animate-pulse" />
              ))}
            </div>
          </div>

          {/* Right Column: Title, Price, Offers & Checkout form */}
          <div className="lg:col-span-6 space-y-5">
            {/* Category and ratings */}
            <div className="flex items-center gap-3">
              <div className="w-20 h-5 rounded-md bg-gray-200/80 animate-pulse" />
              <div className="w-28 h-5 rounded-md bg-gray-200/60 animate-pulse" />
            </div>

            {/* Title lines */}
            <div className="space-y-2.5">
              <div className="w-11/12 h-7 rounded-lg bg-gray-200/90 animate-pulse" />
              <div className="w-3/4 h-7 rounded-lg bg-gray-200/80 animate-pulse" />
            </div>

            {/* Price block */}
            <div className="flex items-baseline gap-3 pt-2">
              <div className="w-36 h-9 rounded-xl bg-gray-200/90 animate-pulse" />
              <div className="w-24 h-6 rounded-lg bg-gray-200/60 animate-pulse" />
            </div>

            {/* Offers cards skeleton */}
            <div className="space-y-2.5 pt-3">
              <div className="w-full h-16 rounded-2xl bg-gray-200/80 animate-pulse border border-gray-100" />
              <div className="w-full h-16 rounded-2xl bg-gray-200/60 animate-pulse border border-gray-100" />
            </div>

            {/* Big Order Button skeleton */}
            <div className="w-full h-14 rounded-2xl bg-gray-300/80 animate-pulse shadow-sm" />

            {/* Form Fields skeleton */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200 space-y-4 shadow-xs">
              <div className="w-40 h-5 rounded bg-gray-200/80 animate-pulse" />
              <div className="space-y-3">
                <div className="w-full h-11 rounded-xl bg-gray-100 animate-pulse" />
                <div className="w-full h-11 rounded-xl bg-gray-100 animate-pulse" />
                <div className="w-full h-11 rounded-xl bg-gray-100 animate-pulse" />
              </div>
              <div className="w-full h-12 rounded-xl bg-gray-200/90 animate-pulse" />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};
