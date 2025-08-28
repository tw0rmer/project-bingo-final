import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function GameCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200 animate-pulse">
      {/* Title skeleton */}
      <Skeleton className="h-8 w-3/4 mb-4" />
      
      {/* Numbers grid skeleton */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full rounded-lg" />
        ))}
      </div>
      
      {/* Action button skeleton */}
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}

export function LobbyCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200">
      {/* Header */}
      <div className="mb-6">
        <Skeleton className="h-8 w-2/3 mb-2" />
        <Skeleton className="h-4 w-full" />
      </div>
      
      {/* Stats */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      
      {/* Progress bar */}
      <Skeleton className="h-2 w-full mb-6 rounded-full" />
      
      {/* Button */}
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  );
}

export function WinnerCardSkeleton() {
  return (
    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
      <Skeleton className="h-3 w-full" />
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-10 w-10 rounded-full" />
    </div>
  );
}