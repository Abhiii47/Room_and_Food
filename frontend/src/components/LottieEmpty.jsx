// src/components/LottieEmpty.jsx
import React from 'react'
import Lottie from 'lottie-react' // optional if you later add JSON file

// If you add a JSON animation at public/lottie/empty.json:
// import emptyJson from '/lottie/empty.json'
// <Lottie animationData={emptyJson} loop />

export default function LottieEmpty({ message = 'No data found' }) {
  return (
    <div className="flex flex-col items-center justify-center p-6">
      <div style={{ width: 200, height: 160 }}>
        <svg className="w-full h-full" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="160" rx="12" fill="#F1F5F9"/>
          <circle cx="100" cy="60" r="24" fill="#E2E8F0"/>
        </svg>
      </div>

      <p className="mt-2 text-slate-500">{message}</p>
      <p className="text-xs text-slate-300 mt-1">Try changing filters or location</p>
    </div>
  )
}
