import React, { useState, useEffect } from "react"
import LazyImage from "./LazyImage"
import LazyVideo from "./LazyVideo"

export default function MessageCard({
  title,
  message,
  mediaUrl,
  mediaType = "image",
  ctaText,
  ctaLink,
  accent,
  link, // New prop for optional link URL from Google Sheet
  hasActualCtaData = false, // Flag to indicate if we have real CTA data (not defaults)
}) {
  // Debug logging (reduced)
  // console.log('MessageCard props:', { title, message, mediaUrl, mediaType, ctaText, link });
  const [isShareSupported, setIsShareSupported] = useState(false)
  const [isMediaLoading, setIsMediaLoading] = useState(true)
  const [mediaLoadError, setMediaLoadError] = useState(false)

  // Calendar-based logic for donate days
  const isDonateDay = () => {
    const day = new Date().getDate()
    return day === 2 || day === 16
  }

  // Check if this is a donation message based on CTA text or link
  const isDonationMessage = () => {
    return (ctaText && ctaText.toLowerCase().includes('donate')) || 
           (link && link.includes('zeffy.com'))
  }

  useEffect(() => {
    setIsShareSupported('share' in navigator)
  }, [])

  // Handle media URL changes - simplified approach
  useEffect(() => {
    if (mediaUrl) {
      console.log('Media URL changed:', mediaUrl)
      setIsMediaLoading(true)
      setMediaLoadError(false)
      
      // Set a shorter timeout for loading
      const loadingTimeout = setTimeout(() => {
        console.log('Loading timeout reached, hiding loading animation')
        setIsMediaLoading(false)
      }, 3000) // Reduced to 3 seconds

      return () => clearTimeout(loadingTimeout)
    } else {
      console.log('No media URL provided')
      setIsMediaLoading(false)
    }
  }, [mediaUrl])

  // Handle media load events - simplified
  const handleMediaLoad = () => {
    console.log('✅ Media loaded successfully:', mediaUrl)
    setIsMediaLoading(false)
    setMediaLoadError(false)
  }

  const handleMediaError = (error) => {
    console.log('❌ Media failed to load:', mediaUrl, error)
    setIsMediaLoading(false)
    setMediaLoadError(true)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'FootForward Inspiration',
          text: 'Daily Inspiration from FootForward Fund',
          url: window.location.href
        })
        console.log('Share successful')
      } catch (err) {
        console.log('Share cancelled or error occurred:', err)
        fallbackShare()
      }
    } else {
      fallbackShare()
    }
  }

  const fallbackShare = () => {
    const shareText = `FootForward Inspiration\n\nDaily Inspiration from FootForward Fund\n\n${window.location.href}`
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Message copied to clipboard! You can now paste it to share.')
      }).catch(() => {
        showShareModal(shareText)
      })
    } else {
      showShareModal(shareText)
    }
  }

  const showShareModal = (text) => {
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(shareUrl, '_blank', 'noopener,noreferrer')
  }

  const handleDonate = () => {
    window.open('https://www.zeffy.com/en-US/donation-form/pitchin-for-pads', '_blank', 'noopener,noreferrer')
  }

  // Simplified media type detection
  const isVideoUrl = (url) => {
    if (!url) return false
    return url.includes('youtube.com') || 
           url.includes('youtu.be') || 
           url.includes('vimeo.com') ||
           url.includes('drive.google.com') ||
           url.match(/\.(mp4|mov|avi|webm|ogg)$/i)
  }
  
  
  // Simplified media rendering - go back to reliable approach
  const renderBackgroundMedia = () => {
    console.log('Rendering background media:', { mediaUrl, mediaType, title });

    if (!mediaUrl || mediaUrl.trim() === '') {
      return (
        <img
          src="/defaultimage.png"
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
          onLoad={handleMediaLoad}
          onError={handleMediaError}
        />
      );
    }

    // If URL ends in a real image extension → render as image
    if (mediaUrl.match(/\.(png|jpg|jpeg|gif|webp)$/i)) {
      return (
        <img
          src={mediaUrl}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
          onLoad={handleMediaLoad}
          onError={handleMediaError}
        />
      );
    }

    // YouTube embeds
    if (mediaUrl.includes("youtube.com") || mediaUrl.includes("youtu.be")) {
      let videoId = "";
      if (mediaUrl.includes("/shorts/")) {
        videoId = mediaUrl.split("/shorts/")[1].split("?")[0];
      } else if (mediaUrl.includes("v=")) {
        videoId = new URL(mediaUrl).searchParams.get("v");
      } else if (mediaUrl.includes("youtu.be/")) {
        videoId = mediaUrl.split("youtu.be/")[1].split("?")[0];
      }

      if (videoId) {
        return (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}`}
            className="absolute inset-0 w-full h-full object-cover"
            onLoad={handleMediaLoad}
            onError={handleMediaError}
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        );
      }
    }

    // Drive preview embed
    if (mediaUrl.includes("drive.google.com")) {
      const fileId = mediaUrl.match(/[-\w]{25,}/)?.[0];
      if (fileId) {
        return (
          <iframe
            src={`https://drive.google.com/file/d/${fileId}/preview`}
            className="absolute inset-0 w-full h-full object-cover"
            onLoad={handleMediaLoad}
            onError={handleMediaError}
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        );
      }
    }

    // Direct video file
    if (mediaUrl.match(/\.(mp4|mov|avi|webm|ogg)$/i)) {
      return (
        <video
          src={mediaUrl}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          onLoadedData={handleMediaLoad}
          onError={handleMediaError}
        />
      );
    }

    // Fallback: render as image
    return (
      <img
        src={mediaUrl}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
        onLoad={handleMediaLoad}
        onError={handleMediaError}
      />
    );
  }

  return (
    <div className="relative w-full h-screen sm:max-w-sm sm:mx-auto sm:h-[480px] sm:rounded-3xl overflow-hidden sm:shadow-2xl">
      {/* Background Media Container */}
      <div className="background-media-container absolute inset-0">
        {renderBackgroundMedia()}
      </div>

      {/* Loading Animation Overlay */}
      {isMediaLoading && mediaUrl && mediaUrl.trim() !== '' && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-indigo-900/80 flex items-center justify-center z-20">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white mx-auto mb-4"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-transparent"></div>
            </div>
            <p className="text-white/90 text-sm font-medium animate-pulse">
              Loading media...
            </p>
          </div>
        </div>
      )}

      {/* Error State Overlay */}
      {mediaLoadError && (
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/80 to-red-800/80 flex items-center justify-center z-20">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-white/90 text-sm font-medium">
              Failed to load media
            </p>
          </div>
        </div>
      )}
      
      {/* Enhanced gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70 z-10"></div>
      
      {/* Share Button - Top Right */}
      <button
        onClick={handleShare}
        className="absolute top-4 right-4 z-30 inline-flex items-center justify-center bg-white/20 hover:bg-white/30 border border-white/30 hover:border-white/50 text-white rounded-full w-12 h-12 hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm"
        aria-label="Share"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367-2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
        </svg>
      </button>
      
      {/* Enhanced overlay content with animations */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full px-6 text-center">
        <div className="bg-black/20 rounded-2xl p-6 sm:p-8 max-w-4xl">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white drop-shadow-lg animate-fadeInUp">
            {title.includes('Women We Love:') ? (
              <>
                Women We Love:<br />
                {title.replace('Women We Love: ', '')}
              </>
            ) : (
              title
            )}
          </h2>
          <p className="mt-4 text-lg sm:text-xl text-white/95 leading-relaxed max-w-lg animate-fadeInUp delay-200">
            {message}
          </p>
        </div>
        
        {/* Single CTA Button - Show donate button for donation messages, regular CTA for others */}
        <div className="mt-8">
          {isDonateDay() || isDonationMessage() ? (
            <button
              onClick={handleDonate}
              className="inline-flex items-center bg-green-500 text-white font-semibold rounded-2xl py-3 px-8 hover:scale-105 hover:bg-green-600 transition-all duration-300 animate-fadeInUp delay-400 z-30 relative"
            >
              Donate Now
            </button>
          ) : link && link.trim() !== '' ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-white/30 backdrop-blur-md border border-white/40 text-white font-semibold rounded-2xl py-3 px-8 hover:scale-105 hover:bg-white/40 transition-all duration-300 animate-fadeInUp delay-400 z-30 relative"
            >
              Learn More
            </a>
          ) : (
            <a
              href="https://www.footforwardfund.org/about.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-green-500 text-white font-semibold rounded-2xl py-3 px-8 hover:scale-105 hover:bg-green-600 transition-all duration-300 animate-fadeInUp delay-400 z-30 relative"
            >
              Get to Know Her Best Foot Forward
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
