# UpwardEase

UpwardEase is a moderated student storytelling and support-sharing website prototype. It is designed to provide a safe, community-oriented platform where students can share their experiences, study tips, and well-being strategies through video content.

## Project Overview

This project is currently a **frontend-first moderated website prototype**. Its primary purpose is to validate content submission workflows, moderation logic, role-based behavior, and community interaction patterns before the implementation of a full production backend.

### Current Project Status
- **Frontend-Only**: All logic, including authentication and moderation, is executed client-side.
- **Prototype Persistence**: Data is persisted using the browser's `localStorage`.
- **Simulated Infrastructure**: Authentication, notifications, and email delivery are simulated to demonstrate the intended user experience.
- **Backend-Ready**: The codebase is intentionally structured with clear data models and modular logic to facilitate a seamless transition to a durable backend.

## Core Features

- **Story Gallery**: A public-facing feed of approved student stories, categorized by grade and topic.
- **Moderated Submission**: A workflow for users to submit YouTube links, which are then reviewed by administrators.
- **Interaction System**: Logged-in users can like, comment on, and save stories to their personal profiles.
- **Admin Dashboard**: A comprehensive suite of tools for content review, report handling, and user management.
- **Crisis Resources**: Integrated access to professional support and crisis intervention links.
- **Dark Mode**: A native dark theme for comfortable viewing in any environment.

## Role Model

UpwardEase implements a hierarchical role-based access control (RBAC) system:

| Role | Description & Permissions |
| :--- | :--- |
| **User** | Standard community member. Can submit stories, interact with content, and manage their profile. |
| **Admin** | Community moderator. Retains all User capabilities plus access to the Admin Dashboard for content review and report handling. |
| **Superadmin** | Platform administrator. Retains all Admin capabilities plus role management (promoting/demoting admins) and system-wide overrides. |

*Note: Role inheritance is built-in; higher-level roles automatically possess all permissions of the roles below them.*

## Submission and Moderation Workflow

### Submission Flow
1. **Link Submission**: Users provide a YouTube URL.
2. **Extraction**: The app validates the URL and extracts the unique YouTube Video ID.
3. **Metadata Storage**: Video metadata is stored locally; the platform embeds the YouTube player rather than storing raw video files.

### Moderation States
All submissions pass through a strictly defined lifecycle:
- **Pending**: Initial state. Visible only to the author and administrators.
- **Approved**: Content is made public in the Story Gallery.
- **Rejected**: Content is restricted; the author is notified with a review note.
- **Removed**: Previously approved content that has been taken down due to guideline violations.

### Moderation Rules
- **Final Authority**: Admins apply the final moderation decisions.
- **Reports & Appeals**: User reports and author appeals flag content for review but do **not** automatically change the primary moderation state.

## Reporting, Appeals, Notifications, and Contact

### Reporting & Appeals
- **Reporting**: Logged-in users can report content. Reports are stored as metadata and reviewed by admins to determine if action is necessary.
- **Appeals**: Authors of rejected or removed content can submit appeals, which are surfaced in the admin "Needs Review" queue.

### Notifications
- **Simulated Delivery**: Notifications for likes, comments, and moderation updates are simulated in the frontend state and persisted locally.
- **Preferences**: Users can manage their notification settings in their profile.

### Contact Logic
- **Direct Support**: Support email links open the user's local email client.
- **Internal Inbox**: The contact form stores messages in a simulated admin inbox for review; it does **not** send real external emails in this prototype phase.

## Tech Stack

- **Framework**: React 19 (Vite 6)
- **Language**: TypeScript 5.8
- **Styling**: Tailwind CSS 4.0
- **Icons**: Lucide-React
- **Persistence**: Browser `localStorage`

## Project Structure Overview

```text
/src
  /components     # Reusable UI components (Navbar, Footer, Cards)
  /views          # Main page views (Home, Gallery, Admin, Profile, etc.)
  /utils          # Logic helpers (YouTube extraction, Moderation logic)
  /types.ts       # Centralized TypeScript definitions
  /constants.ts   # Initial seed data and configuration
  /index.tsx      # Main App component and global state management
  /authService.ts # Simulated authentication and hashing logic
```

## Running Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

4. **Type-Check**:
   ```bash
   npm run lint
   ```

## Demo Accounts

The following accounts are seeded by default for testing the various role experiences:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Superadmin** | `super@upwardease.org` | `password123` |
| **Admin** | `admin@upwardease.org` | `password123` |
| **User** | `student@example.com` | `password123` |

### Persistence Note
The application state is stored in `localStorage` under the key `upwardEase_state_v2`. To reset the demo data to its original state, you can clear your browser's local storage or delete this specific key.

## Current Limitations

- **Authentication**: Passwords are hashed locally, but there is no secure server-side session management.
- **File Storage**: The platform does not support direct video file uploads.
- **Communications**: No real external email or push notification delivery.
- **Routing**: The app uses state-based navigation rather than a URL-based routing system.
- **Security**: RBAC is enforced in the frontend logic only; it is not yet backed by server-side security rules.

## Backend Integration Plan

The UpwardEase prototype was intentionally built with a **frontend-first approach** to stabilize the complex moderation logic, role inheritance patterns, and community interaction rules before committing to a specific backend infrastructure.

### Why Frontend-First?
- **Logic Validation**: Allows for rapid iteration on moderation workflows and reporting rules.
- **UX Refinement**: Ensures the community experience is intuitive before implementing durable storage.
- **Reduced Rework**: By defining clear data models (`types.ts`) and modular logic (`utils/`), the eventual backend implementation will focus on data synchronization rather than rebuilding business logic.

### Future Backend Responsibilities
A production backend (such as **Supabase** or **Firebase**) would be responsible for:
1. **Durable Persistence**: Moving from `localStorage` to a hosted database (PostgreSQL/Firestore).
2. **Secure Authentication**: Implementing industry-standard auth providers and secure session handling.
3. **Server-Side RBAC**: Enforcing security rules at the database level to prevent unauthorized data access.
4. **Audit Logging**: Maintaining a tamper-proof record of all moderation actions.
5. **Real Communications**: Integrating with services like SendGrid or Twilio for real email and notification delivery.
6. **Scalable Analytics**: Tracking community engagement and platform health.

### Migration Strategy
Migration would occur in phases:
- **Phase 1**: Replace the simulated `authService` with a real provider.
- **Phase 2**: Map the existing TypeScript interfaces to database schemas.
- **Phase 3**: Replace local state setters with API calls/SDK hooks.
- **Phase 4**: Implement server-side functions for automated moderation tasks and email triggers.

---
*Developed as a prototype for the UpwardEase community initiative.*
