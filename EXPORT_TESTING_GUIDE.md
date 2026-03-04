# Export Data Feature - Testing Guide

## Quick Start Testing

### Prerequisites
1. Backend server running on port 8000
2. Frontend server running on port 3000
3. User logged in with some conversation history

### Test Scenario 1: Export Format Modal

**Steps:**
1. Navigate to Settings page
2. Click "Privacy & Data" tab
3. Click "Export Data" button

**Expected Result:**
- Modal appears with smooth fade-in animation
- Modal shows three format options:
  - 📄 JSON (Developer format)
  - 📋 PDF (User-friendly report)
  - 📊 CSV (Tabular format)
- Each option has icon, title, and description
- Cancel button at bottom
- Modal is centered on screen

**Pass Criteria:**
✅ Modal opens smoothly
✅ All three options visible
✅ Icons display correctly
✅ Text is readable in both light/dark mode

---

### Test Scenario 2: JSON Export

**Steps:**
1. Open export modal
2. Click "JSON" option

**Expected Result:**
- Modal closes immediately
- Loading state shows briefly
- File downloads automatically
- Success toast appears: "JSON exported successfully (X conversations)"
- File named: `emotiAI-data-export-YYYY-MM-DD.json`

**Verify File Contents:**
```json
{
  "user": {
    "username": "...",
    "email": "...",
    "id": ...
  },
  "preferences": { ... },
  "conversations": [
    {
      "conversation_id": 1,
      "title": "...",
      "created_at": "...",
      "dominant_emotion": "...",
      "average_confidence": 0.XX,
      "messages": [
        {
          "message_id": 1,
          "sender": "user",
          "text": "...",
          "detected_emotion": "...",
          "confidence": 0.XX,
          "timestamp": "..."
        }
      ]
    }
  ],
  "exportDate": "...",
  "note": "..."
}
```

**Pass Criteria:**
✅ File downloads successfully
✅ JSON is valid (can be parsed)
✅ All conversations included
✅ All messages included
✅ Dominant emotion calculated correctly
✅ Average confidence calculated correctly
✅ Pretty-printed (readable)

---

### Test Scenario 3: PDF Export

**Steps:**
1. Open export modal
2. Click "PDF" option

**Expected Result:**
- Modal closes immediately
- Loading state shows briefly
- PDF file downloads automatically
- Success toast appears: "PDF exported successfully (X conversations)"
- File named: `emotiAI-data-export-YYYY-MM-DD.pdf`

**Verify PDF Contents:**
1. **Title Page:**
   - "EmotiAI Data Export Report" (centered, large)
   - Export date

2. **User Information Section:**
   - Username
   - Email
   - User ID

3. **Emotional Summary Section:**
   - Total conversations count
   - Total messages count
   - Average AI confidence percentage
   - Emotion distribution with percentages

4. **Conversation History Section:**
   - Each conversation numbered
   - Conversation title
   - Creation date
   - Dominant emotion with confidence
   - Message count
   - First 3 messages preview
   - "You:" and "AI:" labels
   - Emotion tags for user messages

**Pass Criteria:**
✅ PDF opens without errors
✅ All sections present
✅ Text is readable
✅ No text overflow
✅ Proper page breaks
✅ Professional formatting
✅ Calculations are correct

---

### Test Scenario 4: CSV Export

**Steps:**
1. Open export modal
2. Click "CSV" option

**Expected Result:**
- Modal closes immediately
- Loading state shows briefly
- CSV file downloads automatically
- Success toast appears: "CSV exported successfully (X conversations)"
- File named: `emotiAI-data-export-YYYY-MM-DD.csv`

**Verify CSV Contents:**
1. **Headers:**
   ```
   conversation_id,conversation_title,sender,message,emotion,confidence,timestamp
   ```

2. **Data Rows:**
   - One row per message
   - Conversation ID matches
   - Title in quotes
   - Sender is "user" or "ai"
   - Message text in quotes
   - Emotion or empty
   - Confidence (4 decimals) or empty
   - Timestamp in ISO format

