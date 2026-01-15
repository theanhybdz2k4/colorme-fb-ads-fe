# Facebook Ads Frontend Setup Guide

## Environment Variables

Create `.env.development` and `.env.production` files in the `facebook-ads-frontend` directory:

### `.env.development`
```
VITE_API_URL=http://localhost:3000/api/v1
```

### `.env.production`
```
VITE_API_URL=https://facebook-ads-sever-production.up.railway.app/api/v1
```

Or set your production backend URL accordingly.

## Backend Configuration

- **Port**: Default 3000 (configurable via `PORT` env var)
- **Global Prefix**: `api/v1`
- **CORS**: Allows `http://localhost:5173` (Vite default), `http://localhost:3000`, `http://localhost:3001`, and `FRONTEND_URL` in production

## API Changes Summary

### Updated API Routes

1. **Ad Accounts** (`adAccounts.api.ts`)
   - Added `get(id)` - Get single ad account
   - Added `assignBranch(id, branchId)` - Assign branch to ad account
   - Updated `list()` to accept `accountStatus` and `search` query params

2. **FB Accounts** (`fbAccounts.api.ts`)
   - Added `get(id)` - Get single FB account

3. **Campaigns** (`campaigns.api.ts`)
   - Added `get(id)` - Get single campaign

4. **Ads** (`ads.api.ts`)
   - Added `get(id)` - Get single ad

5. **Insights** (`insights.api.ts`)
   - Added `getAdAnalytics(adId, dateStart?, dateEnd?)` - Get ad analytics
   - Added `getAdHourly(adId, date?)` - Get hourly insights
   - Added `sync(dto)` - Sync insights

6. **Telegram Settings** (`settings.api.ts`)
   - Removed legacy routes: `getChatIds`, `refreshChatIds`, `addChatId`, `sendTest`
   - Updated `userTelegramBotApi` to match backend routes
   - Removed `migrateSubscribers` route (no longer exists in backend)

### Response Format

All backend responses are wrapped in:
```json
{
  "message": "Success",
  "statusCode": 200,
  "result": <actual_data>
}
```

Frontend API clients handle this automatically with `data.result || data.data || data` pattern.

### Authentication

- Uses Bearer token authentication
- Tokens stored in `localStorage` as `accessToken` and `refreshToken`
- Automatic token refresh on 401 errors
- Token refresh endpoint: `POST /auth/refresh`

## Running the Application

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Set up environment variables (see above)

3. Start development server:
```bash
npm run dev
# or
yarn dev
```

4. Frontend will run on `http://localhost:5173` (Vite default)

## Testing

Ensure backend is running on the configured port (default 3000) before starting frontend.

Test flows:
- ✅ Login/Register
- ✅ Load ad accounts, campaigns, ads
- ✅ View insights and analytics
- ✅ Configure cron settings
- ✅ Manage Telegram bots

