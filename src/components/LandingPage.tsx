import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import MessageCard from './MessageCard'
import Footer from './Footer'
import TokenDebugger from './TokenDebugger'
import { fetchSheetData, getTodaysMessage, DailyMessage } from '../services/sheetService'

export default function LandingPage() {
  const { token } = useParams<{ token: string }>()
  const [dailyMessage, setDailyMessage] = useState<DailyMessage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Log token information for analytics
  useEffect(() => {
    if (token) {
      console.log('LandingPage received token:', token)
      console.log('Token validation: Valid (all tokens accepted)')
    }
  }, [token])

  useEffect(() => {
    const loadTodayMessage = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch data from Google Sheets
        const messages = await fetchSheetData()
        
        // Get today's message based on the sheet data
        const todaysMessage = getTodaysMessage(messages)
        
        setDailyMessage(todaysMessage)
        setLoading(false)
      } catch (err) {
        console.error('Error loading message:', err)
        setError('Unable to load today\'s message from Google Sheets. Please check your internet connection and try again later.')
        
        // Fallback message if sheet loading fails
        setDailyMessage({
          date: new Date().toISOString().split('T')[0],
          type: 'Add text over image',
          title: 'Inspiration for Today',
          message: 'Sometimes the best days start with a simple moment of inspiration.',
          mediaURL: '/2.svg',
          cta: 'Visit Our Site',
          link: 'https://www.FootForwardFund.org'
        })
        setLoading(false)
      }
    }

    loadTodayMessage()
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-50 safe-area-inset bg-white">
      {/* Sophisticated Header */}
      <header className="flex justify-center py-12 sm:py-16 bg-gradient-to-r from-white/95 via-blue-50/95 to-indigo-50/95 backdrop-blur-xl shadow-lg border-b border-white/20 sticky top-0 z-30">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 to-indigo-600/20 rounded-2xl blur-xl"></div>
            <img 
              src="/logo-blue.png" 
              alt="FootForward Fund" 
              className="relative h-20 sm:h-24 w-auto object-contain animate-fade-in"
            />
          </div>
          <div className="text-center space-y-2">
            <div className="text-sm text-indigo-600 font-medium tracking-wider uppercase">
              FF Foundation
            </div>
            <div className="text-xs text-gray-500 font-light tracking-wider max-w-xs">
              Empowering communities through purposeful connections
            </div>
          </div>
        </div>
      </header>

      {/* Professional Main Content */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-10 sm:py-14 max-w-4xl mx-auto w-full min-h-0">
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
            {dailyMessage && <MessageCard message={dailyMessage} token={token} />}
          </div>
        ) : (
          dailyMessage && <MessageCard message={dailyMessage} token={token} />
        )}
      </main>

      {/* Footer */}
      <Footer />
      
      {/* Token Debugger (development only) */}
      <TokenDebugger />
    </div>
  )
}
