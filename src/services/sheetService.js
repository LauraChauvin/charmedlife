// Source URL for Google Sheets CSV data
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-xYhLTBE31o3fcg-kghTOMwTIiy0vlIkHX8PoPkmcPKE1j4frp7kw6E0nmFNxG4oQ4Di9eJsnuduh/pub?output=csv"

/**
 * Parse CSV text into JSON objects
 * @param {string} csvText Raw CSV string
 * @returns {Array} Array of message objects
 */
export function parseCsvToJson(csvText) {
  const lines = csvText.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim())
  const messages = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim())
    if (values.length >= headers.length) {
      const message = {}
      headers.forEach((header, index) => {
        message[header] = values[index] || ''
      })
      messages.push(message)
    }
  }
  
  return messages
}

/**
 * Fetch the live spreadsheet data
 * @returns {Promise<Array>} Promise resolving to an array of message objects
 */
export async function fetchSheetData() {
  try {
    const response = await fetch(SHEET_URL)
    const csvText = await response.text()
    const messages = parseCsvToJson(csvText)
    return messages
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error)
    throw error
  }
}

/**
 * Detect media type from the Type field
 * @param {string} typeValue Row.Type value from the sheet
 * @returns {string} Either 'image' or 'video'
 */
function getMediaType(typeValue) {
  const lowercaseType = typeValue.toLowerCase()
  if (lowercaseType.includes('video')) return 'video'
  return 'image'
}

/**
 * Check if a date string matches today's date (US EST)
 * @param {string} dateStr Date string in YYYY-MM-DD format 
 * @returns {boolean}
 */
function isToday(dateStr) {
  try {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0] // YYYY-MM-DD format
    return dateStr === todayStr
  } catch (error) {
    return false
  }
}

/**
 * Get day of year for rotation fallback
 * @returns {number} Day of year (1-365/366)
 */
function getDayOfYear() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now - start
  const oneDay = 1000 * 60 * 60 * 24
  return Math.floor(diff / oneDay)
}

/**
 * Load daily message from live Google Sheet
 * 1. Try exact date match first
 * 2. Fall back to rotation based on day of year
 * 3. Provide fallback if data fails
 * @returns {Promise<Object>} Message object with normalized fields
 */
export async function getDailyMessage() {
  try {
    const messages = await fetchSheetData()
    
    if (!messages || messages.length === 0) {
      throw new Error('No messages found in spreadsheet')
    }
    
    // 1. Try to match today's exact date in US EST
    const todayMessage = messages.find(row => isToday(row.Date))
    if (todayMessage) {
      return mapMessageToTemplate(todayMessage)
    }
    
    // 2. Otherwise, rotate based on day of year
    const dayOfYear = getDayOfYear()
    const rotationIndex = dayOfYear % messages.length
    const rotatingMessage = messages[rotationIndex]
    
    return mapMessageToTemplate(rotatingMessage)
    
  } catch (error) {
    console.error('Error in getDailyMessage:', error)
    // Fallback to hardcoded message
    return mapMessageToTemplate({
      Date: new Date().toISOString().split('T')[0],
      Type: 'Daily Message',
      Title: 'Inspiration for Today',
      Message: 'Sometimes the best days start with a simple moment of inspiration.',
      MediaURL: '/chimp.png',
      CTA: 'Visit Our Site',
      Link: 'https://www.FootForwardFund.org'
    })
  }
}

/**
 * Map Google Sheets row data to MessageCard props
 * @param {Object} row Raw row data from spreadsheet
 * @returns {Object} Normalized message object for the MessageCard component
 */
function mapMessageToTemplate(row) {
  // Don't use "Add text over image" as accent text
  const getAccentText = (type) => {
    if (!type) return 'Purpose'
    if (type.toLowerCase().includes('add text over image')) return 'Inspiration'
    if (type.toLowerCase().includes('video')) return 'Daily Focus'
    return type
  }

  return {
    title: row.Title || 'Daily Inspiration',
    message: row.Message || 'Sometimes the best days start with a simple moment of inspiration.',
    mediaType: getMediaType(row.Type || 'image'),
    mediaUrl: row.MediaURL || '/chimp.png',
    mediaAlt: row.Title || 'Daily inspiration media',
    ctaText: row.CTA || '',
    onCtaClick: row.Link ? () => window.open(row.Link, '_blank', 'noopener,noreferrer') : null,
    accent: getAccentText(row.Type)
  }
}
