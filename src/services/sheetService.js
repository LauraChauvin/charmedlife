// Local CSV data located in the public folder
const SHEET_FILENAME = 'Bracelet Content - Sheet1.csv'
const ABOUT_PAGE_URL = 'https://www.footforwardfund.org/about.html'
const GIVING_PAGE_URL = 'https://www.footforwardfund.org/give.html'
const LEARN_MORE_TEXT = 'Learn More'
const ABOUT_CTA_TEXT = 'Get to Know Her Best Foot Forward'

function getSheetUrl() {
  const baseUrl = import.meta.env?.BASE_URL ?? '/'
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  return `${normalizedBase}${encodeURI(SHEET_FILENAME)}`
}

function getEasternNow() {
  const now = new Date()
  return new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
}

function normalizeString(value) {
  if (typeof value !== 'string') return ''
  return value.trim().replace(/\\+$/, '')
}

function isGivingMessage(row) {
  const fieldsToCheck = [
    row['Type'],
    row['Title/Headline (if applicable)'],
    row['Body / Key Message (if applicable)'],
    row['External Link (if applicable)'],
    row['External Link']
  ]

  return fieldsToCheck.some(field => {
    const text = normalizeString(field)
    if (!text) return false
    return /(give|donat|support|charit)/i.test(text)
  })
}

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
 * @param {string} token Optional token for filtering messages
 * @returns {Promise<Array>} Promise resolving to an array of message objects
 */
