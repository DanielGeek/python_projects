# Usage Limits System

## Overview

The usage limits system tracks and enforces limits on document uploads and transcript extractions for free-tier users. Pro users have unlimited access.

## Database Schema

### `user_limits` Table

```sql
CREATE TABLE user_limits (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  documents_used INTEGER DEFAULT 0,
  transcripts_used INTEGER DEFAULT 0,
  documents_limit INTEGER DEFAULT 3,
  transcripts_limit INTEGER DEFAULT 3,
  is_pro BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## Free Tier Limits

- **Documents**: 3 uploads
- **Transcripts**: 3 extractions

## Pro Tier

- **Documents**: Unlimited (-1)
- **Transcripts**: Unlimited (-1)

## Implementation

### 1. Hook: `useUserLimits`

```typescript
const { limits, incrementUsage, canPerformAction } = useUserLimits();
```

**Returns:**
- `limits`: Current usage and limits data
- `incrementUsage(type)`: Increment usage counter
- `canPerformAction(type)`: Check if action is allowed
- `refreshLimits()`: Refresh limits from database
- `resetUsage()`: Reset usage counters (admin/testing)

### 2. Types

```typescript
interface UsageLimits {
  documents: {
    used: number;
    limit: number;
    remaining: number;
    hasReachedLimit: boolean;
  };
  transcripts: {
    used: number;
    limit: number;
    remaining: number;
    hasReachedLimit: boolean;
  };
  isPro: boolean;
}
```

### 3. Integration Example

**Upload Component:**
```typescript
const { limits, incrementUsage, canPerformAction } = useUserLimits();

const handleUpload = async () => {
  // Check if user can upload
  if (!canPerformAction('documents')) {
    // Show limit reached UI
    return;
  }
  
  // Perform upload
  await uploadFile();
  
  // Increment usage
  await incrementUsage('documents');
};
```

**Transcript Component:**
```typescript
const { limits, incrementUsage, canPerformAction } = useUserLimits();

const handleExtract = async () => {
  // Check if user can extract
  if (!canPerformAction('transcripts')) {
    // Show limit reached UI
    return;
  }
  
  // Extract transcript
  await extractTranscript();
  
  // Increment usage
  await incrementUsage('transcripts');
};
```

## UI Components

### Navbar Display

Shows real-time usage counts:
- Green/Blue: Normal usage
- Red: Limit reached
- Infinity symbol: Pro users

### LimitReached Component

Displays when limit is reached:
```typescript
<LimitReached 
  type="documents" 
  used={3} 
  limit={3} 
/>
```

## Migration

Run the migration to create the `user_limits` table:

```bash
# Using Supabase CLI
supabase db push

# Or apply manually in Supabase Dashboard
# SQL Editor > New Query > Paste migration content
```

## Testing

### Reset Usage (Development Only)

```typescript
const { resetUsage } = useUserLimits();
await resetUsage();
```

### Simulate Pro User

Update in Supabase Dashboard:
```sql
UPDATE user_limits 
SET is_pro = true 
WHERE user_id = 'your-user-id';
```

## Security

- Row Level Security (RLS) enabled
- Users can only view/update their own limits
- Automatic record creation on first use
- Timestamp tracking for audit

## Future Enhancements

- [ ] Monthly limit resets
- [ ] Usage analytics dashboard
- [ ] Email notifications at 80% usage
- [ ] Bulk operations limit
- [ ] API rate limiting integration
