# 🚀 Quick Start Guide - Angular 17 3PC Platform

## ⚡ Fast Setup

### Step 1: Navigate to Project
```bash
cd /app/angular-frontend
```

### Step 2: Install Dependencies (if not already done)
```bash
yarn install
```

### Step 3: Start Development Server
```bash
ng serve --host 0.0.0.0 --port 4200 --poll=2000
```

Or use the provided script:
```bash
./start.sh
```

### Step 4: Access the Application
```
http://localhost:4200
```

---

## 📝 First Time User Flow

### 1. Register a New Account
- Navigate to: `http://localhost:4200/register`
- Fill in: Name, Email, Password
- Select Role: User, Reviewer, or Admin
- Click "Register"

### 2. Login
- Navigate to: `http://localhost:4200/login`
- Enter your email and password
- Click "Login"

### 3. Explore the Dashboard
After login, you'll be redirected to `/dashboard` where you can:
- View statistics
- Access quick actions
- Navigate to different sections

---

## 📁 Main Features & Routes

### Authentication
- **Register**: `/register`
- **Login**: `/login`
- **Profile**: `/profile`

### Documents
- **Upload Document**: `/documents/upload`
- **View Documents**: `/documents`

### Audio Processing
- **Upload Audio**: `/audio/upload`
- **View Audio Files**: `/audio`
- **Download Processed**: `/audio/download`
- **Speaker Mapping**: `/audio/speaker-mapping/:id`

### Settings
- **User Settings**: `/settings/user`
- **System Settings**: `/settings/system` (Admin only)
- **Audit Logs**: `/settings/audit-logs`

### Admin (Admin Role Required)
- **Admin Dashboard**: `/admin`
- **User Management**: `/admin/users`
- **User Details**: `/admin/users/:id`

---

## 🔑 Key Commands

### Development
```bash
# Start dev server
ng serve

# Start with specific host and port
ng serve --host 0.0.0.0 --port 4200

# Start with file watching (for containers)
ng serve --poll=2000
```

### Building
```bash
# Development build
ng build

# Production build
ng build --configuration production

# Production build with stats
ng build --configuration production --stats-json
```

### Code Quality
```bash
# Lint code
ng lint

# Format code (if prettier is configured)
npm run format
```

---

## 🎯 Testing the Application

### 1. Test Authentication
1. Register a new user
2. Login with credentials
3. View profile
4. Update profile settings
5. Logout

### 2. Test Document Management
1. Upload a PDF or DOCX file (max 150MB)
2. Select document type (SOP, Script, etc.)
3. View document in list
4. Check status and RAG enablement

### 3. Test Audio Processing
1. Upload an audio file (MP3, MP4, or WAV - max 150MB)
2. Choose one of three options:
   - No reference document (RAG only)
   - Upload new reference document
   - Use existing document
3. Wait for processing
4. Note the session ID for download
5. View audio in list

### 4. Test Downloads
1. Go to `/audio/download`
2. Enter the session ID from audio processing
3. Click "Download with Transcription"
4. Or click "Download with Diarization"

### 5. Test Speaker Mapping
1. Go to audio list
2. Click "Speakers" on any audio file
3. Add speaker mappings (label → name)
4. View existing mappings

### 6. Test Admin Features (Admin Role Required)
1. Go to `/admin`
2. View dashboard statistics
3. Click "Manage Users"
4. View/edit user details
5. Check audit logs

---

## 🐛 Common Issues & Solutions

### Issue 1: Port 4200 Already in Use
```bash
# Use different port
ng serve --port 4201
```

### Issue 2: Node Modules Not Found
```bash
cd /app/angular-frontend
yarn install
```

### Issue 3: Build Errors
```bash
# Clear cache and rebuild
rm -rf node_modules dist .angular
yarn install
ng build
```

### Issue 4: Backend Not Responding
- Check if Django backend is running on `http://localhost:8000`
- Verify CORS settings in Django
- Check environment configuration

### Issue 5: CORS Errors
Ensure your Django backend has proper CORS configuration:
```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:4200",
]
```

---

## 📊 File Size Limits

- **Documents**: Max 150MB (PDF, DOCX)
- **Audio**: Max 150MB (MP3, MP4, WAV)
- **Text Files**: Max 50MB (for reference documents)

---

## 🔐 User Roles

### User
- Upload documents and audio
- View own uploads
- Download processed files
- Manage profile

### Reviewer
- All User permissions
- Review processing results
- Provide feedback

### Admin
- All permissions
- Manage all users
- Access admin dashboard
- Configure system settings
- View audit logs

---

## 💡 Tips & Best Practices

1. **Always check file types before upload** - Only specified formats are supported
2. **Note the session ID after processing** - You'll need it for downloads
3. **Use existing documents** when possible to save processing time
4. **Map speakers immediately after diarization** for better organization
5. **Regular backups** - Export important data regularly

---

## 🎨 UI Features

### Responsive Design
- Works on desktop, tablet, and mobile
- Adaptive navigation
- Touch-friendly controls

### Real-time Feedback
- Loading spinners during operations
- Progress bars for uploads
- Success/error messages
- Form validation

### Accessibility
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus management

---

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## 🔄 Updating the Application

### Pull Latest Changes
```bash
cd /app/angular-frontend
git pull origin main  # If using git
```

### Update Dependencies
```bash
yarn upgrade
```

### Rebuild
```bash
ng build --configuration production
```

---

## 📞 Support

For issues or questions:
1. Check the main documentation: `/app/ANGULAR_PROJECT_DOCUMENTATION.md`
2. Review Angular docs: https://angular.io/docs
3. Check console for errors (F12 in browser)

---

## ✅ Success Checklist

- [ ] Dependencies installed (`yarn install`)
- [ ] Development server running (`ng serve`)
- [ ] Can access http://localhost:4200
- [ ] Can register a new user
- [ ] Can login successfully
- [ ] Can upload documents
- [ ] Can upload audio files
- [ ] Can download processed files
- [ ] Backend API is accessible
- [ ] No console errors

---

## 🎉 You're All Set!

Your Angular 17 3PC Platform is ready to use. Start by registering an account and exploring all the features!

**Enjoy building with Angular! 🚀**
