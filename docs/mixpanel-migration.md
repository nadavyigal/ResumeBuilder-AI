# Mixpanel Migration Guide

This guide documents the migration from PostHog to Mixpanel analytics.

## Phase 1: Setup & Configuration ✅

### Environment Variables

Add the following to your `.env.local` file:

```env
# Mixpanel Configuration (New)
NEXT_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_token_here

# Keep existing PostHog variables during migration
POSTHOG_PUBLIC_KEY=your_posthog_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### Files Created/Modified

1. **`src/lib/mixpanel.ts`** - Mixpanel configuration and initialization
2. **`src/components/MixpanelProvider.tsx`** - React provider for Mixpanel
3. **`src/app/test-mixpanel/page.tsx`** - Test page for Mixpanel functionality
4. **`src/lib/env.ts`** - Added `NEXT_PUBLIC_MIXPANEL_TOKEN` environment variable
5. **`vitest.setup.ts`** - Added Mixpanel mocks for testing
6. **`jest.setup.js`** - Added Mixpanel mocks for testing
7. **`vitest.config.ts`** - Added Mixpanel token to test environment

### Testing the Setup

1. Add your Mixpanel token to `.env.local`:
   ```env
   NEXT_PUBLIC_MIXPANEL_TOKEN=your_actual_mixpanel_token
   ```

2. Restart your development server:
   ```bash
   npm run dev
   ```

3. Visit the test page: `http://localhost:3000/test-mixpanel`

4. Check your Mixpanel dashboard to see events being tracked

### Next Steps

- [ ] Phase 2: Provider Migration (replace PostHogProvider with MixpanelProvider)
- [ ] Phase 3: Event Tracking Migration (replace posthog.capture with mixpanel.track)
- [ ] Phase 4: Testing & Cleanup (remove PostHog dependencies)

## API Reference

### Mixpanel Functions

```typescript
import { mixpanel } from '@/lib/mixpanel'

// Track an event
mixpanel.track('Event Name', {
  property1: 'value1',
  property2: 'value2'
})

// Identify a user
mixpanel.identify('user-id')

// Set user properties
mixpanel.people.set({
  $name: 'John Doe',
  $email: 'john@example.com',
  plan: 'premium'
})
```

### Migration Mapping

| PostHog | Mixpanel | Notes |
|---------|----------|-------|
| `posthog.capture()` | `mixpanel.track()` | Same functionality |
| `posthog.identify()` | `mixpanel.identify()` | Same functionality |
| `posthog.people.set()` | `mixpanel.people.set()` | Same functionality |
| `usePostHog()` | Direct import | No React hook needed |

## Troubleshooting

### Common Issues

1. **"Mixpanel token not found" warning**
   - Ensure `NEXT_PUBLIC_MIXPANEL_TOKEN` is set in `.env.local`
   - Restart the development server after adding the variable

2. **Events not appearing in Mixpanel dashboard**
   - Check browser console for errors
   - Verify token is correct
   - Ensure you're looking at the right project in Mixpanel

3. **Test page shows "Not Loaded"**
   - Check that the token is properly set
   - Verify the Mixpanel SDK is installed (`npm install mixpanel-browser`)

### Debug Mode

Mixpanel debug mode is enabled in development. Check the browser console for:
- "Mixpanel loaded successfully" message
- Event tracking logs
- Any error messages 