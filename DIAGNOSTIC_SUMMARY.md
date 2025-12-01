# 🔍 Image Selection Pipeline - Diagnostic Summary

## Investigation Date
Current investigation of the entire image-selection pipeline.

---

## 📋 Files Inspected

### 1. `src/services/sheetService.js`
- **Purpose**: Fetches CSV data, selects daily message, maps row to template
- **Key Functions**:
  - `getDailyMessage()`: Selects today's message using rotation logic
  - `mapMessageToTemplate()`: Maps CSV row to MessageCard props
  - `convertGoogleDriveUrl()`: Converts Drive URLs (but NOT tap.footforwardfund.org URLs)

### 2. `src/components/MessageCard.jsx`
- **Purpose**: Renders the message card with media
- **Key Functions**:
  - `renderBackgroundMedia()`: Renders image/video based on URL
  - Handles media load errors

### 3. `public/story-images/` Directory
- **Status**: ✅ Contains 50+ image files
- **Notable**: No `choir`-specific image found (choir rows use generic `life-charmed-quick-read.png`)

### 4. `public/pics.py`
- **Purpose**: Download script that converts Google Drive URLs to local files
- **Note**: Generates URLs like `https://tap.footforwardfund.org/story-images/...` (NOT local paths)

### 5. `public/Bracelet Content - Sheet1.csv`
- **Structure**: Type, Title, Message, Image or Video, External Link
- **Key Findings**:
  - Row 127: "The Choir Beneath the Bridge" → `https://tap.footforwardfund.org/story-images/life-charmed-quick-read.png`
  - Row 192: "The Choir That Climbed the Mountain" → `https://tap.footforwardfund.org/story-images/life-charmed-quick-read.png`
  - **NO local path conversion exists**

---

## 🔎 Root Cause Analysis

### ❌ **PRIMARY ISSUE: Missing URL Conversion Logic for Images**

**Important Clarification**: 
- **"Image or Video" column** = Media content (image/video URL) - **THIS IS WHAT NEEDS CONVERSION**
- **"External Link (if applicable)" column** = Button CTA link (used for "Learn More" buttons, NOT for images)

**Problem**: The CSV "Image or Video" column contains external URLs like:
```
https://tap.footforwardfund.org/story-images/life-charmed-quick-read.png
```

But the code **NEVER converts these to local paths** like:
```
/story-images/life-charmed-quick-read.png
```

**Evidence**:
1. `sheetService.js` has `convertGoogleDriveUrl()` function that only handles Google Drive URLs
2. No function exists to convert `tap.footforwardfund.org/story-images/` URLs to local paths
3. URLs pass through unchanged from CSV → MessageCard → Browser
4. Browser tries to load external URLs, which may fail or be slow

**Impact**: 
- Images may fail to load if external server is down
- Images load slowly (external request vs local asset)
- Fallback to `/defaultimage.png` may trigger incorrectly

**Note**: The "External Link" field is completely separate - it's used for button links (like "Learn More" buttons), not for image URLs. The image URL conversion must happen on the "Image or Video" field only.

---

## 🔄 Current Pipeline Flow

### Step 1: CSV Fetch
```
fetchSheetData() → parseCsvToJson() → Array of row objects
```

### Step 2: Row Selection (in `getDailyMessage()`)
```
1. Try exact date match (row.Date === today)
2. If day is 2nd or 16th → filter giving messages → rotate by dayOfYear
3. Otherwise → rotate all valid messages by dayOfYear
   rotationIndex = dayOfYear % validMessages.length
```

**Key Variables**:
- `dayOfYear`: 1-365/366 (day of year in US Eastern Time)
- `validMessages`: Filtered array (rows with titles)
- `rotationIndex`: Index into validMessages array (NOT CSV row number)

