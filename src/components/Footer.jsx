import { useState, useEffect } from "react"

export function Footer() {
  const [isVisible, setIsVisible] = useState(false)
  const [buttonText, setButtonText] = useState('Get to Know Her Best Foot Forward')
  const year = new Date().getFullYear()

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const day = new Date().getDate()
    if (day === 2 || day === 16) {
      setButtonText('Support the Cause')
    } else {
      setButtonText('Get to Know Her Best Foot Forward')
    }
  }, [])

  return (
    <footer 
      className={`
        bg-[#1e4395] py-12 px-6 mt-16 w-full bg-gradient-to-r from-[#1e4395] to-blue-700
        transition-all duration-700 ease-out
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}
    >
      <div className="w-full max-w-6xl mx-auto px-4">
        {/* Dynamic Button */}
        <div className="text-center mb-12">
          <button
            onClick={() => window.open('https://www.footforwardfund.org', '_blank', 'noopener,noreferrer')}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white py-4 px-8 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-emerald-500/20 flex items-center justify-center mx-auto font-glacial"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {buttonText}
          </button>
        </div>

        {/* Enhanced Navigation Links - Mobile Responsive with No Stacking */}
        <div className="flex flex-row justify-center items-center gap-2 sm:gap-6 lg:gap-8 mb-8 min-h-[120px] pt-2 overflow-x-auto">
          <a
            href="https://www.HerBestFootForward.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center hover:bg-white/10 rounded-xl p-2 sm:p-4 transition-all duration-300 ease-out flex-shrink-0 min-w-[80px] sm:min-w-0 transform hover:-translate-y-1"
          >
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-[#F1C40F] group-hover:text-[#1e4395] transition-all duration-300 ease-out mb-2 sm:mb-3 transform group-hover:scale-110">
              <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <span className="text-white/90 group-hover:text-white font-medium text-xs sm:text-base text-center transition-colors duration-300">SHOP</span>
          </a>

          <a
            href="https://www.zeffy.com/en-US/donation-form/04d493f1-f023-408d-a6fd-382a71245066"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center hover:bg-white/10 rounded-xl p-2 sm:p-4 transition-all duration-300 ease-out flex-shrink-0 min-w-[80px] sm:min-w-0 transform hover:-translate-y-1"
          >
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-[#F1C40F] group-hover:text-[#1e4395] transition-all duration-300 ease-out mb-2 sm:mb-3 transform group-hover:scale-110">
              <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-white/90 group-hover:text-white font-medium text-xs sm:text-base text-center transition-colors duration-300">GIVE</span>
          </a>

          <a
            href="https://www.instagram.com/herbestfoot/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center hover:bg-white/10 rounded-xl p-2 sm:p-4 transition-all duration-300 ease-out flex-shrink-0 min-w-[80px] sm:min-w-0 transform hover:-translate-y-1"
          >
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-[#F1C40F] group-hover:text-[#1e4395] transition-all duration-300 ease-out mb-2 sm:mb-3 transform group-hover:scale-110">
              <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.073-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
            <span className="text-white/90 group-hover:text-white font-medium text-xs sm:text-base text-center transition-colors duration-300">Instagram</span>
          </a>

          <a
            href="https://www.facebook.com/HerBestFoot"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center hover:bg-white/10 rounded-xl p-2 sm:p-4 transition-all duration-300 ease-out flex-shrink-0 min-w-[80px] sm:min-w-0 transform hover:-translate-y-1"
          >
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-[#F1C40F] group-hover:text-[#1e4395] transition-all duration-300 ease-out mb-2 sm:mb-3 transform group-hover:scale-110">
              <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
            <span className="text-white/90 group-hover:text-white font-medium text-xs sm:text-base text-center transition-colors duration-300">Facebook</span>
          </a>
        </div>

        {/* Sophisticated Copyright Section */}
        <div className="border-t border-white/20 pt-6 text-center">
          <p className="text-white/70 text-sm font-medium">© {year} Her Best Foot Forward</p>
          <p className="text-white/60 text-xs mt-2 font-light">Spreading inspiration one day at a time 💙</p>
        </div>
      </div>
    </footer>
  )
}
