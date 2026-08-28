# TaskBoard v3 — Roles, Secure Auth, Live Updates, Professional UI

Ye pehle wale task-leaderboard-app ka upgraded version hai. Kya naya hai:

**v3 mein naya**: UI/UX ko professional level pe le gaya — proper icon set (lucide-react),
richer color system (har role ka apna solid-color badge), Dashboard mein ek pie chart
(status breakdown), colored stat cards, hover shadows, gradient accents. Emoji ab bhi
kahin nahi hai.

- **Naya authentication system**: team lead ke bheje huay auth code se merge kiya gaya — access
  token + refresh token, refresh tokens database mein hash ho kar store hote hain (revoke ho
  sakte hain), har refresh pe naya token issue hota hai (rotation)
- **7 roles**: Admin, Manager, Project Coordinator, Frontend Developer, Backend Developer,
  QA Engineer, Employee — har role ka apna alag UI hai
- **Socket.io**: task create/update/complete hote hi sab connected users ke screen par turant
  update ho jata hai, page refresh ki zaroorat nahi
- **UI/UX simplify kiya gaya**: koi emoji nahi, clean aur professional design

---

## Roles kaise kaam karte hain

| Role | Kya kar sakta hai | Landing page |
|---|---|---|
| **Admin** | Sab kuch — employees manage, sab tasks dekh/bana sakta hai, leaderboard | Overview (stats) |
| **Manager** | Tasks bana/assign kar sakta hai, sab tasks dekh sakta hai | Overview (stats) |
| **Project Coordinator** | Manager jaisa hi access | Overview (stats) |
| **Frontend Developer** | Sirf apne assigned tasks dekh/complete kar sakta hai | My Tasks |
| **Backend Developer** | Sirf apne assigned tasks dekh/complete kar sakta hai | My Tasks |
| **QA Engineer** | Sirf apne assigned tasks dekh/complete kar sakta hai | My Tasks |
| **Employee** | Sirf apne assigned tasks dekh/complete kar sakta hai | My Tasks |

**Admin aur Manager** dono naye employees add kar sakte hain. Sirf Admin hi kisi ko "Admin"
role de sakta hai — Manager jab account banata hai to Admin role uski dropdown mein nahi
dikhta. Account deactivate/reactivate karna abhi sirf Admin kar sakta hai.

Admin, Manager, aur Project Coordinator — teeno tasks bana kar kisi ko bhi assign kar sakte
hain.

---

## Local setup

### Backend

```bash
cd backend
cp .env.example .env
# .env kholein: DB_NAME, DB_USER, DB_PASSWORD, JWT_SECRET set karein
npm install
npm run seed
npm run dev
```

`npm run seed` 7 demo accounts banayega, ek har role ke liye:

| Email | Password | Role |
|---|---|---|
| admin@company.com | admin123 | Admin |
| manager@company.com | manager123 | Manager |
| coordinator@company.com | coord123 | Project Coordinator |
| ali@company.com | employee123 | Frontend Developer |
| sara@company.com | employee123 | Backend Developer |
| bilal@company.com | employee123 | QA Engineer |
| zainab@company.com | employee123 | Employee |

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

`http://localhost:5173` par different accounts se login kar ke dekhein har role ka UI kaisa
alag hai.

---

## Deployment — Vercel (frontend) + Render (backend)

**Important baat**: Vercel React/frontend apps ke liye bana hai. Hamara backend ek normal,
hamesha-chalne-wala Express server hai (Socket.io ke liye bhi ye zaroori hai) — is tarah ka
server Vercel ke serverless model mein seedha fit nahi hota. Isliye:

- **Frontend** → Vercel pe
- **Backend** → Render pe (free tier available, normal Node server host karta hai)

### Step 1 — Backend deploy karein (Render)

