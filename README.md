# 🛡️ CadetConnect — NCC Cadets & Defence Aspirant Professional Platform

**CadetConnect** is India's premier, production-grade professional ecosystem built specifically for **National Cadet Corps (NCC) Cadets**, **Armed Forces Aspirants**, **SSB Mentors**, and **Military Veterans**.

It unifies real-time social feeds, direct messaging, regimental verification, peer mentorship, a centralized defence knowledge hub, AI-driven SSB guidance, and a comprehensive real-time **Exam Eligibility Engine** covering all major Indian government, civil service, defence, banking, and railway recruitment examinations.

---

## 📸 Real-Time Community Feed & File Chooser
- **LinkedIn / Instagram Style Posting**: Create posts with text formatting, custom tags, and category selection (*NCC*, *Defence Preparation*, *Success Stories*, *Camps*, *Study Notes*, *Mentorship*, *Events*).
- **Direct Device File Upload**: Instant file picker ("Choose File from Device") supporting image, PDF, and video attachments via Node.js `multer` backend storage with live thumbnail previewing.
- **Real-Time WebSocket Sync**: Instant live push broadcasts across all online cadets for new posts, appreciations ("salute/respect"), comments, and status updates without page refreshing.

---

## 🎯 Comprehensive Exam Eligibility Coverage

CadetConnect includes an automated **Eligibility Evaluation Engine** (`eligibilityEngine.js`) that analyzes candidate age, educational qualifications, stream/subjects, NCC certificate grades, category relaxations, and physical parameters against official gazette notifications:

| Category | Examinations Covered |
| :--- | :--- |
| **Defence Entries** | **UPSC NDA & NA**, **UPSC CDS** (IMA, INA, AFA, OTA), **IAF AFCAT** (Flying, Technical, Ground Duty), **Indian Army NCC Special Entry** (57th/58th Course), **Agniveer** (Army, Navy, Air Force), **Indian Coast Guard** (Navik DB/GD, Yantrik, Assistant Commandant), **CAPF Assistant Commandant (AC)**. |
| **Civil Services & PSCs** | **UPSC Civil Services Examination (CSE)** (IAS, IPS, IFS, IRS), **OPSC / OAS** & State Public Service Commissions (State PSCs). |
| **SSC Examinations** | **SSC CGL** (Assistant Section Officer, Income Tax Inspector, JSO, AAO), **SSC CHSL** (LDC, DEO), **SSC GD Constable**, **SSC CPO** (Sub-Inspector in Delhi Police & CAPFs), **SSC MTS**, **SSC JE**. |
| **Banking & Finance** | **IBPS PO / Clerk**, **SBI PO / Clerk**, **RBI Grade B / Assistant**, **NABARD Grade A**, **LIC AAO**. |
| **Railways (RRB)** | **RRB NTPC** (Graduate & Under-Graduate), **RRB Group D**, **RRB ALP** (Assistant Loco Pilot), **RRB JE**. |
| **Uniformed & Police** | **State Police Constable & Sub-Inspector**, **Delhi Police SI/Constable**, **CISF**, **BSF**, **CRPF**, **SSB**, **ITBP**. |
| **Teaching & Others** | **CTET** (Paper I & II), **State TET**, **ISRO / DRDO Technical Assistant**. |

### Eligibility Math & Feature Rules Evaluated
- **Exact Age Math**: Precise fractional age calculation based on target cut-off reference dates.
- **Category Relaxation**: Automated calculation of upper-age relaxations for OBC (+3 yrs), SC/ST (+5 yrs), Ex-Servicemen (service duration + 3 yrs), and NCC Certificate holders.
- **Stream & Subject Rules**: Verification of 10+2 Physics & Math requirements for Air Force / Navy / Technical entries and graduation percentage rules.
- **Attempt Limits**: Enforcement of UPSC CSE attempt bounds (General: 6, OBC: 9, SC/ST: Unlimited).

---

## 🌟 Key Platform Features

