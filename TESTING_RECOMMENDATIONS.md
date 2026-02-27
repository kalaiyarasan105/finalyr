# 🧪 Testing the Recommendation System

## Quick Test Methods

### Method 1: Test Button (Easiest)
1. Login to the application
2. Look at the left sidebar
3. Click the **"🧪 Test Recommendations"** button
4. Modal should appear immediately with 5 category cards

### Method 2: Send Sad Message
1. Login to the application
2. Start a new conversation
3. Type: **"I'm feeling really sad today"**
4. Press Send
5. Wait for emotion detection
6. Modal should appear automatically

### Method 3: Other Negative Emotions
Try these messages to trigger recommendations:
- **Anger**: "I'm so angry right now"
- **Fear**: "I'm scared and anxious"
- **Disgust**: "This makes me feel disgusted"

## What Should Happen

### 1. Emotion Detection
- Text emotion: sadness (96%)
- Face emotion: sad (72%)
- Final Result: Sadness (77%)
- ✅ This part is working!

### 2. Recommendation Trigger
After emotion detection, you should see:
- ✅ Toast notification: "💡 We have recommendations to help with sadness!"
- ✅ Modal overlay appears (dark background)
- ✅ Background color changes to therapeutic blue
- ✅ 5 category cards appear with animations

### 3. Category Cards
You should see these 5 options:
1. 🌿 **Siddha Remedies** - Traditional Tamil medicine
2. 📖 **Tamil Wisdom** - Chennai idioms and proverbs
3. ✨ **Motivational Quotes** - Thirukkural, Bharathiyar & more
4. 🎵 **Music Therapy** - Carnatic ragas & devotional songs
5. 🌟 **All Recommendations** - Get everything

### 4. Click a Category
- Click any card
- Recommendations should load
- You'll see specific suggestions for that category
- Each has a 👍/👎 feedback button

## Debugging

### Check Browser Console
Press F12 and look for these logs:
```
Detected emotion: sadness
Should trigger recommendations: true
triggerRecommendations called with emotion: sadness
Color theme response: {...}
Recommendation modal should now be visible, showRecommendations: true
```

### If Modal Doesn't Appear

1. **Check if backend is running**:
   ```bash
   curl http://localhost:8000/health
   ```

2. **Check if color theme endpoint works**:
   ```bash
   curl http://localhost:8000/api/recommendations/color-theme/sadness
   ```

3. **Check browser console for errors**:
   - Press F12
   - Go to Console tab
   - Look for red errors

4. **Check Network tab**:
   - Press F12
   - Go to Network tab
   - Send a sad message
   - Look for `/api/recommendations/color-theme/sadness` request
   - Check if it returns 200 OK

### Common Issues

#### Issue: "Cannot connect to server"
**Solution**: Make sure backend is running on port 8000
```bash
cd backend
python start.py
```

#### Issue: "401 Unauthorized"
**Solution**: Login again, token might have expired

#### Issue: Modal appears but no recommendations
**Solution**: Check if database has seed data
```bash
cd backend
python migrate_recommendations.py
```

#### Issue: Background color doesn't change
**Solution**: Check if ColorTherapy component is wrapping the app (it is!)

## Expected Flow

```
User sends sad message
    ↓
Emotion detected: sadness (77%)
    ↓
triggerRecommendations('sadness') called
    ↓
Fetch color theme from API
    ↓
Set showRecommendations = true
    ↓
Modal appears with 5 categories
    ↓
Background changes to therapeutic blue
    ↓
User clicks category (e.g., Siddha)
    ↓
Fetch recommendations from API
    ↓
Display Siddha remedy cards
    ↓
User can read, expand, and give feedback
```

## Test Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000/3001
- [ ] Can login successfully
- [ ] Can send messages
- [ ] Emotion detection works
- [ ] Test button shows modal
- [ ] Sad message triggers modal
- [ ] 5 category cards appear
- [ ] Background color changes
- [ ] Can click categories
- [ ] Recommendations load
- [ ] Feedback buttons work
- [ ] Can close modal

## Success Indicators

✅ Console shows: "triggerRecommendations called"
✅ Console shows: "Recommendation modal should now be visible"
✅ Toast appears: "💡 We have recommendations..."
✅ Modal overlay visible (dark background)
✅ 5 colorful category cards visible
✅ Background has blue gradient
✅ Smooth animations

## Need More Help?

1. Check console logs (F12 → Console)
2. Check network requests (F12 → Network)
3. Verify backend is running: http://localhost:8000/docs
4. Try the test button first (easiest way)
