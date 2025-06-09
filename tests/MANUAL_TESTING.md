# Manual Testing Guide for Resume Upload Feature

## Prerequisites
1. Ensure the development server is running: `npm run dev`
2. Have a valid DOCX resume file ready for testing
3. Ensure Supabase is configured with proper environment variables

## Test Scenarios

### Test 1: Successful DOCX Upload
**Steps:**
1. Navigate to `http://localhost:3009/dashboard` (or the appropriate port)
2. Log in with valid credentials
3. Find the "Upload Existing Resume" section
4. Click "Upload Resume" button
5. Either drag and drop a DOCX file or click to browse and select a DOCX file
6. Observe the upload progress
7. Wait for successful completion

**Expected Result:**
- Progress bar shows upload progress
- Success message appears
- User is redirected to the resume detail page
- Resume data is parsed and displayed

### Test 2: Invalid File Type
**Steps:**
1. Navigate to dashboard
2. Try to upload a PDF, JPG, or TXT file

**Expected Result:**
- Error message: "Please upload a DOCX file. PDF support is coming soon."
- Upload is rejected
- User can try again

### Test 3: File Too Large
**Steps:**
1. Navigate to dashboard
2. Try to upload a DOCX file larger than 10MB

**Expected Result:**
- Error message: "File size must be less than 10MB."
- Upload is rejected

### Test 4: Unauthenticated Access
**Steps:**
1. Navigate directly to `/api/upload` endpoint or try upload without authentication

**Expected Result:**
- Authentication error
- Upload functionality not accessible

### Test 5: Drag and Drop Interface
**Steps:**
1. Navigate to dashboard
2. Click "Upload Resume" to show upload area
3. Drag a DOCX file from file explorer over the upload area
4. Drop the file

**Expected Result:**
- Visual feedback during drag (border color changes)
- Upload starts automatically on drop
- Progress tracking works properly

### Test 6: Cancel Upload
**Steps:**
1. Start an upload
2. Click "Cancel" button while upload is in progress

**Expected Result:**
- Upload area returns to initial state
- User can start a new upload

## Data Verification

After successful upload, verify in Supabase:
1. Check `resumes` table for new entry
2. Verify `user_id` matches authenticated user
3. Check that `content` field contains parsed data with:
   - `personalInfo` object
   - `experience` array
   - `education` array
   - `skills` array
   - `rawText` string

## Testing Checklist

- [ ] Successful DOCX upload works
- [ ] Invalid file types are rejected
- [ ] Large files are rejected
- [ ] Unauthenticated users cannot upload
- [ ] Drag and drop interface works
- [ ] Progress tracking displays correctly
- [ ] Error messages are user-friendly
- [ ] Success state shows properly
- [ ] Cancel functionality works
- [ ] Data is correctly saved to Supabase
- [ ] User is redirected after successful upload

## Sample DOCX Resume Content

For testing, create a simple DOCX file with content like:

```
John Smith
john.smith@email.com
(555) 123-4567

EXPERIENCE
Software Engineer
ABC Tech Company
January 2020 - Present
Developed web applications using React and Node.js

EDUCATION
Bachelor of Science in Computer Science
State University
Graduated May 2019

SKILLS
JavaScript, React, Node.js, Python, SQL
```

## Known Issues
- PDF support is not yet implemented (shows appropriate error message)
- Text parsing quality depends on DOCX structure
- Complex resume formats may not parse perfectly 