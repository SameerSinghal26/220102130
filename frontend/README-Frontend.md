# URL Shortener Frontend

A modern React-based frontend for the URL shortener service with Tailwind CSS styling.

## Features

### 🔗 URL Shortening
- Shorten long URLs with custom or auto-generated shortcodes
- Set custom expiration times (1 minute to 1 week)
- Copy shortened URLs to clipboard
- Real-time validation and error handling

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Backend API running on `http://localhost:8080`
- Logging service running on `http://localhost:3000`

### Installation
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## API Integration

The frontend connects to your backend API with the following endpoints:

- `POST /shorturls` - Create shortened URLs
- `GET /shorturls/:shortcode` - Get URL analytics
- `GET /:shortcode` - Redirect to original URL


Update `src/config/api.js` to change API endpoints:

```javascript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080',
  LOGGING_URL: 'http://localhost:3000'
};
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint


## Deployment

Build for production:
```bash
npm run build
```

The `dist` folder contains the production-ready files.
