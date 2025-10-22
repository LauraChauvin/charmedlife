import { useState, useEffect } from 'react'
import { Header } from './components/Header'
import MessageCard from './components/MessageCard'
import { Footer } from './components/Footer'
import { getDailyMessage } from './services/sheetService'
import './index.css'

function App() {
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadDailyMessage = async () => {
      const startTime = Date.now()
      const minimumLoadingTime = 2500 // 2.5 seconds minimum
      
      try {
        setLoading(true)
        setError(null)
        const dailyMessage = await getDailyMessage()
        // console.log('Fetched daily message:', dailyMessage)
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
          ctaText: "Visit Our Site",
          ctaLink: "https://www.FootForwardFund.org",
          accent: "Purpose"
        })
      } finally {
        // Ensure loading screen is visible for at least minimumLoadingTime
        const elapsedTime = Date.now() - startTime
        const remainingTime = Math.max(0, minimumLoadingTime - elapsedTime)
        
        setTimeout(() => {
          setLoading(false)
        }, remainingTime)
      }
    }

    loadDailyMessage()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col relative overflow-hidden">
        {/* Animated Loading Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Lots of Flowing Strings for Loading */}
          <div className="absolute inset-0 opacity-50">
            {/* Horizontal Strings */}
            <div className="absolute top-1/6 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#1e4395] to-transparent" style={{animationDelay: '0s', animationDuration: '6s', animationName: 'flowLeft', animationIterationCount: 'infinite', animationTimingFunction: 'linear'}}></div>
            <div className="absolute top-1/4 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#1e4395]/80 to-transparent" style={{animationDelay: '1s', animationDuration: '8s', animationName: 'flowLeft', animationIterationCount: 'infinite', animationTimingFunction: 'linear'}}></div>
            <div className="absolute top-1/3 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#1e4395]/70 to-transparent" style={{animationDelay: '2s', animationDuration: '10s', animationName: 'flowLeft', animationIterationCount: 'infinite', animationTimingFunction: 'linear'}}></div>
            <div className="absolute top-2/5 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#1e4395]/90 to-transparent" style={{animationDelay: '0.5s', animationDuration: '7s', animationName: 'flowLeft', animationIterationCount: 'infinite', animationTimingFunction: 'linear'}}></div>
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#1e4395]/60 to-transparent" style={{animationDelay: '3s', animationDuration: '9s', animationName: 'flowLeft', animationIterationCount: 'infinite', animationTimingFunction: 'linear'}}></div>
            <div className="absolute top-3/5 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#1e4395]/75 to-transparent" style={{animationDelay: '1.5s', animationDuration: '11s', animationName: 'flowLeft', animationIterationCount: 'infinite', animationTimingFunction: 'linear'}}></div>
            <div className="absolute top-2/3 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#1e4395]/85 to-transparent" style={{animationDelay: '2.5s', animationDuration: '8.5s', animationName: 'flowLeft', animationIterationCount: 'infinite', animationTimingFunction: 'linear'}}></div>
            <div className="absolute top-3/4 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#1e4395]/55 to-transparent" style={{animationDelay: '4s', animationDuration: '12s', animationName: 'flowLeft', animationIterationCount: 'infinite', animationTimingFunction: 'linear'}}></div>
            <div className="absolute top-4/5 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#1e4395]/65 to-transparent" style={{animationDelay: '0.8s', animationDuration: '9.5s', animationName: 'flowLeft', animationIterationCount: 'infinite', animationTimingFunction: 'linear'}}></div>
            
            {/* Curved Threads */}
            <div className="absolute top-1/8 left-0 w-2/3 h-1 bg-gradient-to-r from-transparent via-[#F1C40F]/60 to-transparent" style={{animationDelay: '1.2s', animationDuration: '10.5s', animationName: 'flowCurve', animationIterationCount: 'infinite', animationTimingFunction: 'linear'}}></div>
            <div className="absolute top-1/7 left-1/3 w-2/3 h-1 bg-gradient-to-r from-transparent via-[#F1C40F]/70 to-transparent" style={{animationDelay: '3.2s', animationDuration: '8.8s', animationName: 'flowCurve', animationIterationCount: 'infinite', animationTimingFunction: 'linear'}}></div>
            <div className="absolute top-2/7 left-0 w-1/2 h-1 bg-gradient-to-r from-transparent via-[#F1C40F]/50 to-transparent" style={{animationDelay: '2.2s', animationDuration: '11.5s', animationName: 'flowCurve', animationIterationCount: 'infinite', animationTimingFunction: 'linear'}}></div>
            <div className="absolute top-5/7 left-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-[#F1C40F]/65 to-transparent" style={{animationDelay: '4.2s', animationDuration: '9.2s', animationName: 'flowCurve', animationIterationCount: 'infinite', animationTimingFunction: 'linear'}}></div>
            
            {/* Floating Dots instead of problematic SVGs */}
            <div className="absolute top-1/5 left-1/6 w-3 h-3 bg-[#1e4395] rounded-full opacity-20 animate-float"></div>
            <div className="absolute top-1/3 right-1/5 w-2 h-2 bg-[#1e4395] rounded-full opacity-25 animate-float" style={{animationDelay: '1.5s'}}></div>
            <div className="absolute top-2/5 left-1/3 w-2.5 h-2.5 bg-[#F1C40F] rounded-full opacity-22 animate-float" style={{animationDelay: '3s'}}></div>
            <div className="absolute top-3/5 right-1/3 w-2 h-2 bg-[#F1C40F] rounded-full opacity-18 animate-float" style={{animationDelay: '2s'}}></div>
          </div>
        </div>

        {/* Loading Content */}
        <div className="flex-1 flex flex-col items-center justify-center relative z-10">
          {/* Logo with Animation */}
          <div className="mb-8 animate-pulse">
            <img 
              src="/logo-blue.png" 
              alt="Charmed Life" 
              className="h-24 w-auto object-contain drop-shadow-lg"
            />
          </div>
          
          {/* Loading Text */}
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-[#1e4395] font-glacial">Charmed Life</h2>
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#1e4395]/30 border-t-[#1e4395]"></div>
              <p className="text-gray-600 font-medium font-glacial">Loading today's inspiration...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col relative overflow-hidden safe-area-inset">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Flowing Strings/Threads */}
        <div className="absolute inset-0 opacity-40">
          {/* String 1 */}
          <div className="absolute top-1/4 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#1e4395] to-transparent" style={{animationDelay: '0s', animationDuration: '8s', animationName: 'flowLeft', animationIterationCount: 'infinite', animationTimingFunction: 'linear'}}></div>
          
          {/* String 2 */}
          <div className="absolute top-1/3 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#1e4395]/80 to-transparent" style={{animationDelay: '2s', animationDuration: '12s', animationName: 'flowLeft', animationIterationCount: 'infinite', animationTimingFunction: 'linear'}}></div>
          
          {/* String 3 */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#1e4395]/70 to-transparent" style={{animationDelay: '4s', animationDuration: '10s', animationName: 'flowLeft', animationIterationCount: 'infinite', animationTimingFunction: 'linear'}}></div>
          
          {/* String 4 */}
          <div className="absolute top-2/3 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#1e4395]/75 to-transparent" style={{animationDelay: '6s', animationDuration: '14s', animationName: 'flowLeft', animationIterationCount: 'infinite', animationTimingFunction: 'linear'}}></div>
          
          {/* String 5 */}
          <div className="absolute top-3/4 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#1e4395]/60 to-transparent" style={{animationDelay: '1s', animationDuration: '9s', animationName: 'flowLeft', animationIterationCount: 'infinite', animationTimingFunction: 'linear'}}></div>
          
          {/* Curved Threads */}
          <div className="absolute top-1/5 left-0 w-1/2 h-1 bg-gradient-to-r from-transparent via-[#F1C40F]/50 to-transparent" style={{animationDelay: '3s', animationDuration: '11s', animationName: 'flowCurve', animationIterationCount: 'infinite', animationTimingFunction: 'linear'}}></div>
          <div className="absolute top-3/5 left-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-[#F1C40F]/60 to-transparent" style={{animationDelay: '7s', animationDuration: '13s', animationName: 'flowCurve', animationIterationCount: 'infinite', animationTimingFunction: 'linear'}}></div>
          
          {/* Floating Dots instead of problematic SVGs */}
          <div className="absolute top-1/6 left-1/4 w-3 h-3 bg-[#1e4395] rounded-full opacity-25 animate-float"></div>
          <div className="absolute top-2/3 right-1/4 w-2 h-2 bg-[#1e4395] rounded-full opacity-30 animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/4 right-1/3 w-2.5 h-2.5 bg-[#F1C40F] rounded-full opacity-28 animate-float" style={{animationDelay: '5s'}}></div>
        </div>
      </div>

      <Header />
      
      <main className="flex-1 flex py-0 sm:py-8 relative z-10 sm:items-center sm:justify-center sm:px-4">
        {message && (
          <MessageCard
            title={message.title}
            message={message.message}
            mediaType={message.mediaType}
            mediaUrl={message.mediaUrl}
            ctaText={message.ctaText}
            link={message.link}
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
