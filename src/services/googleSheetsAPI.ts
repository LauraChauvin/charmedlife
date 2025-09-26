// Google Sheets API service for private sheet access
import { google } from 'googleapis'

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

// Fetch data using Google Sheets API (requires API key)
export async function fetchSheetDataWithAPI(apiKey: string): Promise<DailyMessage[]> {
  try {
    const sheets = google.sheets({ version: 'v4', auth: apiKey })
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: SHEET_RANGE,
    })

    const rows = response.data.values || []
    
    if (rows.length === 0) {
      throw new Error('No data found in the sheet')
    }

    // Filter and validate data
    const messages = rows.slice(1)
      .filter(row => row.length >= 6 && row.some(cell => cell.trim() !== ''))
      .map((row: any[]) => convertSheetRow(row))
      .filter(msg => msg.title.trim() !== '')
      
    return messages
    
  } catch (error) {
    console.error('Error fetching Google Sheets data with API:', error)
    throw error
  }
}

// Alternative: Use service account authentication (more secure)
export async function fetchSheetDataWithServiceAccount(serviceAccountKey: any): Promise<DailyMessage[]> {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccountKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    })

    const sheets = google.sheets({ version: 'v4', auth })
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: SHEET_RANGE,
    })

    const rows = response.data.values || []
    
    if (rows.length === 0) {
      throw new Error('No data found in the sheet')
    }

    // Filter and validate data
    const messages = rows.slice(1)
      .filter(row => row.length >= 6 && row.some(cell => cell.trim() !== ''))
      .map((row: any[]) => convertSheetRow(row))
      .filter(msg => msg.title.trim() !== '')
      
    return messages
    
  } catch (error) {
    console.error('Error fetching Google Sheets data with service account:', error)
    throw error
  }
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
