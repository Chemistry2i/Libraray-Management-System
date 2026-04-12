# 🎯 Frontend Setup & Development Guide

## Prerequisites

- Node.js v16+ ([Download](https://nodejs.org/))
- npm or yarn
- Git

## Initial Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

This will install all required packages:
- React & React DOM
- Vite (build tool)
- Tailwind CSS
- React Router for navigation
- Axios for API calls
- React Toastify for notifications
- SweetAlert2 for dialogs
- Font Awesome icons
- And more...

### 2. Environment Setup

Create `.env` file in the frontend root:
```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=Blis Library
```

### 3. Start Development Server
```bash
npm run dev
```

Open **http://localhost:5173** in your browser

## 📁 Project Structure

```
src/
├── api/              - API calls and endpoints
├── components/       - Reusable React components
├── context/         - React Context for state management
├── pages/           - Page components
├── utils/           - Utility functions
├── constants/       - App constants
├── App.jsx          - Main app component
└── index.css        - Global styles with Tailwind
```

## 🎨 Design System

### Colors
- **Primary**: `#FF6B6B` - Red
- **Secondary**: `#4ECDC4` - Teal
- **Accent**: `#FFE66D` - Yellow
- **Dark**: `#2C3E50` - Dark gray
- **Light**: `#F7F7F7` - Light gray

To change colors, edit `tailwind.config.js`

### Typography
- **Font**: Poppins (imported from Google Fonts)
- **H1**: text-5xl font-bold
- **H2**: text-4xl font-bold
- **H3**: text-xl font-semibold
- **Body**: text-base

### Components
- Buttons: `btn-primary`, `btn-secondary`, `btn-outline`
- Cards: `card`, `card-hover`
- Inputs: standard HTML with Tailwind classes

## 🚀 Adding Features

### Add a New Page

1. Create page component in `src/pages/`
```javascript
// src/pages/ExamplePage.jsx
export default function ExamplePage() {
  return (
    <div className="min-h-screen bg-light py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold">Page Title</h1>
      </div>
    </div>
  )
}
```

2. Add route in `App.jsx`
```javascript
import ExamplePage from './pages/ExamplePage'

// In Routes:
<Route path="/example" element={<ExamplePage />} />
```

### Add a New Component

1. Create component in `src/components/`
```javascript
// src/components/MyComponent.jsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBook } from '@fortawesome/free-solid-svg-icons'

export default function MyComponent() {
  return (
    <div className="card">
      <FontAwesomeIcon icon={faBook} className="text-primary" />
      <p>My Component</p>
    </div>
  )
}
```

2. Import and use in pages
```javascript
import MyComponent from '../components/MyComponent'
```

### Make API Call

```javascript
import { bookAPI } from '../api/endpoints'
import { toast } from 'react-toastify'

// In component
useEffect(() => {
  const fetchBooks = async () => {
    try {
      const response = await bookAPI.getAll()
      console.log(response.data)
    } catch (error) {
      toast.error('Failed to fetch books')
    }
  }

  fetchBooks()
}, [])
```

## 🔐 Authentication

User authentication is managed through `AuthContext`:

```javascript
import { useAuth } from '../context/AuthContext'

export default function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth()

  if (!isAuthenticated) {
    return <p>Please login</p>
  }

  return <p>Welcome, {user.firstName}!</p>
}
```

## 📱 Responsive Design

Tailwind breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

Example:
```javascript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* Single column on mobile, 2 on tablet, 3 on desktop */}
</div>
```

## 🧪 Testing

Run tests:
```bash
npm run test
```

## 🚀 Building for Production

```bash
npm run build
```

This creates optimized build in `dist/` folder

## 📦 Deployment

### Deploy to Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Deploy to GitHub Pages
```bash
npm run build
# Push dist/ to gh-pages branch
```

## 🐛 Debugging

1. **DevTools**: F12 or Right-click → Inspect
2. **Network Tab**: Check API calls
3. **Console**: Check for errors
4. **React DevTools**: Browser extension to inspect React components
5. **Local Storage**: Check stored tokens and user data

## 📚 Useful Icons (Font Awesome)

```javascript
import { 
  faBook, 
  faUser, 
  faSignOut, 
  faStar,
  faHeart,
  faShoppingCart,
  faSearch,
  faBell,
  faGear
} from '@fortawesome/free-solid-svg-icons'
```

Check [Font Awesome Icons](https://fontawesome.com/icons) for all available icons

## 💡 Tips & Tricks

1. **Use constants** - Define reusable values in `constants/`
2. **Extract components** - Keep components small and reusable
3. **Use composition** - Build UIs by composing components
4. **Error handling** - Always handle API errors with try-catch
5. **Loading states** - Show feedback while loading data
6. **Validation** - Validate form inputs before submission

## 🆘 Common Issues

### Issue: API calls not working
- Check `.env` file has correct `VITE_API_BASE_URL`
- Check backend is running on port 5000
- Check CORS configuration in backend

### Issue: Styles not applying
- Make sure component has Tailwind classes
- Check tailwind.config.js is correct
- Restart dev server

### Issue: Images not loading
- Use absolute imports with `/` at start
- Check file path is correct
- Check file exists in public folder

## 📖 Resources

- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [Tailwind Docs](https://tailwindcss.com)
- [React Router](https://reactrouter.com)
- [Axios](https://axios-http.com)
- [Font Awesome Icons](https://fontawesome.com/icons)

## ❓ Need Help?

1. Check the README.md
2. Review similar components
3. Check console for errors
4. Try the debugging tips above
