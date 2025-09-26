import { useState, useEffect } from 'react'
import { Header } from './components/Header'
import { MessageCard } from './components/MessageCard'
import { Footer } from './components/Footer'
import { getDailyMessage } from './services/sheetService'
import './index.css'

interface Message {
  title: string
  message: string
  mediaType: string
  mediaUrl: string
  mediaAlt: string
  ctaText: string
  onCtaClick: () => void
  accent: string
}

function App() {
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<Message | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDailyMessage = async () => {
      try {
        setLoading(true)
        setError(null)
        const dailyMessage = await getDailyMessage()
        setMessage(dailyMessage)
      } catch (err) {
        console.error('Failed to load daily message:', err)
        setError('Unable to load today\'s message')
        // Set fallback message in case of error
        setMessage({
          title: "Inspiration for Today",
          message: "Sometimes the best days start with a simple moment of inspiration.",
          mediaType: "image",
          mediaUrl: "/chimp.png",
          mediaAlt: "Inspirational image",
          ctaText: "Visit Our Site",
          onCtaClick: () => window.open('https://www.FootForwardFund.org', '_blank', 'noopener,noreferrer'),
          accent: "Purpose"
        })
      } finally {
        setLoading(false)
      }
    }

    loadDailyMessage()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100 border-t-[#1e4395] mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading today's inspiration...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-8">
        {message && (
          <MessageCard
            title={message.title}
            message={message.message}
            mediaType={message.mediaType}
            mediaUrl={message.mediaUrl}
            mediaAlt={message.mediaAlt}
            ctaText={message.ctaText}
            onCtaClick={message.onCtaClick}
            accent={message.accent}
          />
        )}
        {error && (
          <div className="text-center text-red-600">
            <p>{error}</p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  )
}

export default App