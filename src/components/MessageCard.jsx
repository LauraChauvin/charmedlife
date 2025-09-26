import { useState, useEffect } from "react"

export function MessageCard({
  title,
  message,
  mediaType = "image",
  mediaUrl,
  mediaAlt = "",
  ctaText,
  onCtaClick,
  accent,
  type = "", // Add type parameter to detect "Add text over image"
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [isShareSupported, setIsShareSupported] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300)
    return () => clearTimeout(timer)
  }, [])

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

  return (
    <div 
      className={`
        bg-white rounded-xl shadow-lg mx-4 p-6 space-y-6 mb-8 max-w-md w-full mx-auto
        transition-all duration-700 ease-out
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
        hover:shadow-xl hover:scale-[1.02] transition-all duration-300 ease-out
      `}
    >
      {/* Accent Label */}
      {accent && (
        <div className="text-center">
          <span className="font-halimum text-[#1e4395] text-lg font-medium italic">"{accent}"</span>
        </div>
      )}

      {/* Title */}
      <h1 className="font-bold text-2xl text-gray-800 text-center leading-tight">
        {title}
      </h1>

      {/* Body Text */}
      <p className="text-gray-600 leading-relaxed text-center">
        {message}
      </p>

      {/* Media Area */}
      {mediaUrl && (
        <div className="mt-6">
          {mediaType === "image" ? (
            <div className="w-full bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
              <img
                src={mediaUrl}
                alt={mediaAlt}
                className="w-full h-auto object-contain rounded-xl"
              />
            </div>
          ) : mediaType === "video" ? (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden">
              <iframe
                src={mediaUrl}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Daily message video"
              />
            </div>
          ) : null}
        </div>
      )}

      {/* CTA Button */}
      {ctaText && onCtaClick && (
        <button
          onClick={onCtaClick}
          className={`
            w-full py-4 px-6 rounded-xl font-medium text-white transition-all duration-300 ease-in-out
            bg-[#1e4395] hover:bg-[#F1C40F] hover:text-gray-900
            shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95
          `}
        >
          {ctaText}
        </button>
      )}

      {/* Share and Donate Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Share Button */}
        <button
          onClick={handleShare}
          className="flex-1 bg-white border-2 border-gray-200 text-gray-700 py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:border-blue-300 hover:text-blue-600 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500/10 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
          Share Message
        </button>

        {/* Donate Button */}
        <button
          onClick={handleDonate}
          className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-emerald-500/20 flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          Support Cause
        </button>
      </div>
    </div>
  )
}