### Step 3: Media URL Processing (in `mapMessageToTemplate()`)
```
rawMedia = row["Image or Video"]  ← This is the IMAGE/VIDEO URL
external = row["External Link (if applicable)"]  ← This is for BUTTON CTA LINK

rawMedia processing:
→ Check if "Pending" → use External Link as media (exception case)
→ Check if valid URL → pass through convertGoogleDriveUrl()
→ If invalid → fallback to /defaultimage.png

external processing:
→ Used separately for button CTA link (not for images)
```

**Issue**: `convertGoogleDriveUrl()` only handles:
- Google Drive URLs (`drive.google.com/file/d/...`)
- YouTube URLs
- Relative paths (`/...`)
- **NOT** `tap.footforwardfund.org/story-images/` URLs

**Note**: The "External Link" field is used for buttons, NOT image conversion. The image URL conversion must happen on the "Image or Video" field.

### Step 4: MessageCard Rendering
```
mediaUrl → renderBackgroundMedia()
→ Check extension (.png, .jpg, etc.) → render as <img>
→ Check for YouTube → render as <iframe>
→ Check for Drive → render as <iframe>
→ Fallback → render as <img>
```

**Issue**: External URLs like `https://tap.footforwardfund.org/story-images/...` are passed directly to `<img src>`, which may fail to load.

---

## 📊 Choir Row Analysis

### Row 127: "The Choir Beneath the Bridge"
- **Type**: `Text Over Image + Link to an external URL`
- **Title**: `Life|Charmed: Quick Read`
- **Message**: `The Choir Beneath the Bridge`
- **Image or Video**: `https://tap.footforwardfund.org/story-images/life-charmed-quick-read.png`
- **External Link**: `https://footforwardfund.org/charmed-life-updates.html#story50`
- **Local Image Exists?**: ✅ `public/story-images/life-charmed-quick-read.png` exists
- **Issue**: External URL is NOT converted to `/story-images/life-charmed-quick-read.png`

### Row 192: "The Choir That Climbed the Mountain"
- **Type**: `Text Over Image + Link to an external URL`
- **Title**: `Life|Charmed: Quick Read`
- **Message**: `The Choir That Climbed the Mountain`
- **Image or Video**: `https://tap.footforwardfund.org/story-images/life-charmed-quick-read.png`
- **External Link**: `https://footforwardfund.org/charmed-life-updates.html#story78`
- **Local Image Exists?**: ✅ `public/story-images/life-charmed-quick-read.png` exists
- **Issue**: External URL is NOT converted to `/story-images/life-charmed-quick-read.png`

---

## 🛠️ Diagnostic Logs Added

### In `sheetService.js`:

1. **Row Selection Logs**:
   - `DAY OF YEAR: <number>`
   - `TOTAL ROWS: <count>`
   - `SELECTED INDEX: <index>`
   - `SELECTED ROW: <row object>`
   - `RAW IMAGE FIELD: <URL from CSV>`

2. **Media Processing Logs**:
   - `RAW IMAGE FIELD: <value>` ← From "Image or Video" column (this is the media URL)
   - `EXTERNAL LINK FIELD: <value>` ← From "External Link" column (this is for button CTA)
   - `ROW TYPE: <value>`
   - `ROW TITLE: <value>`
   - `ROW MESSAGE: <value>`
   - `FINAL PROCESSED MEDIA URL: <processed URL>` ← The final image/video URL used
   - `MEDIA URL TYPE - Local: <bool> | External: <bool>` ← Whether image URL is local or external

3. **Fallback Detection**:
   - `🛑 FALLBACK TRIGGERED: <reason> → Using defaultimage.png`

### In `MessageCard.jsx`:

1. **Media URL Logs**:
   - `🔧 MESSAGECARD MEDIA URL: <URL>`

2. **Error Logs**:
   - `🛑 MESSAGECARD MEDIA LOAD ERROR: <error>`

---

## 🎯 What Logs Will Reveal

When you run the app, the console will show:

