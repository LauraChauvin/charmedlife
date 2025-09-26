# Google Sheets Access Instructions

## Steps to Make Your Google Sheet Accessible

### For the Google Sheet to work with this app:

### 1. Publishing Your Sheet
The Google Sheet must be made publicly accessible:

1. Open your Google Sheet (https://docs.google.com/spreadsheets/d/1iD1MrIuXdA4cqIv-jwvv5Qxc8HHro2bKntRuVKuU88Q/edit)
2. Click **File** → **Share** → **Publish to Web**
3. In the window that opens:
   - Set "Link type" to **Entire document**
   - Check "Automatically republish" for live updates
   - Change "Web page" to **Comma-separated values (.csv)**
   - Click **Publish**
   - Confirm the dialog

### 2. Verify CSV Export
1. The sheet should now be accessible at:
   - `https://docs.google.com/spreadsheets/d/1iD1MrIuXdA4cqIv-jwvv5Qxc8HHro2bKntRuVKuU88Q/export?format=csv&gid=0`

### 3. Sheet Data Format 
Ensure your sheet columns follow this order:
- Row 1: **Headers** → Date | Type | Title | Message | MediaURL | CTA | Link
- Row 2+: Your daily message content

#### Sample entries:
```
Date        | Type                | Title           | Message... 
2024-12-26  | Add text over image | Today's Power   | Start each day with courage  
Video Entry | Video              | Tomorrow Joy    | Every journey grows with community
            | Add text over image | Eternal Hope    | Problems should never steal future possibilities
```
