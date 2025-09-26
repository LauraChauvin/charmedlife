export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-brand to-blue-700 text-white mt-auto">
      <div className="max-w-lg mx-auto px-6 py-12 space-y-8">
        {/* Social Links - Enhanced Design */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <a 
            href="https://www.FootForwardFund.org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex flex-col items-center p-4 rounded-2xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 transform hover:scale-105 touch-feedback"
          >
            <div className="text-2xl mb-2 group-hover:animate-float">🌐</div>
            <div className="font-semibold text-white/90">Main Site</div>
            <div className="text-xs text-white/70 mt-1">Learn More</div>
          </a>
          
          <a 
            href="https://www.instagram.com/herbestfoot/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex flex-col items-center p-4 rounded-2xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 transform hover:scale-105 touch-feedback"
          >
            <div className="text-2xl mb-2 group-hover:animate-float">📱</div>
            <div className="font-semibold text-white/90">Instagram</div>
            <div className="text-xs text-white/70 mt-1">Follow Us</div>
          </a>
          
          <a 
            href="https://www.facebook.com/HerBestFoot" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex flex-col items-center p-4 rounded-2xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 transform hover:scale-105 touch-feedback"
          >
            <div className="text-2xl mb-2 group-hover:animate-float">👥</div>
            <div className="font-semibold text-white/90">Facebook</div>
            <div className="text-xs text-white/70 mt-1">Connect</div>
          </a>
        </div>

        {/* Enhanced Copyright Section */}
        <div className="text-center pt-6 border-t border-white/20">
          <p className="text-sm text-white/80 mb-2">
            © 2024 FootForward Fund
          </p>
          <p className="text-xs text-white/60 font-script">
            Spreading inspiration one day at a time 💙
          </p>
        </div>
      </div>
    </footer>
  )
}