### For Row Selection:
```
DAY OF YEAR: 127
TOTAL ROWS: 202
SELECTED INDEX: 127
SELECTED ROW: { Type: "...", Title: "...", ... }
RAW IMAGE FIELD: https://tap.footforwardfund.org/story-images/life-charmed-quick-read.png
```

### For Media Processing:
```
RAW IMAGE FIELD: https://tap.footforwardfund.org/story-images/life-charmed-quick-read.png
FINAL PROCESSED MEDIA URL: https://tap.footforwardfund.org/story-images/life-charmed-quick-read.png
MEDIA URL TYPE - Local: false | External: true
```

### If Fallback Triggers:
```
🛑 FALLBACK TRIGGERED: <reason> → Using defaultimage.png
```

---

## 🔧 Potential Root Causes (Ranked by Likelihood)

### 1. ⚠️ **MISSING URL CONVERSION** (MOST LIKELY)
- **Issue**: No logic to convert `tap.footforwardfund.org/story-images/` URLs to local `/story-images/` paths
- **Fix**: Add conversion function in `mapMessageToTemplate()` or `convertGoogleDriveUrl()`

### 2. ⚠️ **Wrong Row Selection**
- **Issue**: Rotation logic selects wrong row due to index calculation
- **Fix**: Verify `dayOfYear` calculation and `rotationIndex` math
- **Check**: Logs will show selected index vs expected index

### 3. ⚠️ **Image Not Downloaded**
- **Issue**: Choir image was never downloaded to `public/story-images/`
- **Status**: ✅ Verified - `life-charmed-quick-read.png` EXISTS locally
- **Note**: Choir rows use generic image, not choir-specific

### 4. ⚠️ **Column Formatting Issue**
- **Issue**: "Image or Video" column has incorrect format or hidden characters
- **Fix**: Check CSV for encoding issues, trim whitespace
- **Status**: Code already trims whitespace

### 5. ⚠️ **Image Extension Issue**
- **Issue**: Image URL doesn't end in `.png`/`.jpg`, so downloader skipped it
- **Status**: ✅ Verified - URLs end in `.png`

### 6. ⚠️ **Slugification Issue**
- **Issue**: Image filename was slugified incorrectly during download
- **Status**: ✅ Verified - Filename matches URL: `life-charmed-quick-read.png`

### 7. ⚠️ **Wrong Folder Path**
- **Issue**: Code points to wrong folder or path mismatch
- **Status**: ✅ Verified - Images are in `public/story-images/`, which is correct

---

## 📝 Summary & Next Steps

### ✅ Completed:
1. Added comprehensive diagnostic logs to `sheetService.js`
2. Added diagnostic logs to `MessageCard.jsx`
3. Verified local images exist in `public/story-images/`
4. Identified missing URL conversion logic

### 🔍 What Logs Will Show:
1. **Which row is selected** (index + content)
2. **What the raw image field contains** (from CSV)
3. **What the final processed URL is** (after all transformations)
4. **Whether URL is local or external**
5. **When fallback/default.png is triggered**

### 🎯 Expected Root Cause:
**Missing URL conversion logic** - External `tap.footforwardfund.org/story-images/` URLs are NOT being converted to local `/story-images/` paths.

### 📋 Next Steps (After Reviewing Logs):
1. **Verify row selection** - Check if correct row is being selected
2. **Verify image URL** - Check if external URL exists or needs conversion
3. **Add URL conversion** - Convert `tap.footforwardfund.org/story-images/` → `/story-images/`
4. **Test fallback** - Verify fallback only triggers when necessary
5. **Fix rotation logic** - If row selection is wrong, fix rotation calculation

---

## 🚨 IMPORTANT NOTES

- **NO FIXES APPLIED YET** - Only diagnostic logs added
- **Logs are temporary** - Remove after diagnosis complete
- **External URLs work** - But local paths are faster and more reliable
- **Choir images use generic image** - Not a choir-specific image issue

---

**End of Diagnostic Summary**

