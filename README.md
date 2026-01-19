# 🍽️ Advanced Restaurant Management System (End-to-End)

A premium, full-stack restaurant management solution featuring **Augmented Reality (AR) Menus**, real-time order tracking, and a multi-role dashboard architecture. Built for speed, scalability, and an immersive dining experience.

---

## ✨ Features

### 🛒 Customer Experience
- **QR Code Ordering**: Instant access to the menu via table-specific QR codes.
- **3D/AR Menu**: Visualize dishes in 3D and place them on your table using AR (iOS QuickLook & Android SceneViewer).
- **Smart Cart**: Persistent shopping cart with special instructions and real-time total calculation.

### 🧑‍🍳 Kitchen & Staff
- **Kitchen Display System (KDS)**: Real-time order board with status tracking (Prepared, Ready, Served).
- **Waiter Dashboard**: Live table occupancy status and instant order notifications via Socket.io.
- **Live Order Stream**: Instant updates across all devices when an order status changes.

### 📊 Management & Analytics
- **Manager Insights**: Premium analytics dashboard for revenue, peak hours, and staff performance.
- **Interactive Menu Management**: CRUD operations for menu items with integrated 3D model optimization and upload.
- **Table Management**: Dynamic table creation with automated QR code generation.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Shadcn UI
- **Backend**: Next.js API Routes, Socket.io (Universal Real-time Engine)
- **Database**: PostgreSQL (Prisma ORM)
- **State/Cache**: Redis (Rate limiting & Order caching)
- **3D/AR Engine**: Three.js, React Three Fiber, @google/model-viewer
- **Auth**: NextAuth.js (JWT, Role-based Access Control)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: 18.x or higher
- **Docker**: For running PostgreSQL & Redis locally (Recommended)
- **NPM**: 9.x or higher

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 2. Environment Configuration
Create a `.env.local` file by copying the example:
```bash
cp .env.example .env.local
```
Update the following core variables:
- `DATABASE_URL`: Your PostgreSQL connection string.
- `REDIS_URL`: Your Redis connection string.
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`.
- `STRIPE_SECRET_KEY`: For enabling payments.

### 3. Database Initialization
Synchronize the database schema and generate the Prisma client:
```bash
npm run db:push
npm run db:generate
```

### 4. Running the Application
**Development Mode (Standard):**
```bash
npm run dev
```

**Using Docker (Database & Redis only):**
```bash
npm run docker:up
```

---

## 🔑 Environment Variables Reference

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `NEXTAUTH_SECRET` | Secret for token hashing |
| `NEXT_PUBLIC_API_URL` | Base API URL for client-side requests |
| `STRIPE_SECRET_KEY` | Stripe backend API key |
| `SENDGRID_API_KEY` | For transactional emails |

---

## 📁 Architecture Overview

```text
├── app/                  # Next.js App Router & API Endpoints
├── components/           # UI & Feature Components
│   ├── customer/         # Menu, Cart, AR Viewer
│   ├── manager/          # Dashboard, Charts, Menu Management
│   ├── shared/           # Order Cards, Status Badges
│   └── ui/               # Base Shadcn/UI Components
├── hooks/                # Custom React Hooks (useCart, useOrders, useSocket)
├── lib/                  # Server-side Utilities (Prisma, Socket.io, Auth)
├── prisma/               # Database Schema (schema.prisma)
└── public/               # Static Assets & 3D Models (.glb)
```

---

## � Key Scripts

- `npm run dev`: Starts development server on port 3000.
- `npm run build`: Optimizes application for production.
- `npm run lint:fix`: Automatically fixes linting and style issues.
- `npm run db:studio`: Opens a browser UI to manage your database data.
- `npm run type-check`: Validates TypeScript integrity.

---

## 🛠 Troubleshooting

1. **Prisma Connection Issues**: Ensure your `DATABASE_URL` is correct and the database is accessible. Use `npm run docker:up` if running locally.
2. **Socket.io Connection**: If real-time updates aren't appearing, check if your firewall allows WebSocket connections and ensure the server is running.
3. **3D Model Uploads**: If uploads fail, check the `NEXT_PUBLIC_MAX_UPLOAD_SIZE` in your `.env`.

---
Made with ❤️ by the Antigravity Team.
