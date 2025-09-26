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

  // Convert YouTube URLs to embed URLs
  function getVideoEmbedUrl(url: string): string {
    // Check if it's a YouTube URL
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    const match = url.match(youtubeRegex)
    
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}`
    }
    
    // For Cloudinary or direct video URLs
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
      { threshold: 0.1, rootMargin: '50px' }
    )

    if (videoRef.current) {
      observer.observe(videoRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={videoRef} className="relative">
      {inView && !loaded && (
        <div className={`animate-pulse bg-gray-200 flex items-center justify-center ${className}`}>
          <div className="text-gray-400">Loading video...</div>
        </div>
      )}
      {inView && (
        <iframe
          src={embedUrl}
          title={title}
          className={`transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          onLoad={() => setLoaded(true)}
          allowFullScreen={allowFullScreen}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      )}
    </div>
  )
}
