# UpwardEase

UpwardEase is a community-driven platform designed for sharing, discovering, and curating educational videos and resources. It empowers students, educators, and lifelong learners to build a high-quality library of learning materials through a collaborative, moderated environment.

This repository contains the **frontend prototype** of UpwardEase. It is a fully functional, interactive web application built with React, Vite, and Tailwind CSS. Currently, it operates entirely in the browser using `localStorage` to simulate a backend database, allowing for rapid UI/UX iteration and testing without requiring a complex server setup.

## Features

*   **Video Discovery:** Browse a gallery of approved educational videos, filter by category (e.g., Math, Science, Study Tips), and search by title or tags.
*   **Community Contributions:** Users can submit YouTube videos to the platform, complete with titles, descriptions, categories, and tags.
*   **Interactive Engagement:** Users can like videos, save them to their profile, and participate in comment threads.
*   **Robust Moderation System:** A dedicated admin dashboard allows moderators to review pending submissions, handle user reports, and maintain content quality.
*   **Role-Based Access Control (RBAC):** Distinct user roles (User, Admin, Super Admin) ensure secure and appropriate access to platform features.
*   **Dark Mode:** Built-in support for light and dark themes, respecting system preferences.

## How It Works Today (The Prototype)

The current UpwardEase application is a **frontend-only prototype**. 

*   **Data Persistence:** All data—including users, videos, comments, likes, and moderation logs—is stored in the browser's `localStorage`.
*   **Simulated Authentication:** Login and registration are simulated. Passwords are hashed using a simulated `authService` before being stored in `localStorage`, but there is no real secure session management.
*   **Seed Data:** On the first load, the application automatically populates `localStorage` with a set of initial demo users, videos, and reports so you can explore the platform immediately.
*   **Simulated Delays:** Actions like uploading a video or submitting a moderation verdict include artificial delays (`setTimeout`) to mimic real-world network latency and demonstrate loading states.

## User Roles & Permissions

UpwardEase implements a strict Role-Based Access Control (RBAC) system:

1.  **User (`user`)**
    *   Can browse the public gallery.
    *   Can like, save, and comment on approved videos.
    *   Can submit new videos (which go into a `pending` state).
    *   Can report inappropriate videos.
    *   Can request to become an Admin.

2.  **Admin (`admin`)**
    *   Inherits all `user` permissions.
    *   Accesses the Admin Dashboard.
    *   Reviews `pending` video submissions (Approve or Reject).
    *   Reviews user reports on videos.
    *   Can "Dismiss All Reports" for a video if they are deemed invalid.
    *   Can "Escalate" a video by adding an internal note for further review.
    *   Can remove approved videos from the gallery.

3.  **Super Admin (`superadmin`)**
    *   Inherits all `admin` permissions.
    *   Can view and manage all users on the platform.
    *   Can approve or decline "Admin Requests" submitted by standard users.
    *   Can manually change user roles.

## Moderation Workflow

The moderation system is designed to keep the platform safe and high-quality:

*   **Submission:** When a user uploads a video, its status is set to `pending`. It is not visible in the public gallery.
*   **Review:** Admins see `pending` videos in their dashboard. They can watch the video and choose to **Approve** (moves to gallery) or **Reject** (requires a reason, hides the video, and notifies the user).
*   **Reporting:** Any user can report an approved video. The video remains in the gallery but appears in the Admin Dashboard under "Reported Videos".
*   **Handling Reports:** Admins can review the reported video. They can:
    *   **Dismiss All Reports:** Clears the reports if the video is fine.
    *   **Remove Video:** Takes the video down from the gallery.
    *   **Escalate:** Adds an internal note to the video's moderation log, keeping it flagged for further discussion among admins.

## Running the Project Locally

To run the UpwardEase prototype on your local machine:

