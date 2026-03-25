# UpwardEase

UpwardEase is a peer-to-peer sharing platform designed for students to share their stories, study tips, and mental health strategies in a safe, moderated environment. It combines a public-facing community website with a robust moderated submission system to ensure all content remains supportive and troll-free.

## Project Overview

This project is a **functional frontend prototype** built to demonstrate the core user experience and moderation workflow of the UpwardEase platform. It features a complete role-based access control system, content submission pipeline, and an administrative dashboard for content review and user management.

### Current Project Status
- **Frontend-Only**: All logic runs in the browser.
- **Simulated Backend**: Data persistence is handled via `localStorage`.
- **Prototype Reality**: Authentication, notifications, and email communications are simulated for demonstration purposes.
- **Ready for Integration**: The codebase is structured with clear data models and service layers, making it ready for future backend integration (e.g., Firebase, Supabase, or a custom API).

## Core Features

### 1. Public Community Website
- **Story Gallery**: Browse approved student stories categorized by grade and topic.
- **Featured Content**: Highlighted "Featured Topics" and "Action Steps" to encourage community engagement.
- **Resource Hub**: Access to crisis resources and professional mental health support links.
- **Responsive Design**: Fully optimized for mobile and desktop with a native Dark Mode.

### 2. Moderated Submission Platform
- **YouTube Integration**: Users submit stories via YouTube links. The platform extracts metadata and embeds the video without storing raw video files.
- **Submission Pipeline**: All new content enters a "Pending" state and must be reviewed by an Admin before becoming public.
- **Interaction System**: Users can like, comment on, and save stories to their personal profile.

### 3. Administrative Dashboard
- **Content Moderation**: Admins can approve, reject, or remove content with specific review notes.
- **Report Management**: User-reported content is flagged for priority review.
- **Role Management**: Superadmins can promote users to Admin status or manage platform-wide settings.
- **Internal Inbox**: Review messages sent through the platform's contact form.

## Role Model

UpwardEase uses a hierarchical role-based access control (RBAC) system:

| Role | Permissions |
| :--- | :--- |
| **User** | Submit stories, comment, like, save content, and manage their own profile. |
| **Admin** | All User permissions + Access to the Admin Dashboard, content moderation, and report handling. |
| **Superadmin** | All Admin permissions + Role management (promoting/demoting admins) and system-wide overrides. |

*Note: Admins and Superadmins retain all standard user capabilities, allowing them to participate in the community while managing it.*

## Submission and Moderation Workflow

1. **Submission**: A user submits a valid YouTube URL.
2. **Validation**: The system extracts the YouTube Video ID and validates the link.
3. **Pending State**: The video is stored with a `pending` status and is only visible to the author and Admins.
4. **Admin Review**: An Admin reviews the video in the dashboard.
5. **Verdict**:
   - **Approved**: The video becomes public in the Gallery.
   - **Rejected**: The video remains private; the author receives a notification with the review note.
   - **Removed**: Previously approved content can be removed if it later violates guidelines.
6. **Appeals**: Authors can submit an appeal for rejected content, which flags it for a second review.

## Reporting & Communication

- **Reporting**: Users can report content for violations. Reporting increments a `reportCount` but does **not** automatically unpublish the video; it flags it for Admin intervention.
- **Notifications**: Simulated in-app notifications inform users of likes, comments, and moderation verdicts.
- **Contact Logic**:
  - **Direct Email**: Links open the user's local mail client.
  - **Internal Form**: Messages are stored in the platform's internal state for Admin review but do not send real external emails.

## Tech Stack

- **Framework**: React 19 (Vite 6)
- **Language**: TypeScript 5.8
- **Styling**: Tailwind CSS 4.0
- **Icons**: Lucide-React
- **Animations**: Framer Motion (simulated via custom FadeIn components)
- **Persistence**: Browser `localStorage`

## Project Structure Overview

```text
/src
  /components     # Reusable UI components (Navbar, Footer, Cards)
  /views          # Main page views (Home, Gallery, Admin, Profile)
  /utils          # Logic helpers (YouTube extraction, Moderation logic)
  /types.ts       # Centralized TypeScript definitions
  /constants.ts   # Initial seed data and configuration
  /index.tsx      # Main App component and state management
  /authService.ts # Simulated authentication logic
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

You can test the different role experiences using these default credentials:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Superadmin** | `super@upwardease.org` | `password123` |
| **Admin** | `admin@upwardease.org` | `password123` |
| **User** | `student@example.com` | `password123` |

## Persistence & LocalStorage

The application state is persisted in your browser's `localStorage` under the key `upwardEase_state_v2`. 

- **Resetting Data**: To reset the application to its default state, clear your browser's local storage for the site or delete the `upwardEase_state_v2` key.
- **Session Simulation**: Authentication is maintained via state; refreshing the page will keep you logged in as long as the data exists in `localStorage`.

## Current Limitations

- **No Real Auth**: Passwords are hashed locally, but there is no secure server-side session management.
- **No File Storage**: The platform relies entirely on YouTube for video hosting.
- **No Real Emails**: Email notifications are simulated via console logs.
- **State-Based Navigation**: The app uses internal state for navigation rather than a URL-based routing system (e.g., React Router).

## Future Roadmap

1. **Backend Integration**: Replace `localStorage` with a real database (Firestore/PostgreSQL).
2. **Production Auth**: Implement Firebase Auth or Auth0 for secure user management.
3. **Cloud Functions**: Automate email notifications and moderation alerts.
4. **Advanced Analytics**: Track engagement metrics and community growth.
5. **URL Routing**: Implement `react-router-dom` for better SEO and deep-linking.

---
*Developed as a prototype for the UpwardEase community initiative.*
