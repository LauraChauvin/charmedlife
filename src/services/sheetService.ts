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

// Fetch data from Google Sheets
export async function fetchSheetData(): Promise<DailyMessage[]> {
  try {
    // First try direct access to the sheet (works if published properly)
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`
    console.log('Attempting to fetch sheet from:', csvUrl)
    
    let response: Response
    
    try {
      response = await fetch(csvUrl, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'text/csv',
          'Cache-Control': 'no-cache'
        }
      })
    } catch (corsError) {
      console.warn('Direct access failed due to CORS, trying proxy...')
      
      // Use CORS proxy as fallback
      const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(csvUrl)
      response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/csv',
          'Cache-Control': 'no-cache'
        }
      })
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch sheet data: ${response.status} ${response.statusText}`)
    }
    
    const csvText = await response.text()
    console.log('Sheet data received, length:', csvText.length)
    
    // Check if we received valid CSV content
    if (csvText.trim().length === 0) {
      throw new Error('Empty CSV response - sheet may not be published')
    }
    
    const rows = parseCSV(csvText)
    console.log('Parsed rows from sheet:', rows.length)
    
    // Filter and validate data
    const messages = rows.slice(1)
      .filter(row => row.length >= 6 && row.some(cell => cell.trim() !== ''))
      .map((row: any[]) => convertSheetRow(row))
      .filter(msg => msg.title.trim() !== '') // Only return messages with titles
      
    console.log('Valid messages extracted:', messages.length)
      
    if (messages.length > 0) {
      return messages
    }
    
    throw new Error('No valid data found in the sheet')
    
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error)
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
      message: 'Your journey begins with a single step of courage. Every challenge you\u2028face is an opportunity to grow and discover your inner strength.',
      mediaURL: '/2.svg',
      cta: 'Start Your Journey',
      link: 'https://www.FootForwardFund.org'
    },
    {
      date: '',
      type: 'Add text over image',
      title: 'Believe & Achieve',
      message: 'Every day brings new opportunities for growth and connection.\u2029Trust the process and believe in your infinite potential.',
      mediaURL: '/3.svg',
      cta: 'Get Inspired',
      link: 'https://www.FootForwardFund.org'
    },
    {
      date: '',
      type: 'Add text over image',
      title: 'Resilience Rising',
      message: 'You have everything you need to overcome today\'s challenges.\u2029Strength isn\u2019t found in perfection, but in the ability to keep moving forward.',
      mediaURL: '/2.svg',
      cta: 'Find Your Support',
      link: 'https://www.FootForwardFund.org'
    },
    {
      date: '',
      type: 'Add text over image',
      title: 'Hope is Here',
      message: 'Even in the darkest moments, hope remains a constant companion.\u2029Watch how your perspective shifts when you choose to see possibilities.',
      mediaURL: '/3.svg',
      cta: 'Explore Hope',
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

// Get the appropriate message for today
export function getTodaysMessage(messages: DailyMessage[]): DailyMessage {
  const now = new Date()
  // Get current date in US EST timezone
  const todayStr = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" })).toISOString().split('T')[0]
  
  // Also check for slightly different date formats commonly used in sheets
  const formatDateVariants = (dateStr: string) => [
    dateStr, 
    new Date(dateStr).toISOString().split('T')[0], // Try parsing and reformatting
    dateStr.replace(/\//g, '-'), // Handle date formats like MM/DD/YYYY 
    dateStr.replace(/-/g, '/')   // Handle DD-MM-YYYY format
  ]
  
  // First, try to find an exact match for today's date
  const todaysMessage = messages.find(msg => {
    if (!msg.date || msg.date.trim() === '') return false
    
    const dateVariants = formatDateVariants(msg.date.trim())
    return dateVariants.some(variant => variant === todayStr)
  })
  
  if (todaysMessage) {
    return todaysMessage
  }
  
  // If no specific date match, rotation logic based on day of year
  // Using US EST timezone for consistent day counting
  const startOfYear = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }))
  startOfYear.setMonth(0, 1)
  startOfYear.setHours(0, 0, 0, 0)
  
  const todayEST = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }))
  const dayOfYear = Math.floor((todayEST.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24))
  
  // Filter messages that don't have dates (blank date column)
  const messagePool = messages.filter(msg => !msg.date || msg.date.trim() === '')
  
  if (messagePool.length > 0) {
    return messagePool[dayOfYear % messagePool.length]
  }
  
  // Fallback to first message
  return messages[0] || {
    date: todayStr,
    type: 'Add text over image',
    title: 'Inspiration for Today',
    message: 'Something amazing is waiting for you ahead.',
    mediaURL: '/2.svg',
    cta: 'Learn More',
    link: 'https://www.FootForwardFund.org'
  }
}
