// Source URL for Google Sheets CSV data
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-xYhLTBE31o3fcg-kghTOMwTIiy0vlIkHX8PoPkmcPKE1j4frp7kw6E0nmFNxG4oQ4Di9eJsnuduh/pub?output=csv"

/**
 * Parse CSV text into JSON objects with proper handling of quoted fields
 * @param {string} csvText Raw CSV string
 * @returns {Array} Array of message objects
 */
export function parseCsvToJson(csvText) {
  const lines = csvText.trim().split('\n')
  if (lines.length < 2) return []
  
  // Parse headers with proper CSV handling
  const headers = parseCsvLine(lines[0])
  const messages = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i])
    if (values.length >= 3) { // Minimum required fields
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
 * Parse a single CSV line handling quoted fields properly
 * @param {string} line CSV line
 * @returns {Array} Array of field values
 */
function parseCsvLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current.trim())
  return result
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
    console.log('Fetching data from Google Sheets...')
    const messages = await fetchSheetData()
    console.log('Raw messages from sheet:', messages.length, 'messages found')
    
    if (!messages || messages.length === 0) {
      throw new Error('No messages found in spreadsheet')
    }
    
    // Filter out messages without titles
    const validMessages = messages.filter(msg => {
      const title = msg['Title/Headline (if applicable)'] || msg['Title / Quote'] || msg['Title'] || msg['Headline']
      return title && title.trim() !== ''
    })
    
    console.log('Valid messages with titles:', validMessages.length)
    
    if (validMessages.length === 0) {
      throw new Error('No valid messages found')
    }
    
    // 1. Try to match today's exact date in US EST
    const todayMessage = validMessages.find(row => isToday(row.Date))
    if (todayMessage) {
      console.log('Found message for today:', todayMessage)
      return mapMessageToTemplate(todayMessage)
    }
    
    // 2. Otherwise, rotate based on day of year
    const dayOfYear = getDayOfYear()
    const rotationIndex = dayOfYear % validMessages.length
    const rotatingMessage = validMessages[rotationIndex]
    
    console.log('Using rotating message for day', dayOfYear, ':', rotatingMessage)
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
  // Map various possible column names to our expected fields
  const title = row['Title/Headline (if applicable)'] || row['Title / Quote'] || row['Title'] || row['Headline'] || 'Daily Inspiration'
  const message = row['Message'] || row['Quote'] || row['Text'] || 'Sometimes the best days start with a simple moment of inspiration.'
  const mediaUrl = row['Image/Video Link'] || row['MediaURL'] || row['Media URL'] || row['Image Link'] || '/chimp.png'
  const mediaType = row['Type'] || row['Media Type'] || 'image'
  const ctaText = row['CTA'] || row['Call to Action'] || row['Button Text'] || ''
  const ctaLink = row['Link'] || row['CTA Link'] || row['Button Link'] || ''
  
  // Convert Google Drive URLs to direct image URLs
  const processedMediaUrl = convertGoogleDriveUrl(mediaUrl)
  
  return {
    title: title,
    message: message,
    mediaType: getMediaType(mediaType),
    mediaUrl: processedMediaUrl,
    mediaAlt: title,
    ctaText: ctaText,
    ctaLink: ctaLink,
    link: ctaLink, // Use ctaLink as the main link for now
    accent: 'Daily Inspiration'
  }
}

/**
 * Convert Google Drive file URLs to direct image URLs
 * @param {string} url Original URL
 * @returns {string} Converted URL
 */
function convertGoogleDriveUrl(url) {
  if (!url || url === '/chimp.png') return '/chimp.png'
  
  // If it's already a direct image URL, return as-is
  if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
    return url
  }
  
  // If it's a YouTube URL, return as-is
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return url
  }
  
  // Convert Google Drive file view URL to direct image URL
  if (url.includes('drive.google.com/file/d/')) {
    const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/)
    if (fileIdMatch) {
      return `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`
    }
  }
  
  // If it's already a direct Google Drive image URL, return as-is
  if (url.includes('uc?export=view')) {
    return url
  }
  
  // Fallback to chimp.png for any other URLs
  return '/chimp.png'
}
