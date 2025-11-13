# Frontend - Django React Full Stack App

A modern React frontend application built with Vite, featuring authentication, user management, and a beautiful UI powered by shadcn/ui and Tailwind CSS.

## 🚀 Features

- **Authentication System**: Login and registration functionality
- **Protected Routes**: Route protection for authenticated users
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Responsive Design**: Mobile-first responsive layout
- **JWT Token Management**: Secure token storage and refresh
- **API Integration**: Seamless communication with Django backend
- **Error Handling**: Comprehensive error handling and user feedback
- **Loading States**: Visual feedback during API calls

## 🛠️ Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and development server
- **React Router** - Client-side routing
- **Axios** - HTTP client for API requests
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality component library
- **PropTypes** - Type checking for React components
- **JWT Decode** - JWT token parsing

## 📦 Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd 14-Django-React-Full-Stack-App/frontend
```

1. Install dependencies:

```bash
npm install
```

1. Create environment file:

```bash
cp .env.template .env
```

1. Configure environment variables:

```env
VITE_API_URL="http://127.0.0.1:8000"
```

1. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🏗️ Project Structure

```text
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable components
│   │   ├── ui/           # shadcn/ui components
│   │   │   ├── button.jsx
│   │   │   ├── button-variants.js
│   │   │   ├── card.jsx
│   │   │   └── input.jsx
│   │   ├── Form.jsx      # Authentication form component
│   │   └── ProtectedRoute.jsx  # Route protection
│   ├── pages/            # Page components
│   │   ├── Home.jsx      # Dashboard/home page
│   │   ├── Login.jsx     # Login page
│   │   ├── Register.jsx  # Registration page
│   │   └── NotFound.jsx  # 404 error page
│   ├── styles/           # Legacy CSS files
│   ├── api.js            # API configuration and interceptors
│   ├── constants.js      # Application constants
│   ├── utils.js          # Utility functions
│   ├── index.css         # Global styles and Tailwind imports
│   ├── main.jsx          # Application entry point
│   └── App.jsx           # Main app component with routing
├── .env                  # Environment variables
├── .env.template         # Environment variables template
├── tailwind.config.js    # Tailwind CSS configuration
├── postcss.config.js     # PostCSS configuration
├── vite.config.js        # Vite configuration
└── package.json          # Dependencies and scripts
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_API_URL="http://127.0.0.1:8000"
```

### Tailwind CSS Configuration

The project uses Tailwind CSS with custom configuration for shadcn/ui components. The configuration is located in `tailwind.config.js`.

### API Configuration

API settings are configured in `src/api.js`:

- Base URL from environment variables
- JWT token injection for authenticated requests
- Error handling interceptors

## 🧩 Components

### shadcn/ui Components

The project includes the following shadcn/ui components:

- **Button**: Customizable button with multiple variants
- **Card**: Container component with header, content, and footer
- **Input**: Form input with validation states

### Custom Components

- **Form**: Reusable authentication form for login/registration
- **ProtectedRoute**: HOC for protecting authenticated routes
- **Home**: Dashboard component for authenticated users
- **Login/Register**: Page components using the Form component
- **NotFound**: 404 error page with navigation options

## 🔐 Authentication

The application implements JWT-based authentication:

1. **Login**: Users submit credentials to `/api/token/`
2. **Registration**: New users register via `/api/user/register/`
3. **Token Storage**: Access and refresh tokens stored in localStorage
4. **Protected Routes**: Routes protected by authentication status
5. **Automatic Logout**: Token expiration and logout functionality

## 📱 Responsive Design

The application is built with a mobile-first approach:

- Responsive layouts using Tailwind CSS breakpoints
- Touch-friendly interface elements
- Optimized for various screen sizes

## 🎨 Styling

- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Pre-built components with consistent design
- **CSS Variables**: Theme customization through CSS custom properties
- **Dark Mode Support**: Built-in dark mode capability

## 🚀 Build and Deployment

### Development

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

## 🧪 Testing

The project is set up for testing. Tests should be placed in the `src/tests` directory and follow the naming convention `*.test.js` or `*.spec.js`.

## 🔄 API Integration

The frontend communicates with the Django backend through:

- **Authentication endpoints**: Login, register, token refresh
- **Protected endpoints**: Access with JWT tokens
- **Error handling**: Centralized error handling with user feedback
- **Loading states**: Visual indicators during API calls

## 🛡️ Security

- JWT token storage in localStorage
- Automatic token injection for API requests
- Route protection for authenticated pages
- Input validation and sanitization
- CORS configuration with backend

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **Environment variables not loading**: Ensure `.env` file is in the correct location and variables are prefixed with `VITE_`
2. **CORS errors**: Verify backend CORS configuration
3. **Build errors**: Check all dependencies are installed
4. **Styling issues**: Ensure Tailwind CSS is properly configured

### Getting Help

- Check the console for error messages
- Verify environment variables are correctly set
- Ensure the backend server is running
- Check network requests in browser dev tools
