// Service to fetch data from Google Sheets
export interface SheetRow {
  Date: string
  Type: string
  Title: string
  Message: string
  MediaURL: string
  CTA: string
  Link: string
}

export interface DailyMessage {
  date: string
  type: string
  title: string
  message: string
  mediaURL: string
  cta: string
  link: string
}

const SHEET_ID = '1iD1MrIuXdA4cqIv-jwvv5Qxc8HHro2bKntRuVKuU88Q'
const SHEET_RANGE = 'A:G'

// Convert Google Sheets API format to our internal format
export function convertSheetRow(row: any[]): DailyMessage {
  return {
    date: row[0] || '',
    type: row[1] || '',
    title: row[2] || '',
    message: row[3] || '',
    mediaURL: row[4] || '',
    cta: row[5] || '',
    link: row[6] || ''
  }
}

// Fetch data from Netlify function which gets live data from Google Sheets
export async function fetchSheetData(): Promise<DailyMessage[]> {
  try {
    console.log('Fetching live data from Netlify function...')
    
    const timestamp = Date.now()
    const response = await fetch(`/.netlify/functions/fetchMessages?t=${timestamp}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    
    if (data.error) {
      console.warn('Function returned error:', data.error)
      return getFallbackMessages()
    }
    
    const messages = data.messages || []
    console.log('Live messages fetched:', messages.length)
      
    if (messages.length > 0) {
      return messages
    }
    
    console.log('No live data found, using fallback')
    return getFallbackMessages()
    
  } catch (error) {
    console.error('Error fetching live data:', error)
    console.log('Falling back to sample data...')
    return getFallbackMessages()
  }
}

// Provide fallback messages in case the sheet can't be accessed
function getFallbackMessages(): DailyMessage[] {
  const today = new Date().toISOString().split('T')[0]
  
  return [
    {
      date: today,
      type: 'Add text over image',
      title: 'Today\'s Courage',
      message: 'Your journey begins with a single step of courage. Every challenge you face is an opportunity to grow and discover your inner strength.',
      mediaURL: '/chimp.png',
      cta: 'Start Your Journey',
      link: 'https://www.FootForwardFund.org'
    },
    {
      date: '',
      type: 'Add text over image',
      title: 'Believe & Achieve',
      message: 'Every day brings new opportunities for growth and connection. Trust the process and believe in your infinite potential.',
      mediaURL: '/chimp.png',
      cta: 'Get Inspired',
      link: 'https://www.FootForwardFund.org'
    },
    {
      date: '',
      type: 'Add text over image',
      title: 'Resilience Rising',
      message: 'You have everything you need to overcome today\'s challenges. Strength isn\'t found in perfection, but in the ability to keep moving forward.',
      mediaURL: '/chimp.png',
      cta: 'Find Your Support',
      link: 'https://www.FootForwardFund.org'
    }
  ]
}

// Enhanced CSV parser to handle quoted fields with commas
function parseCSV(csv: string): string[][] {
  const rows: string[][] = []
  const lines = csv.split('\n')
  
  for (const line of lines) {
    if (line.trim()) {
      const row = parseCSVLine(line.trim())
      if (row.length >= 6) { // Ensure we have minimum required columns
        rows.push(row)
      }
    }
  }
  
  return rows
}

// Parse individual CSV line with quoted fields
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  let i = 0
  
  while (i < line.length) {
    const char = line[i]
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"'
        i += 2
        continue
      }
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
    i++
  }
  
  result.push(current.trim())
  return result.map(cell => cell.replace(/^"|"$/g, '')) // Remove surrounding quotes
}

// Get the appropriate message for today using exact logic requirements
export function getTodaysMessage(messages: DailyMessage[]): DailyMessage {
  const now = new Date()
  // Get current date in US EST timezone
  const todayEST = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }))
  const todayStr = todayEST.toISOString().split('T')[0]
  
  console.log('Checking for today\'s message - Date:', todayStr)
  
  // Primary logic: If a row has a Date that matches today (timezone = US EST), display that row
  const todaysMessage = messages.find(msg => {
    if (!msg.date || msg.date.trim() === '') return false
    
    // Try various date formats
    const dateVariants = [
      msg.date.trim(),
      new Date(msg.date.trim()).toISOString().split('T')[0],
      msg.date.trim().replace(/\//g, '-'),
      msg.date.trim().replace(/-/g, '/')
    ]
    
    return dateVariants.some(variant => {
      try {
        const msgDate = new Date(variant)
        return msgDate.toISOString().split('T')[0] === todayStr
      } catch {
        return false
      }
    })
  })
  
  if (todaysMessage) {
    console.log('Found message for today\'s date:', todaysMessage.title)
    return todaysMessage
  }
  
  // Secondary logic: If no Date match, rotate rows by day index (use day of month)
  const dayOfMonth = todayEST.getDate()
  const messagePool = messages.filter(msg => !msg.date || msg.date.trim() === '')
  
  if (messagePool.length > 0) {
    const selectedMessage = messagePool[dayOfMonth % messagePool.length]
    console.log('Using rotation logic - day of month:', dayOfMonth, 'Selected message:', selectedMessage.title)
    return selectedMessage
  }
  
  // Final fallback
  console.log('Using fallback message')
  return messages[0] || {
    date: todayStr,
    type: 'Add text over image',
    title: 'Inspiration for Today',
    message: 'Something amazing is waiting for you ahead.',
    mediaURL: '/chimp.png', // Default is chimp.png as specified
    cta: 'Learn More',
    link: 'https://www.FootForwardFund.org'
  }
}
