import { useState, useEffect } from 'react'
import LazyImage from './LazyImage'
import LazyVideo from './LazyVideo'

interface DailyMessage {
  date: string
  type: string
  title: string
  message: string
  mediaURL: string
  cta: string
  link: string
}

interface MessageCardProps {
  message: DailyMessage
  token?: string
}

export default function MessageCard({ message, token }: MessageCardProps) {
  const [isShareSupported, setIsShareSupported] = useState(false)

  // Check if Web Share API is supported
  useEffect(() => {
    setIsShareSupported('share' in navigator)
  }, [])

  // Log token for analytics when message is displayed
  useEffect(() => {
    if (token) {
      console.log('MessageCard displaying for token:', token)
      console.log('Message title:', message.title)
    }
  }, [token, message.title])

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: message.title,
          text: message.message,
          url: window.location.href
        })
        console.log('Share successful')
      } catch (err) {
        // User cancelled sharing or error occurred
        console.log('Share cancelled orerror occurred:', err)
        // Fallback for unsupported browsers
        fallbackShare()
      }
    } else {
      // Fallback for browsers without Web Share API
      fallbackShare()
    }
  }

  const fallbackShare = () => {
    // Fallback sharing method
    const shareText = `${message.title}\n\n${message.message}\n\n${window.location.href}`
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Message copied to clipboard! You can now paste it to share.')
      }).catch(() => {
        // Final fallback - create share modal
        showShareModal(shareText)
      })
    } else {
      showShareModal(shareText)
    }
  }

  const showShareModal = (text: string) => {
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(shareUrl, '_blank', 'noopener,noreferrer')
  }

  const handleDonate = () => {
    // Open the correct donation URL for mobile-friendly experience
    window.open('https://www.zeffy.com/en-US/donation-form/pitchin-for-pads', '_blank', 'noopener,noreferrer')
  }

  // Enhanced type checking for live data handling
  const isVideoEmbed = message.type === "Video: text embedded" || message.type === "Add text over video"
  const isTextOverImage = message.type === "Add text over image"
  
  // Ensure we have a valid mediaURL or use fallback
  const getMediaUrl = () => {
    if (message.mediaURL && message.mediaURL.trim() !== '') {
      return message.mediaURL
    }
    return '/chimp.png' // Default fallback image as specified
  }
  
  // Only show CTA if both cta text and link exist
  const showCTA = message.cta && message.link && message.cta.trim() !== '' && message.link.trim() !== ''

  return (
    <div className="bg-white/95 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl overflow-hidden animate-fade-in relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-500/5 before:via-indigo-500/5 before:to-purple-500/5 before:rounded-3xl">
      {/* Media Section with Sophisticated Frame */}
      <div className="relative rounded-t-3xl overflow-hidden group">
        {/* Frame effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/10 pointer-events-none z-10"></div>
        
        {isVideoEmbed ? (
          <LazyVideo
            src={getMediaUrl()}
            title={message.title}
            className="w-full aspect-video object-cover rounded-t-3xl group-hover:scale-105 transition-transform duration-500"
            allowFullScreen
          />
        ) : isTextOverImage ? (
          <div className="relative">
            <LazyImage
              src={getMediaUrl()}
              alt={message.title}
              className="w-full aspect-video object-cover rounded-t-3xl group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-blue-900/60 to-indigo-800/70 rounded-t-3xl flex items-center justify-center p-8">
              <div className="text-center text-white max-w-5xl">
                <h2 className="text-4xl sm:text-5xl font-bold mb-8 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent leading-tight">{message.title}</h2>
                <p className="text-xl sm:text-2xl leading-relaxed font-light text-white/95 max-w-4xl mx-auto">{message.message}</p>
              </div>
            </div>
          </div>
        ) : (
          <LazyImage
            src={getMediaUrl()}
            alt={message.title}
            className="w-full aspect-video object-cover rounded-t-3xl group-hover:scale-105 transition-transform duration-500"
          />
        )}
        
        {/* Cards corner decoration */}
        <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-blue-500/10 to-transparent rounded-lg transform rotate-12"></div>
      </div>

      {/* Content Section - Professional Typography */}
      {!isTextOverImage && (
        <div className="p-10 sm:p-12 bg-gradient-to-b from-white to-slate-50/30">
          <div className="text-center space-y-6">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl text-indigo-600 text-sm font-medium uppercase tracking-wider">
              Today's Focus
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent leading-tight">
              {message.title}
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto"></div>
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto font-light">
              {message.message}
            </p>
          </div>
        </div>
      )}

      {/* Sophisticated Action Buttons */}
      <div className="px-8 sm:px-10 pb-8 bg-gradient-to-b from-slate-50 to-white">
        {/* Primary CTA Button */}
        {showCTA && (
          <button
            onClick={() => window.open(message.link, '_blank')}
            className="w-full mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white py-4 px-8 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20"
          >
            {message.cta}
          </button>
        )}

        {/* Background Interactive Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleShare}
            className="flex-1 bg-white border-2 border-gray-200 text-gray-700 bg-white py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:border-blue-300 hover:text-blue-600 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500/10 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            Share Message
          </button>

          <button
            onClick={handleDonate}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-emerald-500/20 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Support Cause
          </button>
        </div>
      </div>
    </div>
  )
}
