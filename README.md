# 🔗 QR Share

**Share text and files instantly via QR codes with optional password protection**

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase)](https://supabase.com/)

---

## ✨ Features

- **📝 Text Message Sharing** - Share unlimited text instantly via QR code
- **📁 File Upload Support** - Upload PDFs, images, videos, audio, and documents (up to 50MB)
- **🔒 Password Protection** - Secure your content with SHA-256 encrypted passwords
- **📱 QR Code Generation** - High error correction for reliable scanning
- **📄 A4 PDF Download** - Print-ready QR codes for physical sharing
- **📋 One-Click Copy** - Instantly copy shareable links
- **🎨 Modern UI** - Clean, responsive design that works on all devices

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI Framework |
| **TypeScript** | Type Safety |
| **Vite** | Build Tool |
| **Tailwind CSS** | Styling |
| **shadcn/ui** | UI Components |
| **Supabase** | Backend & Storage |
| **QRCode.js** | QR Generation |
| **jsPDF** | PDF Export |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd qr-share

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 📖 Usage

### Share Text Messages
1. Select the "Text" tab
2. Enter your message (no character limit)
3. Optionally enable password protection
4. Click "Generate QR Code"
5. Download PDF or copy the link

### Share Files
1. Select the "File" tab
2. Drag & drop or click to upload a file
3. Optionally set a password
4. Click "Upload & Generate QR"
5. Share the QR code or link

### Password Protection
- Enable the password toggle before generating
- Recipients must enter the correct password to view content
- Passwords are securely hashed using SHA-256

---

## 📸 Screenshots

| Home Page | QR Result |
|-----------|-----------|
| Upload text or files | Generated QR with download options |

---

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

## 📬 Contact

Have questions or suggestions? Feel free to reach out on [Linkdin](https://www.linkedin.com/in/sunny-kumar-dubey-375082296/)
