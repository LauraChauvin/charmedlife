export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-6">
      <div className="max-w-md mx-auto px-4 text-center space-y-4">
        {/* Social Links */}
        <div className="flex justify-center space-x-6">
          <a 
            href="https://www.FootForwardFund.org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-brand hover:text-brand/80 transition-colors"
          >
            🌐 Main Site
          </a>
          <a 
            href="https://www.instagram.com/herbestfoot/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-brand hover:text-brand/80 transition-colors"
          >
            📱 Instagram
          </a>
          <a 
            href="https://www.facebook.com/HerBestFoot" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-brand hover:text-brand/80 transition-colors"
          >
            👥 Facebook
          </a>
        </div>

        {/* Copyright */}
        <p className="text-sm text-gray-500">
          © 2024 FootForward Fund. Spreading inspiration one day at a time.
        </p>
      </div>
    </footer>
  )
}
