import React from 'react'

export default function ImageWithInstagramLoader({ src }: { src?: string }) {
  const [loaded, setLoaded] = React.useState(false)
  const isEmpty = !src
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          {/* Spinner اینستاگرام */}
          <div className="w-16 h-16 flex items-center justify-center">
            <svg className="animate-spin" width="48" height="48" viewBox="0 0 50 50">
              <circle
                cx="25"
                cy="25"
                r="20"
                fill="none"
                stroke="#fff"
                strokeWidth="5"
                strokeDasharray="90 150"
                strokeLinecap="round"
                opacity="0.7"
              />
            </svg>
          </div>
        </div>
      )}
      {isEmpty ? (
        <div className="w-40 h-72 bg-gray-800 flex items-center justify-center rounded-xl">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </div>
      ) : (
        <img
          src={src}
          alt="Story"
          className="max-w-full max-h-full object-contain rounded-xl"
          style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.3s' }}
          onLoad={() => setLoaded(true)}
        />
      )}
    </div>
  )
}