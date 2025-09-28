import React, { useState, useEffect } from "react"

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
  console.log('MessageCard props:', { title, mediaUrl, mediaType });
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

  // Auto-detect media type if it's incorrectly set
  const actualMediaType = mediaUrl && mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? "image" : mediaType;
  
  // Wrapper component for media with optional link support
  const MediaWrapper = ({ children }) => {
    if (link) {
      return (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="block transition-all duration-300 hover:scale-105 hover:brightness-110"
        >
          {children}
        </a>
      )
    }
    return <>{children}</>
  }
  
  return (
    <div className="relative w-full max-w-sm mx-auto rounded-2xl overflow-hidden shadow-xl" style={{ minHeight: 'min(600px, 60vh)' }}>
      {actualMediaType === "video" ? (
        <div className="relative w-full aspect-video">
          <MediaWrapper>
            <iframe
              src={mediaUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Daily Message Video"
            />
          </MediaWrapper>
          
          {/* Large Charmed Life Logo Overlay - Top Center */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
            <img 
              src="/logo-blue.png" 
              alt="Charmed Life" 
              className="h-20 w-20 sm:h-24 sm:w-24 drop-shadow-2xl"
            />
          </div>
          
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4 drop-shadow-lg leading-tight">
                {title}
              </h2>
              <p className="text-white text-base sm:text-lg lg:text-xl font-light leading-relaxed drop-shadow-lg">
                {message}
              </p>
              {/* CTA */}
              {ctaText && ctaLink && (
                <a
                  href={ctaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    inline-block mt-4 px-6 py-3 rounded-xl font-semibold 
                    bg-blue-600 hover:bg-blue-500 transition-colors 
                    shadow-md hover:shadow-xl text-white
                  "
                >
                  {ctaText}
                </a>
              )}
              {/* Share/Donate Button */}
              {(isDonateDay() || isDonationMessage()) ? (
                <button
                  onClick={handleDonate}
                  className="
                    inline-flex items-center mt-3 px-6 py-3 rounded-xl font-semibold 
                    bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 
                    hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500
                    transition-all duration-300 text-white
                    shadow-md hover:shadow-xl
                  "
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Donate Now
                </button>
              ) : (
                <button
                  onClick={handleShare}
                  className="
                    inline-flex items-center mt-3 px-6 py-3 rounded-xl font-semibold 
                    bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20
                    transition-all duration-300 text-white
                    shadow-md hover:shadow-xl
                  "
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  Share Message
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="relative w-full">
          <MediaWrapper>
            <img
              src={mediaUrl || '/chimp.png'}
              alt={title}
              className="w-full h-auto object-cover"
              style={{ minHeight: 'min(600px, 60vh)', maxHeight: '800px' }}
              onError={(e) => {
                e.target.src = '/chimp.png';
              }}
            />
          </MediaWrapper>
          
          {/* Large Charmed Life Logo Overlay - Top Center */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
            <img 
              src="/logo-blue.png" 
              alt="Charmed Life" 
              className="h-20 w-20 sm:h-24 sm:w-24 drop-shadow-2xl"
            />
          </div>
          
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4 drop-shadow-lg leading-tight">
                {title}
              </h2>
              <p className="text-white text-base sm:text-lg lg:text-xl font-light leading-relaxed drop-shadow-lg">
                {message}
              </p>
              {/* CTA */}
              {ctaText && ctaLink && (
                <a
                  href={ctaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    inline-block mt-4 px-6 py-3 rounded-xl font-semibold 
                    bg-blue-600 hover:bg-blue-500 transition-colors 
                    shadow-md hover:shadow-xl text-white
                  "
                >
                  {ctaText}
                </a>
              )}
              {/* Share/Donate Button */}
              {(isDonateDay() || isDonationMessage()) ? (
                <button
                  onClick={handleDonate}
                  className="
                    inline-flex items-center mt-3 px-6 py-3 rounded-xl font-semibold 
                    bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 
                    hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500
                    transition-all duration-300 text-white
                    shadow-md hover:shadow-xl
                  "
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Donate Now
                </button>
              ) : (
                <button
                  onClick={handleShare}
                  className="
                    inline-flex items-center mt-3 px-6 py-3 rounded-xl font-semibold 
                    bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20
                    transition-all duration-300 text-white
                    shadow-md hover:shadow-xl
                  "
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  Share Message
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
