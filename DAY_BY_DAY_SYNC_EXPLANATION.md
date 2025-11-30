# How Day-by-Day Syncing Works with Image Counting

## Overview
The system uses a **day-of-year rotation** to cycle through all messages in your spreadsheet. Here's how it works:

## Day-by-Day Rotation Logic

### 1. **Day of Year Calculation**
- The system calculates the current "day of year" (1-365 or 366 for leap years)
- This is based on **US Eastern Time** to ensure consistency
- Day 1 = January 1st, Day 365/366 = December 31st

### 2. **Message Selection Process**
The system follows this priority order:

**Step 1: Exact Date Match (if Date column exists)**
- First, it checks if any message has today's exact date
- If found, that message is shown

**Step 2: Special Days (2nd and 16th of each month)**
- On the 2nd and 16th, it prioritizes "giving/donation" messages
- Uses rotation: `dayOfYear % givingMessages.length`

**Step 3: Standard Rotation (default)**
- Uses the formula: `rotationIndex = dayOfYear % totalValidMessages`
- Example: If today is day 50 of the year and you have 252 messages:
  - `50 % 252 = 50` → Shows message #50 (0-indexed, so the 51st message)
- This ensures the same day of year always shows the same message

### 3. **Image/Media URL Processing**

When a Google Drive URL is detected:
- **Input format:** `https://drive.google.com/file/d/FILE_ID/view?usp=sharing`
- **Converted to:** `https://drive.google.com/uc?export=view&id=FILE_ID`

This conversion allows the image to be displayed directly in the app.

## Current Issue: "Screenshot" Problem

### What's Happening
The customer reports seeing a "screenshot of sorts" instead of the actual image. This typically happens when:

1. **Google Drive File Permissions**
   - The file might not be set to "Anyone with the link can view"
   - Google Drive may be showing a preview/thumbnail instead of the full image
   - **Solution:** Ensure all Google Drive images are set to "Anyone with the link can view"

2. **URL Conversion Issue**
   - The `uc?export=view` format should work, but sometimes Google Drive requires different parameters
   - **Alternative:** Try using `uc?export=download` (though this may trigger downloads)

3. **Message/Image Mismatch**
   - If the rotation index is off, the wrong message/image pair could be showing
   - **Verification:** Check if the message text matches the intended image

## How to Verify the System is Working Correctly

### Check Today's Message
1. Calculate today's day of year (US Eastern Time)
2. Count total valid messages in your CSV (excluding header and empty rows)
3. Calculate: `dayOfYear % messageCount = rotationIndex`
4. Verify that message at that index matches what's showing

### Example Calculation
- Today: January 15th = Day 15 of year
- Total messages: 252
- Rotation index: `15 % 252 = 15`
- Should show: The 16th message (index 15, 0-based)

## Recommendations for Fixing the Screenshot Issue

1. **Verify Google Drive Permissions**
   - Open each Google Drive image link
   - Ensure it's set to "Anyone with the link can view"
   - Test the converted URL: `https://drive.google.com/uc?export=view&id=FILE_ID`

2. **Check Image Format**
   - Ensure images are in web-friendly formats (JPG, PNG, WebP)
   - Large files might be compressed by Google Drive

3. **Verify Message Count**
   - Customer says 252 messages
   - Current CSV has ~194 rows (including header)
   - Verify the actual count matches expectations

4. **Test the Rotation**
   - Manually calculate what message should show today
   - Compare with what's actually displaying
   - Check if the image URL matches the intended image

## Technical Details

### Files Involved
- `src/services/sheetService.js` - Main rotation logic (lines 222-288)
- `src/services/sheetService.js` - Google Drive URL conversion (lines 427-498)
- `src/components/MessageCard.jsx` - Image rendering (lines 122-252)

### Key Functions
- `getDailyMessage()` - Selects today's message using rotation
- `getDayOfYear()` - Calculates day of year in US Eastern Time
- `convertGoogleDriveUrl()` - Converts Drive URLs to displayable format
- `mapMessageToTemplate()` - Maps CSV data to display format

## Customer Communication Points

**For the customer, you can explain:**

"The system uses a day-of-year rotation to cycle through your 252 messages. Each day of the year (1-365) corresponds to a specific message based on a mathematical rotation. The same day will always show the same message, ensuring consistency.

Regarding the screenshot issue: This typically occurs when Google Drive images aren't set to public viewing permissions. The system converts Google Drive links to a displayable format, but if the file permissions restrict access, Google may show a preview/screenshot instead of the full image.

To fix this, please ensure all Google Drive images are set to 'Anyone with the link can view' permissions. This will allow the system to display the actual images instead of previews."


