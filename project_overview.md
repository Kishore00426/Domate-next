# Project Overview: Domate

Domate is a Next.js application designed to manage service bookings, likely for home services or similar expert-driven industries. It supports multi-role access (Admin, Provider, User) and features a robust backend integrated with MongoDB.

---

## Project Structure

```text
Domate/
├── public/                 # Static assets (images, icons)
├── src/
│   ├── app/                # Next.js App Router folders
│   │   ├── (auth)/         # Grouped authentication routes (logic/register)
│   │   ├── admin/          # Admin dashboard and management pages
│   │   ├── api/            # Backend API routes (Mongoose/MongoDB)
│   │   ├── provider/       # Service provider dashboard and profile pages
│   │   ├── user/           # End-user dashboard and booking pages
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Homepage
│   ├── components/         # Reusable UI components
│   │   ├── dashboard/      # Role-specific dashboard components
│   │   ├── layouts/        # Layout wrappers (AdminLayout, etc.)
│   │   └── common/         # Generic components (Navbar, Footer, SearchBar)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Library configurations (MongoDB connection)
│   ├── models/             # Mongoose schemas/models
│   ├── store/              # Redux state management
│   ├── utils/              # Utility functions
│   └── i18n.js             # Internationalization config
├── package.json            # Dependencies and scripts
└── next.config.ts          # Next.js configuration
```

---

## Technology Stack

- **Framework**: Next.js (App Router)
- **State Management**: Redux Toolkit
- **Database**: MongoDB (via Mongoose)
- **Styling**: Tailwind CSS, Styled Components
- **Auth**: JWT (JSON Web Tokens), Bcryptjs
- **Internationalization**: i18next
- **PDF/Excel**: jsPDF, xlsx
- **Charts**: Recharts

---

## Component Usage & Architecture

### 1. Frontend Components
- **Layouts**: `AdminLayout` and `UserLayout` wrap pages to provide consistent navigation and sidebars.
- **Dynamic Content**: Pages use standard Next.js `page.tsx` and `layout.tsx` files.
- **Responsive UI**: Tailwind CSS is used for responsive designs, with components like `Navbar` and `Footer` being shared across most views.

### 2. State Management (Redux)
- **Redux Toolkit**: Used for global states like service lists (`servicesSlice`) and UI interactions (`uiSlice`).
- **Persistence**: Managed through custom slices to maintain state across the application.

### 3. Backend (API Routes)
- **Folder**: `src/app/api/`
- **Logic**: Each route handles specific HTTP methods (GET, POST, etc.) for entity management (Users, Providers, Services, Bookings).
- **Security**: Routes often check for authentication using JWTs stored in cookies or headers.

### 4. Database Models
- **Schemas**: Located in `src/models/`, defining data structures for `User`, `ServiceProvider`, `Booking`, `Service`, etc.

---

## System Flow

### 1. Authentication Flow
1. User submits login/register form.
2. Backend validates credentials, generates a JWT, and sends it back (or sets a cookie).
3. The application redirects users based on their role (`Admin` → `/admin/dashboard`, etc.).

### 2. Booking Flow
1. **User**: Browses services, selects a provider/time, and creates a booking.
2. **System**: API creates a `Booking` document in MongoDB.
3. **Provider**: Receives notification (or sees in dashboard) and can manage the booking status.
4. **Admin**: Oversees all bookings and resolves any issues.

### 3. Data Flow
- **Request**: Client Component → Redux Action / Direct `axios` call → Next.js API Route.
- **Processing**: API Route → Mongoose Model → MongoDB.
- **Response**: MongoDB → API Route → Client Component state update.

---

## Key Features

- **Multi-Role Dashboards**: Tailored views for Admins, Providers, and Users.
- **Service Management**: CRUD operations for services, categories, and providers.
- **Internationalization**: Support for multiple languages via `i18n.js`.
- **Exporting**: Ability to download invoice PDFs and export booking data to Excel.
- **Visualizations**: Admin and Provider dashboards use `Recharts` for analytics.
