# 🚀 Blis Library - React Frontend

A modern, responsive frontend for the Library Management System built with React, Vite, and Tailwind CSS.

## 🎨 Design Features
- **Airbnb-inspired** modern design aesthetic
- **Poppins font** throughout the application
- **Tailwind CSS** for styling
- **Font Awesome icons** for UI elements
- **SweetAlert2** for beautiful alerts
- **React Toastify** for notifications
- **Dark/Light theme support** (can be added)

## 📦 Tech Stack
- **React 18** - UI library
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **React Toastify** - Toast notifications
- **SweetAlert2** - Alert dialogs
- **Font Awesome** - Icon library
- **Date-fns** - Date utilities
- **Zustand** - State management (optional)

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- npm or yarn

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

Server runs at: **http://localhost:5173**

The dev server has a proxy configured for API calls at **http://localhost:5000/api**

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   ├── axios.js         # Axios instance with interceptors
│   │   └── endpoints.js     # API endpoint definitions
│   ├── components/
│   │   ├── layouts/
│   │   │   ├── MainLayout.jsx       # Main app layout
│   │   │   └── AuthLayout.jsx       # Auth page layout
│   │   ├── Navigation.jsx   # Top navigation bar
│   │   └── Footer.jsx       # Footer component
│   ├── context/
│   │   └── AuthContext.jsx  # Authentication context
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── ForgotPasswordPage.jsx
│   │   ├── HomePage.jsx
│   │   ├── BooksPage.jsx
│   │   ├── BookDetailsPage.jsx
│   │   ├── MyBooksPage.jsx
│   │   ├── ReservationsPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── DashboardPage.jsx
│   │   └── NotFoundPage.jsx
│   ├── utils/              # Utility functions
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── index.html              # HTML entry point
├── package.json            # Dependencies
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
└── .env.example            # Environment variables template
```

## 🎯 Key Pages

- **Login/Register** - User authentication
- **Home** - Landing page with features overview
- **Books** - Browse and search books
- **Book Details** - Individual book information and reviews
- **My Books** - Borrowed books and borrowing history
- **Reservations** - Book reservations
- **Profile** - User profile and settings
- **Dashboard** - User statistics and analytics

## 🔐 Authentication

- JWT token-based authentication
- Automatic token refresh on 401 response
- Protected routes with Auth context

## 🎨 Customization

### Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  primary: '#FF6B6B',     // Main brand color
  secondary: '#4ECDC4',   // Secondary color
  accent: '#FFE66D',      // Accent color
  // ... more colors
}
```

### Fonts
Change font in `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
```

## 🚀 Deployment

### Build for production
```bash
npm run build
```

### Deploy to Vercel (recommended)
```bash
npm install -g vercel
vercel
```

The included `vercel.json` rewrites client-side routes to `index.html`, so refreshing a nested React Router page works on Vercel.

### Deploy to Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

## 🔗 Environment Variables

Create `.env` file:
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=Blis Library
```

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🐛 Debugging

- Open DevTools (F12)
- Check Network tab for API calls
- Check Console for errors
- Check Application > Local Storage for stored tokens

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [React Router](https://reactrouter.com)
- [Axios Documentation](https://axios-http.com)

## 👥 Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details
