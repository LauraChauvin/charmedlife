import { useState, useRef, useEffect } from 'react'

interface LazyVideoProps {
  src: string
  title: string
  className?: string
  allowFullScreen?: boolean
}

export default function LazyVideo({ src, title, className, allowFullScreen }: LazyVideoProps) {
  const [loaded, setLoaded] = useState(false)
  const [inView, setInView] = useState(false)
  const videoRef = useRef<HTMLDivElement>(null)

  // Convert YouTube URLs to embed URLs and handle Cloudinary videos
  function getVideoEmbedUrl(url: string): string {
    // Handle YouTube URLs
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    const youtubeMatch = url.match(youtubeRegex)
    
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`
    }
    
    // Handle Cloudinary videos - if it contains /video/upload/ convert to iframe URL
    if (url.includes('res.cloudinary.com') && url.includes('/video/upload/')) {
      // Cloudinary direct video embed
      return url
    }
    
    // For other direct video URLs or iframe URLs
    return url
  }

  const embedUrl = getVideoEmbedUrl(src)

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
        // Better mobile performance
        root: null
      }
    )

    if (videoRef.current) {
      observer.observe(videoRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={videoRef} className={`relative ${className}`}>
      {inView && !loaded && (
        <div className="animate-pulse bg-gray-200 flex items-center justify-center w-full h-full">
          <div className="text-gray-400 text-sm">Loading video...</div>
        </div>
      )}
      {inView && (
        <iframe
          src={embedUrl}
          title={title}
          className={`transition-opacity duration-300 w-full h-full ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setLoaded(true)}
          allowFullScreen={allowFullScreen}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          // Mobile optimization
          style={{
            contain: 'layout style paint'
          }}
        />
      )}
    </div>
  )
}