**Open in Spreadsheet:**
- Open in Excel/Google Sheets
- Verify columns align correctly
- Check for proper quote escaping
- Verify special characters display correctly

**Pass Criteria:**
✅ CSV file downloads successfully
✅ Opens in spreadsheet software
✅ All columns present
✅ Data aligned correctly
✅ Quotes escaped properly
✅ Special characters handled
✅ No duplicate rows

---

### Test Scenario 5: Modal Interactions

**Test 5.1: Close on Overlay Click**
1. Open export modal
2. Click outside modal (on dark overlay)

**Expected:** Modal closes

**Test 5.2: Close on Cancel Button**
1. Open export modal
2. Click "Cancel" button

**Expected:** Modal closes

**Test 5.3: Disabled During Export**
1. Open export modal
2. Click any format option
3. Try to click another option immediately

**Expected:** Buttons disabled during export

**Pass Criteria:**
✅ Overlay click closes modal
✅ Cancel button closes modal
✅ Buttons disabled during loading
✅ No double-exports possible

---

### Test Scenario 6: Edge Cases

**Test 6.1: No Conversations**
1. Create new user account
2. Don't create any conversations
3. Try to export

**Expected:**
- Export succeeds
- Conversations array is empty: `[]`
- Toast shows: "exported successfully (0 conversations)"

**Test 6.2: Single Conversation**
1. Create account with 1 conversation
2. Export in all formats

**Expected:**
- All formats work correctly
- Single conversation included
- No errors

**Test 6.3: Many Conversations (100+)**
1. Account with 100+ conversations
2. Export in all formats

**Expected:**
- Export takes 5-10 seconds
- All conversations included
- PDF has multiple pages
- CSV has many rows
- No timeout errors

**Test 6.4: Long Messages**
1. Create conversation with very long messages (500+ characters)
2. Export in all formats

**Expected:**
- JSON: Full text included
- PDF: Text wraps properly, no overflow
- CSV: Text in quotes, no line breaks

**Test 6.5: Special Characters**
1. Create messages with special characters:
   - Quotes: "Hello"
   - Commas: Hello, world
   - Newlines: Hello\nWorld
   - Emojis: 😊🎉
   - Tamil: வணக்கம்
2. Export in all formats

**Expected:**
- JSON: All characters preserved
- PDF: All characters display correctly
- CSV: Quotes escaped, no broken rows

**Pass Criteria:**
✅ No conversations handled gracefully
✅ Single conversation works
✅ Many conversations work (no timeout)
✅ Long messages wrap correctly
✅ Special characters preserved
✅ No data corruption

---

### Test Scenario 7: Dark Mode

**Steps:**
1. Enable dark mode in Settings
2. Navigate to Privacy & Data
3. Open export modal

**Expected:**
- Modal background is dark
- Text is light colored
- Buttons have dark theme styling
- Hover effects work correctly
- All text is readable

**Pass Criteria:**
✅ Modal visible in dark mode
✅ Text readable
✅ Buttons styled correctly
✅ No contrast issues

---

### Test Scenario 8: Mobile Responsive

**Steps:**
1. Open Settings on mobile device (or resize browser to mobile width)
2. Navigate to Privacy & Data
3. Open export modal

**Expected:**
- Modal takes 95% of screen width
- Format buttons stack vertically
- Text is readable
- Buttons are tappable (not too small)
- Modal doesn't overflow screen

**Pass Criteria:**
✅ Modal fits on mobile screen
✅ All buttons accessible
✅ Text readable
✅ No horizontal scroll

---

### Test Scenario 9: Performance

**Test 9.1: Export Speed**
- Small dataset (1-10 conversations): < 1 second
- Medium dataset (10-50 conversations): 1-3 seconds
- Large dataset (50-100 conversations): 3-5 seconds

**Test 9.2: File Sizes**
- JSON: Reasonable size (1-2 KB per message)
- PDF: Reasonable size (5-10 KB per page)
- CSV: Reasonable size (0.5-1 KB per message)

**Test 9.3: Memory Usage**
- No memory leaks
- Browser doesn't freeze
- No console errors

