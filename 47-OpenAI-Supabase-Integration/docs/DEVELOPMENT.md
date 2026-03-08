# Development Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm 8+
- Git
- Code editor (VS Code recommended)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd 47-OpenAI-Supabase-Integration

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
# Add your n8n webhook URL, Supabase credentials, and other keys

# Required Supabase setup:
# 1. Create a Supabase project at https://supabase.com
# 2. Get project URL and anon key from Settings > API
# 3. Configure email confirmation settings if needed
# 4. Add to .env:
#    VITE_SUPABASE_URL=your_supabase_project_url
#    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Start development server
npm run dev
```

## 📝 Code Style Guidelines

### TypeScript
- Use strict typing (no `any` types)
- Define interfaces for all data structures
- Use type inference when possible
- Export types from dedicated type files

### React Components
- Use functional components with hooks
- Keep components small and focused (< 200 lines)
- Extract complex logic into custom hooks
- Use composition over prop drilling

### Naming Conventions
- **Components**: PascalCase (e.g., `FileUploader`, `DropZone`)
- **Hooks**: camelCase with `use` prefix (e.g., `useFileUpload`)
- **Utils**: camelCase (e.g., `validateFile`, `formatFileSize`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)
- **Types**: PascalCase (e.g., `UploadedFile`, `FileStatus`)

### File Organization
```
feature/
├── index.tsx           # Main component (barrel export)
├── Component.tsx       # Sub-components
├── useFeature.ts       # Custom hooks
├── feature.service.ts  # Service layer
├── feature.utils.ts    # Utility functions
└── feature.types.ts    # Type definitions
```

## 🏗️ Adding New Features

### 1. Define Types
Create types in `src/types/`:
```typescript
// src/types/feature.types.ts
export interface FeatureData {
  id: string;
  name: string;
  status: 'active' | 'inactive';
}
```

### 2. Add Constants
Update `src/config/constants.ts`:
```typescript
export const FEATURE = {
  MAX_ITEMS: 100,
  DEFAULT_STATUS: 'active',
} as const;
```

### 3. Create Utilities
Add utilities in `src/utils/`:
```typescript
// src/utils/feature.utils.ts
export const validateFeature = (data: FeatureData): boolean => {
  // Validation logic
  return true;
};
```

### 4. Build Service Layer
Create service in `src/services/`:
```typescript
// src/services/feature.service.ts
export const fetchFeatureData = async (): Promise<FeatureData[]> => {
  // API call logic
  return [];
};
```

### 5. Create Custom Hook
Add hook in `src/hooks/`:
```typescript
// src/hooks/useFeature.ts
export const useFeature = () => {
  const [data, setData] = useState<FeatureData[]>([]);
  
  // Hook logic
  
  return { data };
};
```

### 6. Build UI Components
Create components in `src/components/`:
```typescript
// src/components/Feature/index.tsx
export const Feature = () => {
  const { data } = useFeature();
  
  return <div>{/* UI */}</div>;
};
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests
```typescript
// Component test example
import { render, screen } from '@testing-library/react';
import { Feature } from './Feature';

describe('Feature', () => {
  it('renders correctly', () => {
    render(<Feature />);
    expect(screen.getByText('Feature')).toBeInTheDocument();
  });
});
```

## 🔍 Code Quality

### Linting
```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

### Type Checking
```bash
# Run TypeScript compiler
npm run typecheck
```

### Pre-commit Checks
- ESLint validation
- TypeScript type checking
- Prettier formatting

## 🎨 Styling Guidelines

### Tailwind CSS
- Use utility classes for styling
- Follow mobile-first approach
- Use consistent spacing scale
- Leverage design tokens

### Example
```tsx
<div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
  {/* Content */}
</div>
```

## 🔧 Common Tasks

### Adding a New API Endpoint
1. Define types in `src/types/`
2. Create service function in `src/services/`
3. Add error handling
4. Create custom hook if needed
5. Use in component

### Creating a Reusable Component
1. Create component file in `src/components/`
2. Define props interface
3. Add JSDoc comments
4. Export from index.tsx
5. Use in parent components

### Adding Environment Variables
1. Add to `.env.example`
2. Update `src/vite-env.d.ts`
3. Access via `import.meta.env.VITE_*`

## 📦 Building for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

## 🐛 Debugging

### React DevTools
- Install React DevTools browser extension
- Inspect component hierarchy
- View props and state

### Console Logging
```typescript
// Development only
if (import.meta.env.DEV) {
  console.log('Debug info:', data);
}
```

### Error Tracking
- Errors caught by ErrorBoundary
- Service layer logs API errors
- Check browser console for details

## 🚀 Deployment

### Environment Setup
1. Set production environment variables
2. Configure build settings
3. Set up CI/CD pipeline

### Build Process
```bash
# Production build
npm run build

# Output in dist/ directory
```

## 📚 Resources

### Documentation
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Tools
- [VS Code](https://code.visualstudio.com/)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)

## 🤝 Contributing

### Pull Request Process
1. Create feature branch
2. Make changes following guidelines
3. Write/update tests
4. Run linting and type checking
5. Submit PR with description

### Commit Messages
Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructuring
- `test:` Adding tests
- `chore:` Maintenance

Example: `feat: add file validation utility`

## ❓ FAQ

### Q: How do I add a new file type?
A: Update `ALLOWED_TYPES` in `src/config/constants.ts`

### Q: How do I change the upload endpoint?
A: Update `VITE_N8N_WEBHOOK_URL` in `.env`

### Q: How do I add new validation rules?
A: Update `validateFile` in `src/utils/file.utils.ts`

### Q: How do I customize error messages?
A: Update `ERROR_MESSAGES` in `src/config/constants.ts`