- **🪖 Digital Cadet Identity & Journey Timeline**: Log ranks (Cadet, Corporal, Sergeant, JUO, SUO), CATC/TSC/RDC camp achievements, firing scores, and visual journey milestones.
- **🔐 Regimental Privacy Vault**: Regimental numbers (e.g., `OD/22/SD/A/104921`) are encrypted and strictly hidden from public profiles to prevent identity spoofing.
- **📚 Centralized Defence Knowledge Hub**: Peer-reviewed manuals for .22 Deluxe Rifle, 7.62mm SLR, 5.56mm INSAS Rifle, drill cadence rules, map reading grid references, and SSB Stage I & II sets.
- **💬 Real-Time Direct Messaging**: LinkedIn-style private messaging with automatic mentor/senior cadet starter conversations and WebSocket push delivery.
- **🤖 Veer AI Mentor**: 24/7 AI chatbot powered by Google Gemini AI and an integrated fallback defence knowledge engine for instant queries.
- **🛡️ Admin Desk & Regimental Verification**: Queue system where admins audit submitted regimental credentials and issue official verification badges (*Verified Cadet*, *Verified Aspirant*, *Verified Mentor*).
- **🔑 Multi-Method Authentication**: Login via **Google OAuth**, **Mobile Number OTP**, or **Email/Password**.

---

## 🔒 Security Hardening Architecture

CadetConnect enforces secure-by-default software engineering standards:

1. **Centralized JWT Architecture**: Unified secret key (`auth.js`) shared across all route modules (`authRoutes`, `feedRoutes`, `eligibilityRoutes`), preventing token verification errors.
2. **Helmet HTTP Headers**: Protection against XSS, clickjacking, and MIME-sniffing.
3. **Express Rate Limiting**: Dedicated rate limiters on `/api/auth/login` (50 req/15min) and `/api/auth/send-otp` (10 req/10min) to prevent brute-force attacks.
4. **Input Size Hardening**: 1MB payload limits on `express.json()` and `express.urlencoded()` to prevent Denial of Service (DoS) memory consumption.
5. **Atomic Database Writes**: Asynchronous debounced file persistence using atomic temporary file swapping (`.tmp.json` -> `.json`) to prevent database file corruption.
6. **Strict OTP Verification**: No backdoor codes; OTPs are generated cryptographically, validated strictly, and automatically purged via periodic cleanup timers.

---

## 🏗️ How to Scale CadetConnect to Enterprise Production (Instagram / LinkedIn Scale)

To transition CadetConnect from a single-node architecture to an enterprise-grade, high-concurrency cloud platform serving millions of cadets, follow this architectural blueprint:

```
                                  [ Cloudflare / CloudFront CDN ]
                                                 │
                                       [ NGINX API Gateway ]
                                                 │
                   ┌─────────────────────────────┼─────────────────────────────┐
                   ▼                             ▼                             ▼
       [ Auth & Profile Service ]       [ Feed & Upload Service ]      [ Real-Time WS Gateway ]
                   │                             │                             │
         ┌─────────┴─────────┐         ┌─────────┴─────────┐         ┌─────────┴─────────┐
         ▼                   ▼         ▼                   ▼         ▼                   ▼
  (PostgreSQL Cluster)   (Redis Cache) (Amazon S3 / CDN)  (Kafka/RabbitMQ) (Redis Pub/Sub) (K8s Pods)
```

### 1. Database Layer Migration (Relational & Document DBs)
- **Primary Relational Store (PostgreSQL)**: Migrate user records, regimental verification vaults, cadet profiles, and exam eligibility definitions to PostgreSQL with Row-Level Security (RLS) and Read Replicas.
- **Feed & Timeline Store (Cassandra / MongoDB)**: Store high-volume social feed posts, comments, appreciations, and activity timelines in a distributed document or wide-column store indexed by time and category.

### 2. Real-Time Horizontal Scaling (Redis Pub/Sub + WebSockets)
- **WebSocket Gateway Cluster**: Deploy WebSocket servers behind an NGINX / AWS ALB load balancer using sticky sessions or IP-hash routing.
- **Redis Pub/Sub Bus**: Connect all WebSocket nodes to a shared Redis Cluster. When a user posts or sends a message on Node A, Redis broadcasts the event to Node B, delivering real-time notifications to connected clients regardless of server node.

### 3. Media & File Upload Processing (AWS S3 + CloudFront CDN)
- **Direct S3 Uploads**: Replace local disk storage with AWS S3 pre-signed URLs. The browser uploads media directly to S3.
- **Asynchronous Image & Video Processing**: Trigger AWS Lambda / Worker queues (BullMQ) to compress images, generate WebP thumbnails, and encode videos into HLS/DASH formats before serving via CloudFront CDN.

