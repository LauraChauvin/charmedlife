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

  const isVideoEmbed = message.type === "Video"
  const isTextOverImage = message.type === "Add text over image"
  
  // Only show CTA if both cta text and link exist
  const showCTA = message.cta && message.link && message.cta.trim() !== '' && message.link.trim() !== ''

  return (
    <div className="card-elevated bg-white/90 backdrop-blur-sm border border-white/20 animate-fade-in">
      {/* Media Section with Enhanced Visual Design */}
      <div className="relative rounded-t-2xl overflow-hidden">
        {isVideoEmbed ? (
          <LazyVideo
            src={message.mediaURL}
            title={message.title}
            className="w-full aspect-video rounded-t-2xl"
            allowFullScreen
          />
        ) : isTextOverImage ? (
          <div className="relative">
            <LazyImage
              src={message.mediaURL}
              alt={message.title}
              className="w-full aspect-video object-cover rounded-t-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/50 to-black/30 rounded-t-2xl flex items-center justify-center p-8">
              <div className="text-center text-white max-w-4xl">
                <h2 className="text-3xl sm:text-4xl font-bold mb-6 script-text text-glow">{message.title}</h2>
                <p className="text-lg sm:text-xl leading-relaxed font-medium text-white/95">{message.message}</p>
              </div>
            </div>
          </div>
        ) : (
          <LazyImage
            src={message.mediaURL}
            alt={message.title}
            className="w-full aspect-video object-cover rounded-t-2xl"
          />
        )}
      </div>

      {/* Content Section - Enhanced Typography */}
      {!isTextOverImage && (
        <div className="p-8 sm:p-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-brand mb-6 script-text text-center">{message.title}</h2>
          <p className="text-lg sm:text-xl text-gray-700 leading-relaxed text-center font-medium">{message.message}</p>
        </div>
      )}

      {/* Enhanced Action Buttons Section */}
      <div className="px-6 sm:px-8 pb-8 space-y-6">
        {/* CTA Button - Enhanced design when available */}
        {showCTA && (
          <button
            onClick={() => window.open(message.link, '_blank')}
            className="w-full btn-primary btn-mobile touch-feedback text-lg font-semibold"
          >
            {message.cta}
          </button>
        )}

        {/* Interaction Buttons - Enhanced Visual Design */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Share Button - Enhanced for Mobile */}
          <button
            onClick={handleShare}
            className="flex-1 btn-outline btn-mobile touch-feedback text-base font-semibold"
          >
            <span className="mr-2 text-lg">📤</span>
            Share
          </button>

          {/* Donate Button - Enhanced for Mobile */}
          <button
            onClick={handleDonate}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-300 btn-mobile touch-feedback shadow-soft-md text-base"
          >
            <span className="mr-2 text-lg">💝</span>
            Donate
          </button>
        </div>
      </div>
    </div>
  )
}
