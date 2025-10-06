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
  // Debug logging
  console.log('MessageCard props:', { title, message, mediaUrl, mediaType, ctaText, link });
  const [isShareSupported, setIsShareSupported] = useState(false)

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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: message,
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
    const shareText = `${title}\n\n${message}\n\n${window.location.href}`
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
        lowerUrl.includes('cloudinary.com') || lowerUrl.includes('vimeo.com') ||
        lowerUrl.includes('drive.google.com')) return 'video'
    
    // Check for image extensions
    if (lowerUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image'
    
    // Default to image for other URLs
    return 'image'
  }

  const actualMediaType = getMediaType(mediaUrl)
  
  // Debug logging for media detection
  console.log('Media detection:', {
    originalMediaType: mediaType,
    detectedMediaType: actualMediaType,
    mediaUrl: mediaUrl,
    isYouTube: mediaUrl && (mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be')),
    isGoogleDrive: mediaUrl && mediaUrl.includes('drive.google.com')
  });
  
  
  // Render background media based on type
  const renderBackgroundMedia = () => {
    console.log('Rendering background media:', { actualMediaType, mediaUrl, title });
    
    if (actualMediaType === 'fallback' || !mediaUrl) {
      console.log('Using fallback image: /chimp.png');
      return (
        <img
          src="/chimp.png"
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )
    }

    if (actualMediaType === 'video') {
      console.log('Rendering video:', mediaUrl);
      // For videos, use iframe for external links (YouTube, Google Drive) or video element for direct files
      if (mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be') || mediaUrl.includes('drive.google.com')) {
        // Convert YouTube URLs to embed format
        let embedUrl = mediaUrl
        if (mediaUrl.includes('youtube.com/shorts/')) {
          // Convert YouTube Shorts to embed format
          const videoId = mediaUrl.split('/shorts/')[1].split('?')[0]
          embedUrl = `https://www.youtube.com/embed/${videoId}`
        } else if (mediaUrl.includes('youtu.be/')) {
          // Convert youtu.be to embed format
          const videoId = mediaUrl.split('youtu.be/')[1].split('?')[0]
          embedUrl = `https://www.youtube.com/embed/${videoId}`
        } else if (mediaUrl.includes('youtube.com/watch?v=')) {
          // Convert regular YouTube to embed format
          const videoId = mediaUrl.split('v=')[1].split('&')[0]
          embedUrl = `https://www.youtube.com/embed/${videoId}`
        } else if (mediaUrl.includes('drive.google.com')) {
          // Convert Google Drive to embed format
          embedUrl = mediaUrl.replace('/view?usp=sharing', '/preview').replace('/view?usp=drive_link', '/preview')
        }
        
        console.log('Converted video URL:', embedUrl);
        
        return (
          <iframe
            src={embedUrl}
            title={title}
            className="absolute inset-0 w-full h-full"
            allowFullScreen={true}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        )
      } else {
        // For direct video files
        return (
          <video
            src={mediaUrl}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        )
      }
    }

    console.log('Rendering image:', mediaUrl);
    return (
      <img
        src={mediaUrl}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
      />
    )
  }

  return (
    <div className="relative w-full max-w-sm mx-auto h-[480px] sm:h-[480px] rounded-3xl overflow-hidden shadow-2xl">
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
      
      {/* Enhanced gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70"></div>
      
      
      {/* Enhanced overlay content with animations */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white drop-shadow-lg animate-fadeInUp">
          {title.includes('Women We Love:') ? (
            <>
              Women We Love:<br />
              {title.replace('Women We Love: ', '')}
            </>
          ) : (
            title
          )}
        </h2>
        <p className="mt-4 text-lg sm:text-xl text-white/90 leading-relaxed max-w-lg animate-fadeInUp delay-200">
          {message}
        </p>
        
        {/* Single CTA Button - Show donate button for donation messages, regular CTA for others, or share button as fallback */}
        {(isDonateDay() || isDonationMessage()) ? (
          <button
            onClick={handleDonate}
            className="mt-8 inline-flex items-center bg-white/30 backdrop-blur-md border border-white/40 text-white font-semibold rounded-2xl py-3 px-8 hover:scale-105 hover:bg-white/40 transition-all duration-300 animate-fadeInUp delay-400 z-30 relative"
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
            className="mt-8 inline-flex items-center bg-white/30 backdrop-blur-md border border-white/40 text-white font-semibold rounded-2xl py-3 px-8 hover:scale-105 hover:bg-white/40 transition-all duration-300 animate-fadeInUp delay-400 z-30 relative"
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
            className="mt-8 inline-flex items-center bg-white/30 backdrop-blur-md border border-white/40 text-white font-semibold rounded-2xl py-3 px-8 hover:scale-105 hover:bg-white/40 transition-all duration-300 animate-fadeInUp delay-400 z-30 relative"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367-2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            Share Message
          </button>
        )}
      </div>
    </div>
  )
}
