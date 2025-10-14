# Dynamic Coins System Implementation

## Overview
Implemented a dynamic coin calculation system where admin sets coins per minute rate, and total coins are calculated based on video duration.

## Formula
```
Total Coins = Math.ceil(duration_in_seconds / 60) × coins_per_minute
```

### Example
- Video duration: 10 minutes (600 seconds)
- Coins per minute: 5
- Total coins earned: 10 × 5 = **50 coins**

## Changes Made

### 1. Backend Schema Update (`backend/src/schemas/Video.js`)
- **Added**: `coinsPerMinute` field (default: 5)
- **Deprecated**: `coinsReward` field (kept for backward compatibility)

```javascript
coinsPerMinute: { type: Number, default: 5, required: true }
```

### 2. Backend Routes Update (`backend/src/routes/videos.js`)

#### Video Creation/Update
- Changed from `coinsReward` to `coinsPerMinute` in POST and PATCH endpoints
- Form validation now checks for `coinsPerMinute` instead of `coinsReward`

#### Watch Endpoint (Dynamic Calculation)
```javascript
// Old way
coinsAwarded = video.coinsReward; // Fixed amount

// New way
const minutes = Math.ceil(video.duration / 60);
coinsAwarded = minutes * video.coinsPerMinute; // Dynamic calculation
```

### 3. Frontend Video Watching (`frontend/src/pages/Earn.jsx`)

#### Added Helper Function
```javascript
const calculateTotalCoins = (durationSeconds, coinsPerMinute) => {
  const minutes = Math.ceil(durationSeconds / 60);
  return minutes * coinsPerMinute;
};
```

#### Updated Start Message
Now shows:
- Coins per minute rate
- Total coins for completing the video
- Video duration in minutes

Example: "You will earn 5 coins per minute. Total: 50 coins for completing this 10 minute video."

#### Fixed Video Loop Issue
- Added `playerReady` state to track when YouTube player is initialized
- Skip detection now only activates after:
  1. Player is ready (`playerReady === true`)
  2. Video has played for at least 10 seconds
- This prevents false positives during video initialization

### 4. Admin Video Management (`frontend/src/pages/AdminVideos.jsx`)

#### Form Changes
- Changed "Coins Reward" field to "Coins Per Minute"
- Added real-time total coins preview below input
- Shows calculation: "(Duration ÷ 60) × Coins Per Minute"

#### Video List Display
Now shows:
- Coins per minute rate (e.g., "5 coins/min")
- Total coins calculation (e.g., "Total: 50 coins")

## User Experience

### For Admins
When adding/editing a video:
1. Set video duration (in seconds)
2. Set coins per minute rate
3. See instant preview: "Total: X coins for this video"

### For Clients
When starting a video:
1. See clear message: "You will earn X coins per minute"
2. See total coins they'll earn: "Total: Y coins for completing this Z minute video"
3. Video plays smoothly without false skip detection triggers

## Anti-Cheat Improvements

### Video Loop Fix
**Problem**: Video kept looping between 0-1 seconds, showing skip warning repeatedly.

**Solution**: 
1. Track player ready state
2. Delay initial seek by 1 second
3. Only enable skip detection after 10 seconds of playback
4. Check `playerReady` before tracking

### Skip Detection
- Buffer: 3 seconds (allows for loading/buffering)
- Activation: After 10 seconds of playback
- Prevents: False positives during initialization

## Testing Checklist

### Backend
- [ ] Create new video with coinsPerMinute
- [ ] Update existing video
- [ ] Complete video and verify coins calculation
- [ ] Check transaction record shows correct amount

### Frontend - Admin
- [ ] Add new video with coins per minute
- [ ] See total coins preview while typing
- [ ] Edit existing video
- [ ] View video list showing per-minute rates

### Frontend - Client
- [ ] Start video and see earning message
- [ ] Video plays without looping
- [ ] Skip detection works correctly
- [ ] Complete video and receive calculated coins
- [ ] Check wallet balance updated correctly

## Migration Notes

### Existing Videos
- Old videos with only `coinsReward` will use default `coinsPerMinute: 5`
- Admins should update old videos to set appropriate coins per minute rate

### Backward Compatibility
- `coinsReward` field still exists in schema (not required)
- New videos use `coinsPerMinute` exclusively
- Watch endpoint calculates dynamically regardless of which field was set

## Example Scenarios

### Scenario 1: Short Video
- Duration: 60 seconds (1 minute)
- Rate: 5 coins/min
- **Total**: 1 × 5 = **5 coins**

### Scenario 2: Long Video
- Duration: 900 seconds (15 minutes)
- Rate: 3 coins/min
- **Total**: 15 × 3 = **45 coins**

### Scenario 3: Partial Minute
- Duration: 150 seconds (2.5 minutes)
- Rate: 4 coins/min
- **Total**: Math.ceil(2.5) × 4 = 3 × 4 = **12 coins**

Note: `Math.ceil()` ensures users get credited for partial minutes (rounds up).

## Benefits

1. **Flexible Pricing**: Different rates for different video types
2. **Fair Compensation**: Longer videos = more coins automatically
3. **Admin Control**: Easy to adjust rates without recalculating totals
4. **Transparent**: Clients see exactly how much they'll earn per minute
5. **Scalable**: Easy to change rates globally or per-video category

## Future Enhancements

Possible additions:
- Video categories with default rates
- Bonus multipliers for certain times/days
- Progressive rates (more coins per minute for longer videos)
- Client tier system (premium users earn more per minute)
