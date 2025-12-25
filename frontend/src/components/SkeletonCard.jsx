// src/components/SkeletonCard.jsx
import React from 'react'

export default function SkeletonCard() {
  return (
    <div className="rounded-xl p-4 bg-white animate-pulse shadow-sm">
      <div className="h-40 bg-slate-200 rounded-md mb-4" />
      <div className="h-4 bg-slate-200 rounded w-1/3 mb-2" />
      <div className="h-3 bg-slate-200 rounded w-1/2" />
    </div>
  )
}


