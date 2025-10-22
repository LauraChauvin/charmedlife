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

  // Handle media URL changes and ensure proper clearing
  useEffect(() => {
    if (mediaUrl) {
      // console.log('Media URL changed:', mediaUrl)
      setIsMediaLoading(true)
      setMediaLoadError(false)
      // Clear any existing background content before loading new media
      const backgroundContainer = document.querySelector('.background-media-container')
      if (backgroundContainer) {
        backgroundContainer.innerHTML = ''
      }

      // Set a timeout to hide loading animation after 10 seconds
      const loadingTimeout = setTimeout(() => {
        // console.log('Loading timeout reached, hiding loading animation')
        setIsMediaLoading(false)
      }, 10000)

      return () => clearTimeout(loadingTimeout)
    }
  }, [mediaUrl])

  // Handle media load events
  const handleMediaLoad = () => {
    // console.log('Media loaded successfully')
    setIsMediaLoading(false)
    setMediaLoadError(false)
  }

  const handleMediaError = () => {
    console.log('Media failed to load')
    setIsMediaLoading(false)
    setMediaLoadError(true)
  }

  // Set up global handlers for embedded content
  useEffect(() => {
    window.handleMediaLoad = handleMediaLoad
    window.handleMediaError = handleMediaError
    
    // Also set up a fallback timer for iframes that don't trigger onload
    const fallbackTimer = setTimeout(() => {
      // console.log('Fallback timer: Assuming media loaded successfully')
      setIsMediaLoading(false)
    }, 5000) // 5 seconds fallback
    
    return () => {
      clearTimeout(fallbackTimer)
      delete window.handleMediaLoad
      delete window.handleMediaError
    }
  }, [])

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

  // Utility function to generate embed HTML for different media types
  const getEmbedHTML = (url) => {
    if (!url || url.trim() === '') return ''
    
    try {
      // YouTube (Shorts or standard)
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        let videoId = ""
        if (url.includes("/shorts/")) {
          videoId = url.split("/shorts/")[1].split("?")[0]
        } else if (url.includes("v=")) {
          videoId = new URL(url).searchParams.get("v")
        } else if (url.includes("youtu.be/")) {
          videoId = url.split("youtu.be/")[1].split("?")[0]
        }
        
        if (videoId) {
          console.log('YouTube video ID extracted:', videoId)
          return `
            <iframe
              src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}"
              frameborder="0"
              allow="autoplay; fullscreen"
              allowfullscreen
              class="absolute inset-0 w-full h-full object-cover"
              onload="window.handleMediaLoad && window.handleMediaLoad()"
              onerror="window.handleMediaError && window.handleMediaError()">
            </iframe>`
        }
      }

        // Google Drive (image or video) - always use preview endpoint
        if (url.includes("drive.google.com")) {
          const fileId = url.match(/[-\w]{25,}/)?.[0]
          if (fileId) {
            // console.log('Google Drive file detected:', fileId)
            return `
              <iframe
                src="https://drive.google.com/file/d/${fileId}/preview"
                frameborder="0"
                allow="autoplay; fullscreen"
                allowfullscreen
                class="absolute inset-0 w-full h-full object-cover"
                onload="window.handleMediaLoad && window.handleMediaLoad()"
                onerror="window.handleMediaError && window.handleMediaError()">
              </iframe>`
          }
        }

      // Image URLs
      if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        return `
          <img
            src="${url}"
            alt="Background image"
            class="absolute inset-0 w-full h-full object-cover"
            onload="window.handleMediaLoad && window.handleMediaLoad()"
            onerror="window.handleMediaError && window.handleMediaError()"
          />`
      }

      // Direct video files
      if (url.match(/\.(mp4|mov|avi|webm|ogg)$/i)) {
        return `
          <video
            src="${url}"
            autoplay
            muted
            loop
            playsInline
            class="absolute inset-0 w-full h-full object-cover"
            onload="window.handleMediaLoad && window.handleMediaLoad()"
            onerror="window.handleMediaError && window.handleMediaError()">
          </video>`
      }

      console.warn('Unsupported media type for URL:', url)
      return `<p class="absolute inset-0 flex items-center justify-center text-white">Unsupported media link</p>`
    } catch (error) {
      console.error('Error generating embed HTML for URL:', url, error)
      return `<div class="absolute inset-0 flex items-center justify-center bg-red-800 text-white">Error loading media</div>`
    }
  }

  // Determine media type - trust the mediaType prop if it's already set correctly
  const getMediaType = (url) => {
    if (!url || url.trim() === '') return 'fallback'
    
    // If mediaType indicates video, trust it
    if (mediaType && mediaType.toLowerCase().includes('video')) return 'video'
    
    const lowerUrl = url.toLowerCase()
    
    // Check for video extensions
    if (lowerUrl.match(/\.(mp4|mov|avi|webm|ogg)$/)) return 'video'
    
    // Check for YouTube or Cloudinary video URLs
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be') || 
        lowerUrl.includes('cloudinary.com') || lowerUrl.includes('vimeo.com')) return 'video'
    
    // Check for Google Drive - treat all as video since we use iframe preview
    if (lowerUrl.includes('drive.google.com')) {
      return 'video'
    }
    
    // Check for image extensions
    if (lowerUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image'
    
    // Default to image for other URLs
    return 'image'
  }

  const actualMediaType = getMediaType(mediaUrl)
  
  // Debug logging for media detection (reduced)
  // console.log('Media detection:', { originalMediaType: mediaType, detectedMediaType: actualMediaType, mediaUrl: mediaUrl });
  
  
  // Render background media using the new embed HTML system
  const renderBackgroundMedia = () => {
    // console.log('Rendering background media:', { actualMediaType, mediaUrl, title });
    
    if (!mediaUrl || mediaUrl.trim() === '') {
      // console.log('Using fallback image: /chimp.png');
      return (
        <img
          src="/chimp.png"
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )
    }

    // Use the new getEmbedHTML utility function
    const embedHTML = getEmbedHTML(mediaUrl)
    // console.log('Generated embed HTML:', embedHTML);
    
    if (embedHTML) {
      // Use dangerouslySetInnerHTML to inject the embed HTML
      return (
        <div 
          dangerouslySetInnerHTML={{ __html: embedHTML }}
          className="absolute inset-0 w-full h-full"
          onLoad={() => {
            // console.log('Container loaded, checking iframe status')
            // Additional check for iframe loading
            setTimeout(() => {
              const iframe = document.querySelector('iframe')
              if (iframe) {
                // console.log('Iframe found, checking src:', iframe.src)
                // For Google Drive previews, assume loaded after a short delay
                setTimeout(() => {
                  // console.log('Google Drive iframe should be loaded by now')
                  setIsMediaLoading(false)
                }, 2000)
              }
            }, 1000)
          }}
        />
      )
    }

    // Fallback to original image rendering if embed HTML generation fails
    // console.log('Falling back to image rendering:', mediaUrl);
    return (
      <img
        src={mediaUrl}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
      />
    )
  }

  return (
    <div className="relative w-full h-screen sm:max-w-sm sm:mx-auto sm:h-[480px] sm:rounded-3xl overflow-hidden shadow-2xl">
      {/* Background Media Container */}
      <div className="background-media-container absolute inset-0">
        {/* Clickable Background Media */}
        {mediaUrl && (
          <a
            href={mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 z-10"
          >
            {renderBackgroundMedia()}
          </a>
        )}
        
        {/* Fallback image if no mediaUrl */}
        {!mediaUrl && renderBackgroundMedia()}
      </div>

      {/* Loading Animation Overlay */}
      {isMediaLoading && mediaUrl && (
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
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70"></div>
      
      
      {/* Enhanced overlay content with animations */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
        <div className="bg-emerald-600/70 backdrop-blur-sm rounded-2xl p-6 sm:p-8 max-w-4xl">
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
        
        {/* Single CTA Button - Show donate button for donation messages, regular CTA for others, or share button as fallback */}
        <div className="mt-8">
          {(isDonateDay() || isDonationMessage()) ? (
            <button
              onClick={handleDonate}
              className="inline-flex items-center bg-white/30 backdrop-blur-md border border-white/40 text-white font-semibold rounded-2xl py-3 px-8 hover:scale-105 hover:bg-white/40 transition-all duration-300 animate-fadeInUp delay-400 z-30 relative"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              Donate Now
            </button>
          ) : ctaText && link ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-white/30 backdrop-blur-md border border-white/40 text-white font-semibold rounded-2xl py-3 px-8 hover:scale-105 hover:bg-white/40 transition-all duration-300 animate-fadeInUp delay-400 z-30 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              {ctaText}
            </a>
          ) : (
            <button
              onClick={handleShare}
              className="inline-flex items-center bg-white/30 backdrop-blur-md border border-white/40 text-white font-semibold rounded-2xl py-3 px-8 hover:scale-105 hover:bg-white/40 transition-all duration-300 animate-fadeInUp delay-400 z-30 relative"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367-2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              Share Message
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
