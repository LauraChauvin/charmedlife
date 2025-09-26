# FootForward Fund - Daily Inspiration App

A mobile-first inspirational web app built for bracelets using React + Vite + Tailwind CSS.

## Features

- 📱 **Mobile-First Design**: Optimized for mobile devices with responsive layout
- 🌅 **Daily Message Cards**: Rotating daily inspirational messages
- 📤 **Advanced Share**: Web Share API with clipboard/link fallbacks
- 💝 **Donate Integration**: Links to Zeffy donation platform
- 🖼️ **Smart Media**: Images and videos with text overlays
- ⚡ **Performance Optimized**: Lazy loading for images and videos
- 🔗 **URL-based Routing**: Token-based routing system
- 👆 **Touch Optimized**: Enhanced mobile touch interactions
- 📐 **Viewport Safe**: Responsive across all screen sizes
- 🚀 **Mobile Lazy**: Intersection Observer with performance tweaks

## Technologies Used

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM

## Fonts

- **Body/Headlines**: Glacial Indifference (Google Fonts)
- **Script/Accents**: Halimum (Google Fonts)

## Brand Colors

- **Primary Blue**: #1e4395

## Project Structure

```
src/
├── components/
│   ├── LazyImage.tsx      # Optimized image loading
│   ├── LazyVideo.tsx      # Optimized video loading
│   ├── MessageCard.tsx    # Daily message card component
│   ├── LandingPage.tsx    # Main landing page
│   └── Footer.tsx         # Footer with social links
├── App.tsx                # Main app component with routing
├── main.tsx              # Application entry point
└── index.css             # Global styles and Tailwind imports
```

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## Deployment

This project is configured for Netlify deployment.

### Netlify Build Settings

- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Node Version**: 18

### Environment Variables

No special environment variables required for basic functionality.

### Google Sheets Integration

The app is **automatically connected** to Google Sheets:

1. **Real-time fetching**: Uses CSV export from Google Sheets
2. **US EST Timezone**: Correctly handles daily message selection
3. **Smart date matching**: Shows today's message if date column filled, otherwise rotates
4. **Media support**: Handles YouTube videos and Cloudinary embeds
5. **CTA logic**: Only shows buttons when both CTA text + Link exist
6. **Column mapping**: Date | Type | Title | Message | MediaURL | CTA | Link

**Sheet Config**: No API credentials needed - uses published CSV export

## URL Routing

The app uses token-based routing:
- **Root URL**: `https://tap.footforwardfund.org/` - Shows daily message
- **Token URLs**: `https://tap.footforwardfund.org/<token>` - All tokens show the same daily message
- **Token Examples**: `/abc123`, `/xyz789`, `/bracelet001`, etc.
- **Analytics**: All tokens are logged to console for tracking
- **Invalid Tokens**: Any random/invalid tokens still show the daily message

## Sample Data

The app includes sample messages for testing:

1. **Today's Inspiration** - Text overlay on images
2. **Tomorrow's Journey** - Video integration 
3. **Wednesday Wisdom** - Video with embedded text

## Performance Optimization

- **Lazy Loading**: Images and videos load only when in view
- **Intersection Observer**: Efficient viewport detection
- **Optimized Assets**: Compressed and formatted media
- **Tailwind CSS**: Minimal CSS bundle size

## Browser Support

- Modern browsers with Web Share API support
- Graceful degradation for older browsers
- Mobile-first responsive design

## License

© 2024 FootForward Fund