**Pass Criteria:**
✅ Export completes in reasonable time
✅ File sizes are reasonable
✅ No memory leaks
✅ No browser freezing

---

### Test Scenario 10: Error Handling

**Test 10.1: Network Error**
1. Disconnect internet
2. Try to export

**Expected:**
- Error toast appears
- Loading state ends
- Modal can be reopened

**Test 10.2: Backend Down**
1. Stop backend server
2. Try to export

**Expected:**
- Error toast appears
- Graceful failure
- No crash

**Test 10.3: Partial Failure**
1. Simulate API error for one conversation
2. Export should continue with other conversations

**Expected:**
- Valid conversations exported
- Failed conversations skipped
- Success toast shows count of valid conversations

**Pass Criteria:**
✅ Network errors handled gracefully
✅ Backend errors handled gracefully
✅ Partial failures don't break export
✅ User informed of errors

---

## Automated Testing Commands

### Build Test
```bash
cd frontend
npm run build
```
**Expected:** Build succeeds with no errors

### Lint Test
```bash
cd frontend
npm run lint
```
**Expected:** No new linting errors

### Type Check (if using TypeScript)
```bash
cd frontend
npm run type-check
```

---

## Browser Compatibility Testing

Test in the following browsers:

### Desktop
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Edge (latest)
- ✅ Safari (latest)

### Mobile
- ✅ Chrome Mobile (Android)
- ✅ Safari Mobile (iOS)
- ✅ Firefox Mobile (Android)

---

## Accessibility Testing

### Keyboard Navigation
1. Tab to "Export Data" button
2. Press Enter to open modal
3. Tab through format options
4. Press Enter to select format
5. Press Escape to close modal

**Pass Criteria:**
✅ All elements keyboard accessible
✅ Focus indicators visible
✅ Escape key closes modal
✅ Enter key activates buttons

### Screen Reader
1. Use screen reader (NVDA, JAWS, VoiceOver)
2. Navigate to export section
3. Open modal
4. Listen to format descriptions

**Pass Criteria:**
✅ Button labels announced
✅ Format descriptions read
✅ Modal role announced
✅ Close button announced

---

## Regression Testing

Verify these existing features still work:

1. ✅ Profile settings update
2. ✅ Password change
3. ✅ Preferences save
4. ✅ Theme toggle
5. ✅ Account deletion
6. ✅ Navigation between tabs
7. ✅ Other Settings functionality

---

## Security Testing

### Data Privacy
1. ✅ User can only export own data
2. ✅ Authentication required
3. ✅ No data sent to external servers
4. ✅ Client-side processing only

### File Security
1. ✅ No executable code in exports
2. ✅ Proper MIME types
3. ✅ Safe character encoding
4. ✅ No sensitive data in filenames

---

## Sign-Off Checklist

Before marking as complete, verify:

- [ ] All test scenarios pass
- [ ] No console errors
- [ ] No console warnings (new)
- [ ] Build succeeds
- [ ] All formats work correctly
- [ ] Modal interactions work
- [ ] Dark mode works
- [ ] Mobile responsive
- [ ] Performance acceptable
- [ ] Error handling works
- [ ] Browser compatibility confirmed
- [ ] Accessibility verified
- [ ] Regression tests pass
- [ ] Security verified
- [ ] Documentation complete

---

## Known Issues

None at this time.

---

## Support

If you encounter any issues during testing:

1. Check browser console for errors
2. Verify backend is running
3. Check network tab for failed requests
4. Try in different browser
5. Clear browser cache
6. Check file permissions (downloads folder)

---

## Test Results Template

```
Test Date: YYYY-MM-DD
Tester: [Name]
Browser: [Browser Name & Version]
OS: [Operating System]

Test Scenario 1: [PASS/FAIL]
Test Scenario 2: [PASS/FAIL]
Test Scenario 3: [PASS/FAIL]
...

Issues Found:
1. [Description]
2. [Description]

Notes:
[Any additional observations]
```

---

## Conclusion

This comprehensive testing guide ensures the export functionality works correctly across all scenarios, browsers, and devices. Follow each test scenario systematically and document results.
