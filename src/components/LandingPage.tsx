import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import MessageCard from './MessageCard'
import Footer from './Footer'
import TokenDebugger from './TokenDebugger'
import { fetchSheetData, getDailyMessage, getMessageByToken } from '../services/sheetService'

interface DailyMessage {
  title: string
  message: string
  mediaUrl: string
  mediaType: string
  ctaText: string
  ctaLink: string
  link: string
  hasActualCtaData?: boolean
  externalLink?: string
  type?: string
  token?: string
}

export default function LandingPage() {
  const { token } = useParams<{ token: string }>()
  const [dailyMessage, setDailyMessage] = useState<DailyMessage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Log token information for analytics
  useEffect(() => {
    if (token) {
      console.log('Token received:', token)
    }
  }, [token])

  // Track the current day to auto-refresh when day changes
  const [currentDay, setCurrentDay] = useState(() => {
    const now = new Date()
    return new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' })).toDateString()
  })

  // Refresh function to test live updates - wrapped in useCallback to avoid dependency issues
  const refreshMessage = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      let message: DailyMessage
      
      if (token) {
        // Fetch message by token
        message = await getMessageByToken(token)
      } else {
        // Fetch today's message (fallback for no token)
        message = await getDailyMessage()
      }
      
      setDailyMessage(message)
      setLastUpdated(new Date())
      setLoading(false)
      
      // Dispatch custom event for debug overlay
      if (process.env.NODE_ENV === 'development') {
        window.dispatchEvent(new CustomEvent('messageUpdate', {
          detail: {
            title: message.title,
            message: message.message,
            token: token
          }
        }))
      }
    } catch (err) {
      console.error('Error refreshing message:', err)
      setError('Unable to refresh message. Please try again.')
      setLoading(false)
    }
  }, [token])

  // Check if day has changed and refresh if needed - optimized for midnight detection
  useEffect(() => {
    const checkDayChange = async () => {
      const now = new Date()
      const easternNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
      const today = easternNow.toDateString()
      const todayISO = easternNow.toISOString().split('T')[0]
      const hours = easternNow.getHours()
      const minutes = easternNow.getMinutes()
      const seconds = easternNow.getSeconds()
      
      // Check if we're near midnight (within 5 minutes before or after)
      const isNearMidnight = (hours === 23 && minutes >= 55) || (hours === 0 && minutes <= 5)
      
      console.log('⏰ Day check:', {
        currentDay,
        today,
        todayISO,
        changed: today !== currentDay,
        easternTime: easternNow.toISOString(),
        time: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
        nearMidnight: isNearMidnight
      })
      
      if (today !== currentDay) {
        console.log('🔄 DAY CHANGED AT MIDNIGHT! Refreshing message...', { 
          oldDay: currentDay, 
          newDay: today,
          oldDayISO: currentDay,
          newDayISO: todayISO,
          time: `${hours}:${minutes}:${seconds}`
        })
        setCurrentDay(today)
        // Force immediate refresh
        await refreshMessage()
      }
    }

    // Check immediately
    checkDayChange()

    // Check more frequently near midnight, less frequently during day
    // Near midnight (11:55 PM - 12:05 AM): check every 10 seconds
    // During day: check every minute
    const getCheckInterval = () => {
      const now = new Date()
      const easternNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
      const hours = easternNow.getHours()
      const minutes = easternNow.getMinutes()
      const isNearMidnight = (hours === 23 && minutes >= 55) || (hours === 0 && minutes <= 5)
      return isNearMidnight ? 10000 : 60000 // 10 seconds near midnight, 1 minute otherwise
    }

    // Set up interval with dynamic checking
    let interval = setInterval(() => {
      checkDayChange()
      // Recalculate interval every hour
      clearInterval(interval)
      const newInterval = getCheckInterval()
      interval = setInterval(checkDayChange, newInterval)
    }, getCheckInterval())
    
    return () => clearInterval(interval)
  }, [currentDay, token, refreshMessage])

  useEffect(() => {
    const loadMessage = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Force cache clear on every load
        console.log('🔄 Loading message (forced refresh)...', {
          timestamp: new Date().toISOString(),
          token: token,
          currentDay: currentDay
        })
        
        let message: DailyMessage
        
        if (token) {
          // Fetch message by token
          message = await getMessageByToken(token)
        } else {
          // Fetch today's message (fallback for no token)
          message = await getDailyMessage()
        }
        
        console.log('✅ Message loaded:', {
          title: message.title,
          timestamp: new Date().toISOString()
        })
        
        setDailyMessage(message)
        setLastUpdated(new Date())
        setLoading(false)
        
        // Dispatch custom event for debug overlay
        if (process.env.NODE_ENV === 'development') {
          window.dispatchEvent(new CustomEvent('messageUpdate', {
            detail: {
              title: message.title,
              message: message.message,
              token: token
            }
          }))
        }
      } catch (err) {
        console.error('❌ Error loading message:', err)
        setError('Unable to load message from Google Sheets. Please check your internet connection and try again later.')
        
        // Fallback message if sheet loading fails
        const fallbackMessage = token ? {
          title: 'Charm Not Yet Active',
          message: '✨ This charm is not yet active. Please contact support if you believe this is an error.',
          mediaUrl: '/defaultimage.png',
          mediaType: 'image',
          ctaText: 'Contact Support',
          ctaLink: 'https://www.FootForwardFund.org',
          link: 'https://www.FootForwardFund.org',
          hasActualCtaData: true,
          token: token
        } : {
          title: 'Inspiration for Today',
          message: 'Sometimes the best days start with a simple moment of inspiration.',
          mediaUrl: '/2.svg',
          mediaType: 'image',
          ctaText: 'Visit Our Site',
          ctaLink: 'https://www.FootForwardFund.org',
          link: 'https://www.FootForwardFund.org',
          hasActualCtaData: true
        }
        
        setDailyMessage(fallbackMessage)
        setLoading(false)
      }
    }

    // Small delay to ensure state is ready, then load
    const timeoutId = setTimeout(() => {
      loadMessage()
    }, 100)
    
    return () => clearTimeout(timeoutId)
  }, [token, currentDay]) // Add currentDay as dependency so it refreshes when day changes

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-50 safe-area-inset bg-white">
      {/* Sophisticated Header */}
      <header className="flex justify-center py-12 sm:py-16 bg-gradient-to-r from-white/95 via-blue-50/95 to-indigo-50/95 backdrop-blur-xl shadow-lg border-b border-white/20 sticky top-0 z-30">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-indigo-600/20 rounded-2xl blur-xl"></div>
            <img 
              src="/logo-blue.png" 
              alt="Charmed Life" 
              className="relative h-32 sm:h-40 w-auto object-contain animate-fade-in"
            />
          </div>
          <div className="text-center space-y-2">
            <div className="text-lg text-indigo-600 font-bold tracking-wider uppercase">
              Charmed Life
            </div>
            <div className="text-sm text-gray-500 font-light tracking-wider max-w-xs">
              Empowering communities through purposeful connections
            </div>
          </div>
        </div>
      </header>

      {/* Refresh Button for Testing Live Updates */}
      <div className="flex justify-center py-4 bg-white/50 backdrop-blur-sm">
        <button
          onClick={refreshMessage}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
        >
          <svg className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {loading ? 'Refreshing...' : 'Refresh Message'}
        </button>
        {lastUpdated && (
          <span className="ml-4 text-sm text-gray-500 self-center">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Professional Main Content */}
      <main className="flex-1 px-0 sm:px-4 lg:px-8 py-0 sm:py-10 max-w-4xl mx-auto w-full min-h-0">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg"></div>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-6 leading-tight">
            Daily Inspiration
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Discover your daily dose of empowerment and purpose
          </p>
        </div>
        
        {loading ? (
          <div className="flex flex-col justify-center items-center py-24">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/10 to-transparent"></div>
            </div>
            <p className="text-gray-600 mt-8 text-lg font-medium animate-fade-in">
              Preparing today's empowerment message...
            </p>
          </div>
        ) : error ? (
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-red-100 bg-gradient-to-br from-white to-red-50/30">
            <p className="text-red-600 text-center mb-6 text-lg">{error}</p>
            {dailyMessage && <MessageCard 
              title={dailyMessage.title}
              message={dailyMessage.message}
              mediaUrl={dailyMessage.mediaUrl}
              mediaType={dailyMessage.mediaType}
              ctaText={dailyMessage.ctaText}
              ctaLink={dailyMessage.ctaLink}
              link={dailyMessage.link}
              hasActualCtaData={dailyMessage.hasActualCtaData}
              externalLink={dailyMessage.externalLink}
              type={dailyMessage.type}
              token={token} 
            />}
          </div>
        ) : (
          dailyMessage && <MessageCard 
            title={dailyMessage.title}
            message={dailyMessage.message}
            mediaUrl={dailyMessage.mediaUrl}
            mediaType={dailyMessage.mediaType}
            ctaText={dailyMessage.ctaText}
            ctaLink={dailyMessage.ctaLink}
            link={dailyMessage.link}
            hasActualCtaData={dailyMessage.hasActualCtaData}
            externalLink={dailyMessage.externalLink}
            type={dailyMessage.type}
            token={token} 
          />
        )}
      </main>

      {/* Footer */}
      <Footer />
      
      {/* Token Debugger (development only) */}
      <TokenDebugger />
    </div>
  )
}
