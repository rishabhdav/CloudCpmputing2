# Serverless File Upload and Processing System (No AWS)

A beginner-friendly full-stack project for college/viva.

## Stack (all free tiers)
- **Frontend:** React + Vite
- **Backend:** Node.js + Express REST API
- **Cloud Storage:** Cloudinary (free plan)
- **Database:** MongoDB Atlas (free M0 cluster)
- **Deployment:**
  - Backend: Render free web service
  - Frontend: Vercel or Netlify free static hosting

## Features
1. Upload image or PDF.
2. Store files in cloud storage (Cloudinary).
3. Auto-process upload:
   - Image -> compressed/resized with Sharp.
   - PDF -> basic text extraction with pdf-parse.
4. Save metadata in MongoDB Atlas.
5. User signup and login.
6. Display uploaded files in frontend list.
6. View/Download files using cloud URL.
7. Validation for type and max size (5 MB).
8. Bonus included:
   - Drag-and-drop upload UI.
   - Upload progress bar.

---

## Project structure

```bash
CloudCpmputing/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   └── services/
│   ├── .env.example
│   └── package.json
└── sample-data/
    └── sample-metadata.json
```

---

## Step-by-step local setup

### 1) Clone and install backend
```bash
cd backend
npm install
```

### 2) Configure backend env
Create `backend/.env` from `backend/.env.example`:
```env
PORT=5000
NODE_ENV=development
AUTH_TOKEN_SECRET=replace_with_a_long_random_secret
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/fileProcessor?retryWrites=true&w=majority
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3) Start backend
```bash
npm run dev
```

### 4) Install frontend
Open new terminal:
```bash
cd frontend
npm install
```

### 5) Configure frontend env
Create `frontend/.env` from `frontend/.env.example`:
```env
VITE_API_BASE_URL=http://localhost:5000
```

### 6) Start frontend
```bash
npm run dev
```
Open the shown localhost URL in browser.

---

## REST API

### Health check
- `GET /api/health`

### Signup
- `POST /api/auth/signup`
- JSON body: `name`, `email`, `password`

### Login
- `POST /api/auth/login`
- JSON body: `email`, `password`

### Current user
- `GET /api/auth/me`
- Header: `Authorization: Bearer <token>`

### Upload + process file
- `POST /api/files/upload`
- Form-data key: `file`
- Accepted mime types: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`
- Max file size: 5 MB
- Header: `Authorization: Bearer <token>`

### List files
- `GET /api/files`
- Header: `Authorization: Bearer <token>`

## User-specific behavior
- Users create an account with name, email, and password.
- Login returns a token stored in browser `localStorage`.
- Protected file routes only return or delete files belonging to the logged-in user.
- Images and PDFs uploaded by one account are not shown to other accounts.

---

## Deployment guide (free hosting)

## A) Deploy backend on Render (free)
1. Push repo to GitHub.
2. Create new **Web Service** on Render.
3. Root directory: `backend`.
4. Build command: `npm install`.
5. Start command: `npm start`.
6. Add env variables from `backend/.env.example`.
7. Deploy and copy the Render URL.

## B) Deploy frontend on Vercel (free)
1. Import GitHub repo in Vercel.
2. Set root directory to `frontend`.
3. Add env variable:
   - `VITE_API_BASE_URL=https://your-render-backend-url`
4. Deploy.

> You can use Netlify instead of Vercel with the same frontend env variable.

---

## Free services setup links
- Cloudinary sign-up: https://cloudinary.com/users/register/free
- MongoDB Atlas sign-up: https://www.mongodb.com/cloud/atlas/register
- Render: https://render.com/
- Vercel: https://vercel.com/
- Netlify: https://www.netlify.com/

---

## Basic viva explanation points
- Why serverless-ish: file processing happens per request in stateless backend; storage and DB are managed cloud services.
- Why Cloudinary: easy free media storage + delivery URLs.
- Why Mongo Atlas: free hosted NoSQL for metadata.
- Validation: done in both frontend and backend for safety.
- Async flow: upload -> process -> cloud storage -> metadata save -> frontend list refresh.

---

## Notes
- Keep your API keys secret. Never commit real `.env` files.
- If PDF has scanned images only, extracted text may be empty (OCR not included).
- Cloudinary free plan limits apply.
