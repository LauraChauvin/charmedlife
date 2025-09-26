import { useState, useEffect } from "react"

export function Header() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <header className="flex justify-center items-center py-8 px-4 bg-white shadow-sm border-b border-gray-100">
      <div 
        className={`
          flex flex-col items-center space-y-3
          transition-all duration-700 ease-out
          ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
        `}
      >
        <img 
          src="/logo-blue.png" 
          alt="FootForward Fund" 
          className="h-12 w-auto object-contain hover:scale-105 transition-transform duration-300"
        />
      </div>
    </header>
  )
}