export async function fetchSheetData(token) {
  try {
    const sheetUrl = getSheetUrl()
    const response = await fetch(sheetUrl, {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to load local sheet from ${sheetUrl}`)
    }

    const csvText = await response.text()
    const messages = parseCsvToJson(csvText)
    
    // If token is provided, filter messages by token
    if (token) {
      console.log('Filtering messages by token:', token)
      const tokenMessages = messages.filter(msg => msg.Token === token)
      console.log('Token-filtered messages found:', tokenMessages.length)
      return tokenMessages
    }
    
    return messages
  } catch (error) {
    console.error('Error fetching local sheet data:', error)
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
 * Check if a date string matches today's date (US Eastern Time)
 * @param {string} dateStr Date string in YYYY-MM-DD format 
 * @returns {boolean}
 */
function isToday(dateStr) {
  try {
    const easternTime = getEasternNow()
    const todayStr = easternTime.toISOString().split('T')[0] // YYYY-MM-DD format
    return dateStr === todayStr
  } catch (error) {
    return false
  }
}

/**
 * Get day of year for rotation fallback (US Eastern Time)
 * @returns {number} Day of year (1-365/366)
 */
function getDayOfYear() {
  const easternTime = getEasternNow()
  const start = new Date(easternTime.getFullYear(), 0, 0)
  const diff = easternTime - start
  const oneDay = 1000 * 60 * 60 * 24
  return Math.floor(diff / oneDay)
}

/**
 * Get a specific message by token
 * @param {string} token The token to search for
 * @returns {Promise<Object>} Message object with normalized fields
 */
export async function getMessageByToken(token) {
  try {
    console.log('Fetching message for token:', token)
    
    // Fetch all messages filtered by token
    const tokenMessages = await fetchSheetData(token)
    
    if (tokenMessages.length > 0) {
      console.log('Found message for token:', token, 'Title:', tokenMessages[0]['Title/Headline (if applicable)'])
      return mapMessageToTemplate(tokenMessages[0])
    }
    
    // No message found for this token
    console.warn('No message found for token:', token)
    return getTokenFallbackMessage(token)
    
  } catch (error) {
    console.error('Error fetching message by token:', error)
    return getTokenFallbackMessage(token)
  }
}

/**
 * Get fallback message for invalid/unknown tokens
 * @param {string} token The token that wasn't found
 * @returns {Object} Fallback message object
 */
function getTokenFallbackMessage(token) {
  console.log('Creating fallback message for token:', token)
  return mapMessageToTemplate({
    Date: new Date().toISOString().split('T')[0],
    Type: 'Add text over image',
    'Title/Headline (if applicable)': 'Charm Not Yet Active',
    'Body / Key Message (if applicable)': '✨ This charm is not yet active. Please contact support if you believe this is an error.',
    'Image/Video Link': '/chimp.png',
    'External Link CTA Messaging (if applicable)': 'Contact Support',
    'External Link (if applicable)': 'https://www.FootForwardFund.org',
    Token: token
  })
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
    console.log('Fetching daily message from Google Sheets...')
    const messages = await fetchSheetData()
    console.log('Found', messages.length, 'messages')
    
    if (!messages || messages.length === 0) {
      throw new Error('No messages found in spreadsheet')
    }
    
    // Filter out messages without titles
    const validMessages = messages.filter(msg => {
      const title =
        normalizeString(msg['Title/Headline (if applicable)']) ||
        normalizeString(msg['Title / Quote']) ||
        normalizeString(msg['Title']) ||
        normalizeString(msg['Headline'])
      return title !== ''
    })
    
    if (validMessages.length === 0) {
      throw new Error('No valid messages found')
    }
    
    // 1. Try to match today's exact date in US EST
    const todayMessage = validMessages.find(row => isToday(row.Date))
    if (todayMessage) {
      console.log('Found message for today:', todayMessage['Title/Headline (if applicable)'])
      return mapMessageToTemplate(todayMessage)
    }
    
    const easternNow = getEasternNow()
    const dayOfMonth = easternNow.getDate()
    const dayOfYear = getDayOfYear()

    // 2. On giving days (2nd and 16th), prioritize giving-focused messages
    if ([2, 16].includes(dayOfMonth)) {
      const givingMessages = validMessages.filter(isGivingMessage)
      if (givingMessages.length > 0) {
        const givingIndex = dayOfYear % givingMessages.length
        const givingMessage = givingMessages[givingIndex]
        console.log('Using giving message for day', dayOfMonth)
        return mapMessageToTemplate(givingMessage)
      }
    }

    // 3. Otherwise, rotate based on day of year
    const rotationIndex = dayOfYear % validMessages.length
    const rotatingMessage = validMessages[rotationIndex]
    
    console.log('Using rotating message for day', dayOfYear)
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
  // Debug: Log the raw row data to see what fields are available
  console.log('Raw row data:', JSON.stringify(row, null, 2))
  console.log('Available fields:', Object.keys(row))
  
  // Map various possible column names to our expected fields
  const title =
    normalizeString(row['Title/Headline (if applicable)']) ||
    normalizeString(row['Title / Quote']) ||
    normalizeString(row['Title']) ||
    normalizeString(row['Headline']) ||
    'Daily Inspiration'

  const message =
    normalizeString(row['Body / Key Message (if applicable)']) ||
    normalizeString(row['Message']) ||
    normalizeString(row['Quote']) ||
    normalizeString(row['Text']) ||
    'Sometimes the best days start with a simple moment of inspiration.'

  const mediaUrl =
    normalizeString(row['Image/Video Link']) ||
    normalizeString(row['Image or Video']) ||
    normalizeString(row['MediaURL']) ||
    normalizeString(row['Media URL']) ||
    normalizeString(row['Image Link']) ||
    normalizeString(row['Image']) ||
    '/chimp.png'

  const mediaType =
    normalizeString(row['Type']) ||
    normalizeString(row['Media Type']) ||
    'image'

  // Get raw values first to check if they actually exist
  const rawCtaText =
    normalizeString(row['External Link CTA Messaging (if applicable)']) ||
    normalizeString(row['CTA']) ||
    normalizeString(row['Call to Action']) ||
    normalizeString(row['Button Text']) ||
    ''

  const rawCtaLink =
    normalizeString(row['External Link (if applicable)']) ||
    normalizeString(row['External Link']) ||
    normalizeString(row['Link']) ||
    normalizeString(row['CTA Link']) ||
    normalizeString(row['Button Link']) ||
    ''

  const givingMessage = isGivingMessage(row)
  const hasExternalLink = Boolean(rawCtaLink)

  // Only set defaults if there's no actual data
  let ctaText = rawCtaText
  let ctaLink = rawCtaLink

  if (!ctaLink) {
    ctaLink = givingMessage ? GIVING_PAGE_URL : ABOUT_PAGE_URL
  }

  if (!ctaText) {
    if (givingMessage || hasExternalLink || ctaLink !== ABOUT_PAGE_URL) {
      ctaText = LEARN_MORE_TEXT
    } else {
      ctaText = ABOUT_CTA_TEXT
    }
  }
  
  // Track if we have actual data (not defaults) for the button logic
  const hasActualCtaData = Boolean(rawCtaText || rawCtaLink)
  
  // Determine the final media type
  const finalMediaType = getMediaType(mediaType)
  
  // Convert Google Drive URLs to appropriate URLs based on media type
  const processedMediaUrl = convertGoogleDriveUrl(mediaUrl, finalMediaType)
  
  console.log(
    'Mapped values:',
    JSON.stringify(
      { title, message, mediaUrl: processedMediaUrl, mediaType: finalMediaType, ctaText, ctaLink, givingMessage },
      null,
      2
    )
  )
  
  return {
    title: title,
    message: message,
    mediaType: finalMediaType,
    mediaUrl: processedMediaUrl,
    mediaAlt: title,
    ctaText: ctaText,
    ctaLink: ctaLink,
    link: ctaLink, // Use ctaLink as the main link for now
    hasActualCtaData: hasActualCtaData, // Flag to indicate if we have real CTA data (not defaults)
    accent: 'Daily Inspiration'
  }
}

/**
 * Convert Google Drive file URLs to appropriate URLs based on media type
 * @param {string} url Original URL
 * @param {string} mediaType The media type (image/video)
 * @returns {string} Converted URL
 */
function convertGoogleDriveUrl(url, mediaType = 'image') {
  if (!url || url === '/chimp.png') return '/chimp.png'
  const trimmedUrl = url.trim()
  if (trimmedUrl === '') return '/chimp.png'

  // Allow data URIs, absolute URLs, and already-prefixed paths to pass through
  if (/^data:/i.test(trimmedUrl)) {
    return trimmedUrl
  }

  if (trimmedUrl.startsWith('/')) {
    return trimmedUrl
  }

  // Handle relative asset paths inside the public directory
  if (!/^[a-zA-Z]+:\/\//.test(trimmedUrl)) {
    return `/${trimmedUrl.replace(/^\/+/, '')}`
  }

  // If it's already a direct image URL, return as-is
  if (trimmedUrl.match(/\.(jpg|jpeg|png|gif|webp|svg|mp4|webm|mov|ogg)$/i)) {
    return trimmedUrl
  }
  
  // If it's a YouTube URL, return as-is
  if (trimmedUrl.includes('youtube.com') || trimmedUrl.includes('youtu.be')) {
    return trimmedUrl
  }
  
  // Convert Google Drive file view URL
  if (trimmedUrl.includes('drive.google.com/file/d/')) {
    const fileIdMatch = trimmedUrl.match(/\/file\/d\/([a-zA-Z0-9-_]+)/)
    if (fileIdMatch) {
      const fileId = fileIdMatch[1]
      
      // For both videos and images, use the preview endpoint (more reliable)
      return `https://drive.google.com/file/d/${fileId}/preview`
    }
  }
  
  // If it's already a direct Google Drive image URL, return as-is
  if (trimmedUrl.includes('uc?export=view')) {
    return trimmedUrl
  }
  
  // If it's already a Google Drive preview URL, return as-is
  if (trimmedUrl.includes('drive.google.com/file/d/') && trimmedUrl.includes('/preview')) {
    return trimmedUrl
  }
  
  // If it looks like a valid HTTP/HTTPS URL, return it as-is (don't fallback to chimp.png)
  // This handles other image hosting services, CDNs, etc.
  if (/^https?:\/\//i.test(trimmedUrl)) {
    return trimmedUrl
  }
  
  // Only fallback to chimp.png if the URL is clearly invalid
  return '/chimp.png'
}
