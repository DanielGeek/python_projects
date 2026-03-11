# Project Architecture Documentation

## 📁 Project Structure

```
src/
├── components/              # React components
│   ├── ErrorBoundary.tsx   # Error boundary for error handling
│   ├── Auth/               # Authentication components
│   │   ├── LoginForm.tsx   # Login form UI
│   │   ├── SignupForm.tsx  # Signup form UI
│   │   └── ProtectedRoute.tsx # Route protection wrapper
│   └── FileUpload/         # File upload feature module
│       ├── index.tsx       # Main FileUploader component
│       ├── DropZone.tsx    # Drag & drop zone component
│       ├── FileList.tsx    # File list display component
│       ├── UploadButton.tsx # Upload action button
│       ├── SuccessMessage.tsx # Success feedback component
│       └── Header.tsx      # User info display with logout
├── pages/                  # Page components
│   ├── LoginPage.tsx       # Login page
│   └── SignupPage.tsx      # Signup page
├── hooks/                   # Custom React hooks
│   ├── useAuth.ts          # Authentication state management
│   ├── useFileUpload.ts    # File upload logic and state management
│   └── useDragAndDrop.ts   # Drag and drop functionality
├── services/                # API and external service integrations
│   ├── auth.service.ts     # Authentication service layer
│   └── upload.service.ts   # File upload service layer
├── lib/                     # External library configurations
│   └── supabase.ts         # Supabase client configuration
├── utils/                   # Utility functions
│   └── file.utils.ts       # File validation and formatting utilities
├── types/                   # TypeScript type definitions
│   ├── auth.types.ts       # Authentication related types
│   └── file.types.ts       # File-related type definitions
├── config/                  # Configuration and constants
│   └── constants.ts        # Application constants
├── App.tsx                  # Root application component with routing
├── main.tsx                # Application entry point
├── index.css               # Global styles
└── vite-env.d.ts          # Vite environment type definitions
```

## 🔐 Authentication Architecture

### Overview
The project implements a complete authentication system using Supabase Auth with the following features:
- User registration (signup)
- User login (signin)  
- Protected routes
- Session management with auto-refresh
- Logout functionality

### Authentication Flow
```
Login/Signup Page
    ↓
useAuth Hook (State Management)
    ↓
auth.service.ts (Supabase API Calls)
    ↓
Supabase Auth
    ↓
Session Management & Protected Routes
```

### Key Components
- **useAuth Hook**: Centralized authentication state and methods
- **auth.service.ts**: Service layer for all Supabase auth operations
- **ProtectedRoute**: Route wrapper that requires authentication
- **LoginForm/SignupForm**: UI components for authentication
- **Header**: User info display with logout functionality

### Environment Variables
Required Supabase configuration:
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key

### Routing Structure
- `/login` - Public login page
- `/signup` - Public signup page
- `/upload` - Protected file upload page
- `/` - Redirects to login
- `/*` - Wildcard redirects to login

## 🏗️ Architecture Principles

### 1. **Separation of Concerns**
- **Components**: Pure UI components focused on presentation
- **Hooks**: Reusable business logic and state management
- **Services**: External API interactions and data fetching
- **Utils**: Pure utility functions without side effects
- **Types**: Centralized type definitions

### 2. **Component Composition**
The FileUploader is broken down into smaller, focused components:
- `DropZone`: Handles drag & drop UI
- `FileList`: Displays uploaded files
- `UploadButton`: Upload action trigger
- `SuccessMessage`: Success feedback

### 3. **Custom Hooks Pattern**
- `useFileUpload`: Manages file state and upload operations
- `useDragAndDrop`: Handles drag and drop interactions

### 4. **Service Layer**
- Abstracts API calls from components
- Handles error parsing and response formatting
- Centralized upload logic

## 🔄 Data Flow

```
User Action
    ↓
Component (UI)
    ↓
Custom Hook (Business Logic)
    ↓
Service Layer (API Calls)
    ↓
External API (n8n Webhook)
```

## 📝 Code Organization Best Practices

### Constants and Configuration
All magic strings and configuration values are centralized in `config/constants.ts`:
- File upload constraints
- API endpoints
- UI text strings
- Error messages

### Type Safety
TypeScript types are defined in dedicated files:
- `file.types.ts`: File upload related types
- Strict typing throughout the application
- No `any` types used

### Error Handling
- ErrorBoundary component catches React errors
- Service layer handles API errors
- User-friendly error messages
- Proper error state management

### Code Comments
All files include:
- File-level documentation comments
- Function-level JSDoc comments
- Inline comments for complex logic

## 🎯 Key Features

### 1. File Upload System
- Drag and drop support
- Multiple file selection
- File validation (type and size)
- Real-time upload progress
- Error handling with detailed messages

### 2. Modular Architecture
- Each component has a single responsibility
- Reusable hooks for common functionality
- Centralized configuration
- Clean separation of concerns

### 3. Type Safety
- Full TypeScript coverage
- Path aliases for clean imports
- Strict type checking enabled

### 4. Error Resilience
- Error boundary for React errors
- Service-level error handling
- User-friendly error messages
- Graceful degradation

## 🔧 Configuration

### Path Aliases
Configured in `tsconfig.app.json` and `vite.config.ts`:
- `@/*`: Maps to `src/*`
- `@/components/*`: Maps to `src/components/*`
- `@/hooks/*`: Maps to `src/hooks/*`
- `@/services/*`: Maps to `src/services/*`
- `@/utils/*`: Maps to `src/utils/*`
- `@/types/*`: Maps to `src/types/*`
- `@/config/*`: Maps to `src/config/*`

### Environment Variables
Defined in `.env` and typed in `vite-env.d.ts`:
- `VITE_N8N_UPLOAD_WEBHOOK_URL`: n8n webhook endpoint
- `VITE_APP_URL`: Application URL

## 📚 Development Guidelines

### Adding New Features
1. Create types in `src/types/`
2. Add constants in `src/config/constants.ts`
3. Create utility functions in `src/utils/`
4. Build service layer in `src/services/`
5. Create custom hooks in `src/hooks/`
6. Build UI components in `src/components/`

### Component Guidelines
- Keep components small and focused
- Use composition over inheritance
- Extract reusable logic into hooks
- Use TypeScript for all components
- Include JSDoc comments

### Hook Guidelines
- Prefix with `use`
- Return objects with named properties
- Include TypeScript types
- Document parameters and return values

### Service Guidelines
- Handle all API interactions
- Parse and format responses
- Centralize error handling
- Return typed responses

## 🧪 Testing Strategy
- Unit tests for utility functions
- Component tests for UI components
- Integration tests for hooks
- E2E tests for critical flows

## 🚀 Performance Optimizations
- React.memo for expensive components
- useCallback for event handlers
- useMemo for computed values
- Code splitting for large features
- Lazy loading for routes

## 📖 Further Reading
- [React Best Practices](https://react.dev/learn)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Clean Code Principles](https://github.com/ryanmcdermott/clean-code-javascript)