### 4. Search & Discovery Engine (Elasticsearch / OpenSearch)
- Index all posts, candidate profiles, exams, notes, and communities into Elasticsearch for sub-millisecond full-text search, autocomplete, and recommendation algorithms.

### 5. Microservices & Container Orchestration (Docker & Kubernetes)
- Package services into Docker containers:
  - `auth-service` (User Auth & OTP)
  - `feed-service` (Posts, Comments, Media Uploads)
  - `eligibility-service` (Rule Engine & Exam Calculations)
  - `chat-service` (Real-Time WebSocket Messaging)
- Deploy on Amazon EKS or Google GKE with Horizontal Pod Autoscalers (HPA) auto-scaling based on CPU/RAM metrics.

---

## 🛠️ Technology Stack

- **Frontend**: React 18 (Vite), TailwindCSS, Lucide React Icons, React Router DOM v6
- **Backend**: Node.js, Express, WebSocket Server (`ws`), Multer (Media Uploads), Helmet, Express Rate Limit
- **Database**: Local JSON Database Engine with seed dataset & atomic file flushing
- **Security**: JWT Authentication, Bcrypt Password Hashing, HTTP Security Headers

---

## 🚀 Quick Start (Local Setup)

### 1. Clone Repository
```bash
git clone https://github.com/stutiisfr/cadetconnect.git
cd cadetconnect
```

### 2. Install & Start Backend
```bash
cd backend
npm install
npm run dev
```
*Backend server active on `http://localhost:5000` & WebSockets on `ws://localhost:5000`*

### 3. Install & Start Frontend
```bash
cd ../frontend
npm install
npm run dev
```
*Frontend dev server active on `http://localhost:5173`*

---

## 🔑 Demo Access Profiles

All demo profiles use password: `cadet123`

| Role | Name | Email | Description |
| :--- | :--- | :--- | :--- |
| **NCC Cadet (SUO)** | SUO Rahul Das | `rahul.das@cadetconnect.org` | Senior Under Officer, Odisha Directorate, RDC Cadet |
| **CDS Aspirant** | Ananya Sharma | `ananya.sharma@cadetconnect.org` | Defence Aspirant preparing for CDS & AFCAT |
| **Veteran Mentor** | Col. Vikram Rathore (Retd.) | `col.vikram@cadetconnect.org` | Ex-14 SSB Interviewing Officer & Mentor |
| **Platform Admin** | Admin Desk | `admin@cadetconnect.org` | Verification queue auditor & platform moderator |

---

## 📡 API Endpoints Overview

### Authentication (`/api/auth`)
- `POST /api/auth/login` — Email & password login
- `POST /api/auth/register/cadet` — Register NCC Cadet (Regimental Number required)
- `POST /api/auth/register/aspirant` — Register Defence Aspirant
- `POST /api/auth/google` — Google OAuth authentication
- `POST /api/auth/send-otp` — Send mobile verification OTP
- `POST /api/auth/verify-otp` — Verify mobile OTP & login
- `GET /api/auth/me` — Validate token and fetch authenticated user state

### Feed & Posts (`/api/feed`)
- `GET /api/feed` — Get posts (supports `category` and `search` query parameters)
- `POST /api/feed/create` — Create post (*Auth required*)
- `POST /api/feed/upload` — Upload post file/image attachment via `multer`
- `POST /api/feed/:id/appreciate` — Appreciate post (*Auth required*)
- `POST /api/feed/:id/comment` — Comment on post (*Auth required*)
- `GET /api/feed/:id/comments` — Fetch post comments

### Exam Eligibility (`/api/eligibility`)
- `GET /api/eligibility/exams` — List exams with search & filter
- `POST /api/eligibility/evaluate` — Run candidate profile against exam rules engine

### Profiles & Messages
- `GET /api/profiles/:username` — Get public profile
- `PUT /api/profiles/me/update` — Update personal profile details in real time
- `GET /api/messages/conversations` — Fetch user active conversations
- `POST /api/messages/send` — Send direct real-time message

---

## 📜 License & Disclaimer

CadetConnect is an independent professional community platform and is not officially affiliated with the Ministry of Defence or the Indian Armed Forces.

*Jai Hind! 🇮🇳*