1.  **Prerequisites:** Ensure you have [Node.js](https://nodejs.org/) installed.
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
3.  **Start the Development Server:**
    ```bash
    npm run dev
    ```
4.  **Open in Browser:** Navigate to the URL provided in your terminal (usually `http://localhost:3000` or `http://localhost:5173`).

## Demo Accounts

The application automatically seeds the following accounts on first load. You can use these to test different roles:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Super Admin** | `super@upwardease.org` | `password123` |
| **Admin** | `admin@upwardease.org` | `password123` |
| **User** | `student@example.com` | `password123` |

## Current Limitations

Because this is a frontend-only prototype, it has several inherent limitations:

*   **No Cross-Device Sync:** Data is stored in your specific browser's `localStorage`. If you open the app on your phone or a different browser, you will not see the same data.
*   **Security:** Authentication is simulated. Do not use real passwords. `localStorage` is not a secure place to store sensitive user data in a production environment.
*   **No Real File Uploads:** Video "uploads" only accept YouTube URLs. There is no actual video file hosting.
*   **No Real Emails:** The "Contact Us" form and notification preferences simulate sending emails, but no actual emails are dispatched.

---

## Backend Integration Plan

The current architecture of UpwardEase was intentionally designed as a frontend-first prototype. This approach allowed for rapid iteration on the user interface, user experience, and complex state logic (like the moderation workflow and RBAC) without being bogged down by database migrations or API endpoint design.

However, the codebase has been structured to be **future-backend-friendly**.

### Why It's Ready for a Backend

1.  **Centralized State Management:** The core application state (`users`, `videos`, `reports`, `moderationLogs`) is managed at the top level (`index.tsx`) and passed down via props. This mirrors how a global store (like Redux or React Query) would manage data fetched from an API.
2.  **Defined Data Models:** The TypeScript interfaces (`VideoType`, `UserType`, `ReportType`, `ModerationLogType`) represent clear, relational database schemas. A backend developer will not need to guess the shape of the data.
3.  **Marked Integration Points:** Throughout the codebase (e.g., in `UploadView.tsx`, `VideoDetailView.tsx`, `AdminView.tsx`), state update functions are annotated with comments like `// TODO: Replace with API call to POST /api/...`. These serve as exact insertion points for future `fetch` or `axios` calls.
4.  **Asynchronous UI Patterns:** The UI already handles loading states (`isSubmitting`, `isLoading`) and artificial delays, meaning the transition to real network requests will not require a UI overhaul to handle latency.

### What a Future Backend Will Handle

When migrating to a real backend, the server will take over the following responsibilities:

*   **Authentication & Authorization:** Replacing the simulated login with secure JWTs or session cookies. Validating roles on the server side to prevent unauthorized API access.
*   **Database Management:** Replacing `localStorage` with a robust database (e.g., PostgreSQL, MongoDB) to store users, videos, comments, and logs securely and persistently across all devices.
*   **Data Validation:** Enforcing schema rules, checking for duplicate YouTube URLs, and sanitizing inputs on the server before saving to the database.
*   **Email Services:** Integrating with a provider like SendGrid or AWS SES to send actual password reset emails, moderation notifications, and contact form submissions.

### Phased Migration Strategy

To minimize disruption, the migration from `localStorage` to a real backend can be done in phases:

*   **Phase 1: Authentication.** Implement the backend auth service. Update the frontend `authService.ts` to make real API calls for login/register while keeping other data in `localStorage` temporarily.
*   **Phase 2: User Profiles & Settings.** Migrate user data fetching and updates (profile edits, notification preferences) to the backend.
*   **Phase 3: Core Content (Videos & Gallery).** Move video fetching, uploading, and the public gallery to the backend database.
*   **Phase 4: Interactions & Moderation.** Finally, migrate likes, comments, reporting, and the admin moderation workflows to real API endpoints.

### Potential Backend Technologies

The frontend is agnostic to the backend technology, but here are strong candidates based on the project's needs:

*   **Supabase / Firebase:** Excellent choices for rapid transition. They provide out-of-the-box authentication, real-time databases (Postgres for Supabase, NoSQL for Firebase), and easy-to-use client SDKs that would map cleanly to the current state management.
*   **Node.js / Express (Custom Backend):** Provides maximum flexibility. A custom REST or GraphQL API using Prisma or TypeORM would allow for fine-grained control over the complex moderation and RBAC logic.
