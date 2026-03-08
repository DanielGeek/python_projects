# Authentication System Documentation

## 🔐 Overview

This project implements a complete authentication system using Supabase Auth with the following features:

- User registration (signup)
- User login (signin)
- Protected routes
- Session management
- Logout functionality
- Email verification

## 🏗️ Architecture

### Components Structure

```
src/
├── components/
│   └── Auth/
│       ├── LoginForm.tsx          # Login form UI
│       ├── SignupForm.tsx         # Signup form UI
│       └── ProtectedRoute.tsx     # Route protection wrapper
├── pages/
│   ├── LoginPage.tsx              # Login page
│   └── SignupPage.tsx             # Signup page
├── hooks/
│   └── useAuth.ts                 # Authentication hook
├── services/
│   └── auth.service.ts            # Auth service layer
├── types/
│   └── auth.types.ts              # Auth type definitions
└── lib/
    └── supabase.ts                # Supabase client config
```

## 🚀 Setup

### 1. Supabase Configuration

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings > API
3. Add to `.env`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Email Configuration (Optional)

Configure email templates in Supabase Dashboard:
- Authentication > Email Templates
- Customize confirmation and password reset emails

## 📝 Usage

### Login Page

Users can sign in with email and password:

```typescript
// Navigate to /login
// Enter credentials
// Redirects to /upload on success
```

### Signup Page

New users can create an account:

```typescript
// Navigate to /signup
// Enter email, password, and optional full name
// Confirmation email sent
// User must verify email before logging in
```

### Protected Routes

Routes wrapped with `ProtectedRoute` require authentication:

```typescript
<Route
  path="/upload"
  element={
    <ProtectedRoute>
      <FileUploader />
    </ProtectedRoute>
  }
/>
```

### Using the Auth Hook

```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const {
    user,              // Current user object
    session,           // Current session
    loading,           // Loading state
    error,             // Error state
    signIn,            // Sign in function
    signUp,            // Sign up function
    signOut,           // Sign out function
    isAuthenticated,   // Boolean auth status
    clearError,        // Clear error state
  } = useAuth();

  // Use auth state and methods
}
```

## 🔧 Service Layer

### Authentication Service

All Supabase auth operations are centralized in `auth.service.ts`:

**Sign Up:**
```typescript
const result = await signUp({
  email: 'user@example.com',
  password: 'password123',
  fullName: 'John Doe',
});
```

**Sign In:**
```typescript
const result = await signIn({
  email: 'user@example.com',
  password: 'password123',
});
```

**Sign Out:**
```typescript
const result = await signOut();
```

**Get Current User:**
```typescript
const { data: user, error } = await getCurrentUser();
```

**Reset Password:**
```typescript
const result = await resetPassword('user@example.com');
```

## 🎨 UI Components

### LoginForm

Reusable login form component with:
- Email and password inputs
- Loading states
- Error display
- Switch to signup link

### SignupForm

Reusable signup form component with:
- Full name, email, password, confirm password inputs
- Password validation
- Success message with email verification notice
- Switch to login link

### Header

User info display with:
- User avatar
- User name and email
- Logout button

## 🔒 Security Features

### Password Requirements
- Minimum 6 characters
- Passwords must match on signup

### Session Management
- Automatic session refresh
- Session persistence across page reloads
- Secure token storage

### Protected Routes
- Automatic redirect to login for unauthenticated users
- Loading state during auth check
- Session validation

## 📊 User Flow

### Registration Flow
```
1. User visits /signup
2. Fills out registration form
3. Submits form
4. Supabase creates user account
5. Confirmation email sent
6. User clicks verification link
7. Account activated
8. User can now login
```

### Login Flow
```
1. User visits /login
2. Enters credentials
3. Submits form
4. Supabase validates credentials
5. Session created
6. Redirected to /upload
7. Access to protected routes granted
```

### Logout Flow
```
1. User clicks logout button
2. Session destroyed
3. Redirected to /login
4. Protected routes no longer accessible
```

## 🛠️ Customization

### Adding New Auth Features

**1. Add to Service Layer:**
```typescript
// src/services/auth.service.ts
export const newAuthFeature = async () => {
  // Implementation
};
```

**2. Add to Hook:**
```typescript
// src/hooks/useAuth.ts
const handleNewFeature = useCallback(async () => {
  // Use service layer
}, []);

return {
  // ... existing
  newFeature: handleNewFeature,
};
```

**3. Use in Components:**
```typescript
const { newFeature } = useAuth();
```

### Customizing UI

All form components accept props for customization:
- Loading states
- Error messages
- Success callbacks
- Navigation handlers

## 🐛 Troubleshooting

### Common Issues

**1. "Invalid login credentials"**
- Verify email is confirmed
- Check password is correct
- Ensure user exists in Supabase

**2. "User already registered"**
- Email already exists
- Try password reset
- Or login instead

**3. Session not persisting**
- Check browser cookies enabled
- Verify Supabase URL is correct
- Check for CORS issues

**4. Email not received**
- Check spam folder
- Verify email configuration in Supabase
- Check email service status

## 📚 Best Practices

### Security
- Never store passwords in state
- Always use HTTPS in production
- Implement rate limiting for auth endpoints
- Use strong password requirements

### UX
- Show clear error messages
- Provide loading states
- Auto-focus first input
- Remember user preference (optional)

### Code Organization
- Keep auth logic in service layer
- Use custom hooks for state management
- Separate UI components from logic
- Type everything with TypeScript

## 🔗 Related Documentation

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [React Router Documentation](https://reactrouter.com)
- [Project Architecture](../ARCHITECTURE.md)
- [Development Guide](../DEVELOPMENT.md)

## 📝 Notes

- Email verification is required by default
- Sessions expire after 1 hour (configurable in Supabase)
- Password reset sends email with magic link
- Social auth can be added (Google, GitHub, etc.)
