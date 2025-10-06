exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  }

  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    }
  }

  try {
    // Fetch CSV data from Google Sheets with cache-busting
    const timestamp = Date.now()
    const csvUrl = `https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-xYhLTBE31o3fcg-kghTOMwTIiy0vlIkHX8PoPkmcPKE1j4frp7kw6E0nmFNxG4oQ4Di9eJsnuduh/pub?output=csv&t=${timestamp}`
    
    const response = await fetch(csvUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/csv',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch CSV data: ${response.status} ${response.statusText}`)
    }

    const csvText = await response.text()
    
    if (!csvText.trim()) {
      throw new Error('Empty CSV response')
    }

    // Parse CSV
    const rows = parseCSV(csvText)
    
    // Convert to our format - extract headers and data
    if (rows.length === 0) {
      throw new Error('No data in CSV')
    }
    
    // First, get the header row to understand column mapping
    const headers = rows[0] || []
    const messages = rows.slice(1) // Skip header row
      .filter(row => row.length >= 6 && row.some(cell => cell && cell.trim() !== ''))
      .map(row => {
        // Create object with proper field names based on headers
        const messageObj = {}
        headers.forEach((header, index) => {
          messageObj[header] = row[index] || ''
        })
        return messageObj
      })
      .filter(msg => {
        // Check if message has a title using the actual column name from your sheet
        const title = msg['Title/Headline (if applicable)'] || msg['Title / Quote'] || msg['Title'] || msg['Headline']
        return title && title.trim() !== ''
      })
      .map(msg => {
        // Map the sheet columns to the expected format
        return {
          date: msg['Date (optional)'] || '',
          type: msg['Type'] || '',
          title: msg['Title/Headline (if applicable)'] || '',
          message: msg['Body / Key Message (if applicable)'] || '',
          mediaURL: msg['Image/Video Link'] || '',
          cta: msg['External Link CTA Messaging (if applicable)'] || '',
          link: msg['External Link (if applicable)'] || ''
        }
      })
    
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      body: JSON.stringify({ messages })
    }
    
  } catch (error) {
    console.error('Error fetching messages:', error)
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch messages',
        details: error.message,
        messages: [] // Fallback for error case
      })
    }
  }
}

// CSV parsing function
function parseCSV(csv) {
  const rows = []
  const lines = csv.split('\n')
  
  for (const line of lines) {
    if (line.trim()) {
      const row = parseCSVLine(line.trim())
      if (row.length >= 6) { // Ensure we have minimum columns
        rows.push(row)
      }
    }
  }
  
  return rows
}

// Parse individual CSV line with quoted fields
function parseCSVLine(line) {
  const result = []
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
