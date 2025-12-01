// Local CSV data located in the public folder
const SHEET_FILENAME = 'Bracelet_Content_Local.csv'
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

/**
 * Convert Windows-style file paths to web paths
 * @param {string} path Path that may contain backslashes
 * @returns {string} Web-safe path with forward slashes
 */
function normalizePathToWeb(path) {
  if (!path || typeof path !== 'string') return path
  // Convert Windows-style backslashes to forward slashes
  // Example: photos\001_image.jpg → /photos/001_image.jpg
  let normalized = path.replace(/\\/g, '/')
  // Ensure it starts with / for absolute paths in public folder
  if (normalized && !normalized.startsWith('/') && !normalized.startsWith('http')) {
    normalized = '/' + normalized
  }
  return normalized
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
    'Image/Video Link': '/defaultimage.png',
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
    const todayMessage = validMessages.find((row, index) => {
      if (isToday(row.Date)) {
        // 🔧 DIAGNOSTIC LOGS - Today's Message Selection
        console.log("DAY OF YEAR:", getDayOfYear())
        console.log("TOTAL ROWS:", validMessages.length)
        console.log("SELECTED INDEX (in validMessages):", index)
        console.log("SELECTED ROW:", row)
        console.log("RAW IMAGE FIELD:", row["Image or Video"])
        return true
      }
      return false
    })
    if (todayMessage) {
      console.log('Found message for today:', todayMessage['Title/Headline (if applicable)'])
      const mappedToday = mapMessageToTemplate(todayMessage)
      console.log("FINAL MEDIA URL:", mappedToday.mediaUrl)
      return mappedToday
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
        
        // 🔧 DIAGNOSTIC LOGS - Giving Message Selection
        const originalIndex = validMessages.findIndex(msg => msg === givingMessage)
        console.log("DAY OF YEAR:", dayOfYear)
        console.log("TOTAL ROWS:", validMessages.length)
        console.log("GIVING MESSAGES COUNT:", givingMessages.length)
        console.log("SELECTED INDEX (in validMessages):", originalIndex)
        console.log("SELECTED INDEX (in givingMessages):", givingIndex)
        console.log("SELECTED ROW:", givingMessage)
        console.log("RAW IMAGE FIELD:", givingMessage["Image or Video"])
        
        console.log('Using giving message for day', dayOfMonth)
        const mappedGiving = mapMessageToTemplate(givingMessage)
        console.log("FINAL MEDIA URL:", mappedGiving.mediaUrl)
        return mappedGiving
      }
    }

    // 3. Otherwise, rotate based on day of year
    const rotationIndex = dayOfYear % validMessages.length
    const rotatingMessage = validMessages[rotationIndex]
    
    // 🔧 DIAGNOSTIC LOGS - Row Selection
    console.log("DAY OF YEAR:", dayOfYear)
    console.log("TOTAL ROWS:", validMessages.length)
    console.log("SELECTED INDEX:", rotationIndex)
    console.log("SELECTED ROW:", rotatingMessage)
    console.log("RAW IMAGE FIELD:", rotatingMessage["Image or Video"])
    
    console.log('Using rotating message for day', dayOfYear)
    const mappedMessage = mapMessageToTemplate(rotatingMessage)
    
    // 🔧 DIAGNOSTIC LOG - Final Media URL
    console.log("FINAL MEDIA URL:", mappedMessage.mediaUrl)
    
    return mappedMessage
    
  } catch (error) {
    console.error('Error in getDailyMessage:', error)
    // Fallback to hardcoded message
    return mapMessageToTemplate({
      Date: new Date().toISOString().split('T')[0],
      Type: 'Daily Message',
      Title: 'Inspiration for Today',
      Message: 'Sometimes the best days start with a simple moment of inspiration.',
      MediaURL: '/defaultimage.png',
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

  // Read the values
  let rawMedia = row["Image or Video"]?.trim() || ""
  let external = row["External Link (if applicable)"]?.trim() || ""

  // 🔧 DIAGNOSTIC LOG - Raw fields from row
  console.log("RAW IMAGE FIELD:", rawMedia)
  console.log("EXTERNAL LINK FIELD:", external)
  console.log("ROW TYPE:", row['Type'])
  console.log("ROW TITLE:", row['Title/Headline (if applicable)'])
  console.log("ROW MESSAGE:", row['Body / Key Message (if applicable)'])

  // Detect if external link is a valid URL
  const isValidUrl = (url) => /^https?:\/\//i.test(url)

  // Normalize Windows-style paths to web paths (photos\... → /photos/...)
  if (rawMedia && !isValidUrl(rawMedia) && rawMedia.toLowerCase() !== "pending") {
    rawMedia = normalizePathToWeb(rawMedia)
    console.log("NORMALIZED PATH:", rawMedia)
  }

  // Determine media URL and type
  let processedMediaUrl = ""
  let finalMediaType = "image"

  // Check if Image or Video is "Pending"
  if (rawMedia && rawMedia.toLowerCase() === "pending") {
    // Rule: If Pending → use External Link
    if (external && isValidUrl(external)) {
      processedMediaUrl = external
      finalMediaType = "external"
      console.log("Using external link because media was Pending")
    } else {
      // External link missing or invalid → fallback
      processedMediaUrl = "/defaultimage.png"
      finalMediaType = "image"
      console.log("🛑 FALLBACK TRIGGERED: External link failed → Using defaultimage.png")
    }
  }
  // Rule A: If Image/Video is a real link, use it
  else if (rawMedia && rawMedia.toLowerCase() !== "pending" && isValidUrl(rawMedia)) {
    // Pass through the Drive converter
    processedMediaUrl = convertGoogleDriveUrl(rawMedia)
    
    // Determine media type based on processed URL
    if (/youtube\.com|youtu\.be/.test(processedMediaUrl)) {
      finalMediaType = "video"
    } else if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(processedMediaUrl)) {
      finalMediaType = "image"
    } else if (isValidUrl(processedMediaUrl) && processedMediaUrl !== "/defaultimage.png") {
      finalMediaType = "external"
    }
  }
  // Rule B: If it's a local path (starts with /), use it directly
  else if (rawMedia && rawMedia.startsWith('/')) {
    processedMediaUrl = rawMedia
    // Determine media type based on extension
    if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(processedMediaUrl)) {
      finalMediaType = "image"
    } else if (/\.(mp4|mov|avi|webm|ogg)$/i.test(processedMediaUrl)) {
      finalMediaType = "video"
    } else {
      finalMediaType = "image" // Default to image
    }
  }
  // Rule C: If neither is valid → fallback
  else {
    processedMediaUrl = "/defaultimage.png"
    finalMediaType = "image"
    console.log("🛑 FALLBACK TRIGGERED: No valid media → Using defaultimage.png")
  }

  // Get raw values first to check if they actually exist
  const rawCtaText =
    normalizeString(row['External Link CTA Messaging (if applicable)']) ||
    normalizeString(row['CTA']) ||
    normalizeString(row['Call to Action']) ||
    normalizeString(row['Button Text']) ||
    ''

  // Get raw external link from the specific column
  const rawExternalLink = normalizeString(row['External Link (if applicable)']) || ''
  
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
  
  // Extract Type field
  const type = normalizeString(row['Type']) || ''
  
  // 🔧 DIAGNOSTIC LOG - Final processed media URL
  console.log("FINAL PROCESSED MEDIA URL:", processedMediaUrl)
  const isLocalMedia = processedMediaUrl.startsWith('/') && !processedMediaUrl.startsWith('//')
  const isExternalMedia = /^https?:\/\//i.test(processedMediaUrl)
  console.log("MEDIA URL TYPE - Local:", isLocalMedia, "| External:", isExternalMedia)
  
  console.log(
    'Mapped values:',
    JSON.stringify(
      { title, message, mediaUrl: processedMediaUrl, mediaType: finalMediaType, ctaText, ctaLink, givingMessage, type },
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
    accent: 'Daily Inspiration',
    type: type, // Add Type field for CTA logic
    externalLink: rawExternalLink // Raw external link value from "External Link (if applicable)" column
  }
}

/**
 * Convert Google Drive file URLs to appropriate URLs based on media type
 * @param {string} url Original URL
 * @param {string} mediaType The media type (image/video)
 * @returns {string} Converted URL
 */
function convertGoogleDriveUrl(url, mediaType = 'image') {
  // 1. New Check/Fix - Handle 'Pending' values
  if (!url || url.toLowerCase() === 'pending' || url === '/Pending') {
    return '/defaultimage.png'
  }
  
  // 2. New Debugging Log - Start
  console.log('--- DEBUG START ---')
  console.log('SheetService: Input URL:', url)

  if (url === '/defaultimage.png') return '/defaultimage.png'
  const trimmedUrl = url.trim()
  if (trimmedUrl === '') {
    console.log('SheetService: Final Processed URL:', '/defaultimage.png')
    console.log('--- DEBUG END ---')
    return '/defaultimage.png'
  }

  let processedUrl = null

  // Handle data URIs first (special case)
  if (/^data:/i.test(trimmedUrl)) {
    processedUrl = trimmedUrl
  }
  // Check and convert Google Drive Links to the public download/preview format
  else if (trimmedUrl.includes('drive.google.com/file/d/')) {
    // This regex looks for the File ID between /d/ and /view or another slash
    const fileIdMatch = trimmedUrl.match(/\/d\/([a-zA-Z0-9_-]+)/)
    
    if (fileIdMatch && fileIdMatch[1]) {
      const fileId = fileIdMatch[1]
      // This is the correct public URL format for embedded images/previews
      processedUrl = `https://drive.google.com/uc?export=view&id=${fileId}`
    } else {
      // Fallback for an invalid Google Drive URL structure
      processedUrl = '/defaultimage.png'
      console.log("🛑 FALLBACK TRIGGERED: Invalid Google Drive URL structure → Using defaultimage.png")
    }
  }
  // If it's already a direct Google Drive image URL (uc?export=view), return as-is
  else if (trimmedUrl.includes('uc?export=view')) {
    processedUrl = trimmedUrl
  }
  // Check and convert YouTube Links
  else if (trimmedUrl.includes('youtube.com') || trimmedUrl.includes('youtu.be')) {
    // If it's YouTube, we typically leave it as is or convert to a standard embed URL if needed
    // Assuming your existing logic handles conversion to /embed if necessary, otherwise leave as trimmedUrl
    processedUrl = trimmedUrl
  }
  // Check and convert relative paths (e.g. for default image)
  else if (trimmedUrl.startsWith('/') || trimmedUrl.startsWith('./')) {
    processedUrl = trimmedUrl
  }
  // Handle any other direct file URL, ensuring protocol is present
  else if (trimmedUrl.startsWith('http')) {
    processedUrl = trimmedUrl
  }
  // Final fallback if the URL couldn't be processed
  else {
    processedUrl = '/defaultimage.png'
    console.log("🛑 FALLBACK TRIGGERED: URL couldn't be processed → Using defaultimage.png")
  }
  
  // Fallback to defaultimage.png if the URL is clearly invalid
  if (!processedUrl) {
    processedUrl = '/defaultimage.png'
    console.log("🛑 FALLBACK TRIGGERED: Processed URL was null → Using defaultimage.png")
  }

  // 2. New Debugging Log - End
  console.log('SheetService: Final Processed URL:', processedUrl)
  
  // 🔧 DIAGNOSTIC LOG - Check if URL is local or external
  const isLocalPath = processedUrl.startsWith('/') && !processedUrl.startsWith('//')
  const isExternalUrl = /^https?:\/\//i.test(processedUrl)
  console.log("URL TYPE - Local:", isLocalPath, "| External:", isExternalUrl)
  
  console.log('--- DEBUG END ---')

  return processedUrl
}