1. [render.com](https://render.com) par GitHub se sign up karein
2. **New > Web Service** → apna GitHub repo select karein → root directory `backend` set karein
3. Build command: `npm install` — Start command: `npm start`
4. Environment variables mein `.env` wali sab values daalein, plus:
   - `NODE_ENV=production`
   - `CLIENT_URL` mein apna Vercel URL daalein (ye Vercel deploy karne ke baad milega — pehle
     ek dummy value se deploy kar dein, baad mein update kar lein)
5. Deploy karein, aur jo URL mile (jaise `https://your-app.onrender.com`) note kar lein

### Step 2 — Frontend deploy karein (Vercel)

1. [vercel.com](https://vercel.com) par GitHub se sign up karein
2. **Add New > Project** → apna repo select karein → root directory `frontend` set karein
3. Environment variable add karein: `VITE_API_URL` = aap ka Render backend URL
4. Deploy karein

### Step 3 — Backend ko frontend ka URL batayein

Render dashboard mein wapas jaake `CLIENT_URL` environment variable ko apne asal Vercel URL se
update karein (jaise `https://your-app.vercel.app`), aur Render ko redeploy karne dein.

### Har choti change ke baad

Team lead ne bola hai — koi bhi choti si change karne se pehle ek deployment kar ke confirm kar
lein ke sab kaam kar raha hai. Workflow:
```bash
git add .
git commit -m "description of change"
git push
```
Agar Vercel aur Render dono GitHub se connected hain, to push karte hi khud ba khud naya
deployment ban jayega — Vercel aur Render dashboard mein deployment status check kar lein.

---

## Socket.io kya hai (jo team lead ne mention kiya)

Socket.io ek library hai jo browser aur server ke beech ek **live connection** banaye rakhti
hai — normal API request ki tarah nahi, jahan aap ko baar baar poochna padta hai "koi update
hai?", balke server khud hi turant bata deta hai jab kuch badalta hai.

Is app mein: jab koi task banata hai, ya koi employee apna task "Complete" karta hai, server
turant sab connected browsers ko bata deta hai — is liye Dashboard, Tasks, aur Leaderboard
pages khud-ba-khud update ho jate hain, kisi ko refresh nahi karna padta.

---

## Naye auth system ki security details (team lead ke code se)

- Login karne par do tokens milte hain: ek **access token** (15 minute ke liye valid, har
  request ke sath jata hai) aur ek **refresh token** (7 din ke liye valid, sirf naya access
  token lene ke liye use hota hai)
- Refresh token database mein **kabhi raw form mein save nahi hota** — sirf uska hash (SHA-256)
  save hota hai
- Har baar jab refresh token use hota hai, purana revoke ho jata hai aur naya issue hota hai
  (rotation) — agar koi purana, already-used token dobara use karne ki koshish kare, request
  reject ho jayegi
- Logout karne par refresh token turant revoke ho jata hai database mein

---

## Folder structure

```
backend/
├── config/
│   ├── db.js           # PostgreSQL connection
│   └── roles.js        # 7 roles + permission groups (single source of truth)
├── models/
│   ├── User.js          # UUID id, role enum, points
│   ├── Task.js
│   └── RefreshToken.js  # hashed refresh tokens
├── middleware/auth.js    # checks Authorization header OR cookie
├── routes/
│   ├── auth.js           # login, refresh-token, logout
│   ├── users.js
│   ├── tasks.js           # emits Socket.io events on change
│   └── leaderboard.js
└── server.js              # Express + Socket.io

frontend/
└── src/
    ├── constants/roles.js  # role labels/colors, kept in sync with backend
    ├── api/
    │   ├── axios.js         # auto refresh-token on 401
    │   └── socket.js         # Socket.io client
    ├── pages/
    │   ├── Dashboard.jsx      # landing page for Admin/Manager/Coordinator
    │   ├── Tasks.jsx           # landing page for working roles
    │   ├── Employees.jsx       # Admin only
    │   └── Leaderboard.jsx
    └── App.jsx                  # role-based routing
```
