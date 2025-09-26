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
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Media Section */}
      <div className="relative">
        {isVideoEmbed ? (
          <LazyVideo
            src={message.mediaURL}
            title={message.title}
            className="w-full aspect-video"
            allowFullScreen
          />
        ) : isTextOverImage ? (
          <div className="relative">
            <LazyImage
              src={message.mediaURL}
              alt={message.title}
              className="w-full aspect-video object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-6">
              <div className="text-center text-white">
                <h2 className="text-2xl font-bold mb-4">{message.title}</h2>
                <p className="text-lg leading-relaxed">{message.message}</p>
              </div>
            </div>
          </div>
        ) : (
          <LazyImage
            src={message.mediaURL}
            alt={message.title}
            className="w-full aspect-video object-cover"
          />
        )}
      </div>

      {/* Content Section */}
      {!isTextOverImage && (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{message.title}</h2>
          <p className="text-gray-700 leading-relaxed mb-6">{message.message}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-6 pb-6 space-y-4">
        {/* CTA Button - Only show if both CTA text and Link exist */}
        {showCTA && (
          <button
            onClick={() => window.open(message.link, '_blank')}
            className="w-full btn-primary"
          >
            {message.cta}
          </button>
        )}

        {/* Interaction Buttons - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Share Button - Enhanced for Mobile */}
          <button
            onClick={handleShare}
            className="flex-1 px-4 py-4 rounded-lg font-medium bg-white border-2 border-brand text-brand hover:bg-brand hover:text-white transition-all duration-200 btn-mobile touch-feedback"
          >
            <span className="mr-2 text-base">📤</span>
            Share
          </button>

          {/* Donate Button - Enhanced for Mobile */}
          <button
            onClick={handleDonate}
            className="flex-1 px-4 py-4 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 active:bg-emerald-800 transition-all duration-200 btn-mobile touch-feedback"
          >
            <span className="mr-2 text-base">💝</span>
            Donate
          </button>
        </div>
      </div>
    </div>
  )
}
