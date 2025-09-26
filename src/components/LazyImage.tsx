import { useState, useRef, useEffect } from 'react'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
}

export default function LazyImage({ src, alt, className }: LazyImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [inView, setInView] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { 
        threshold: 0.1, 
        rootMargin: '50px',
        // Use passive listeners for better mobile performance
        root: null 
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={imgRef} className="relative overflow-hidden">
      {inView && (
        <img
          src={src}
          alt={alt}
          className={`transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          onLoad={() => setLoaded(true)}
          loading="lazy"
          // Mobile-friendly image optimization
          decoding="async"
          style={{
            contain: 'layout style paint',
            willChange: 'opacity'
          }}
        />
      )}
      {!loaded && inView && (
        <div className={`animate-pulse bg-gray-200 flex items-center justify-center ${className}`}>
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )}
    </div>
  )
}
