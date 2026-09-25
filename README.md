# members-only

Authentication with passport js demo.

# Docs (AI Generated. Reviewed/Approved by Patrick Gross(Sept 10, 2026))

## 1. Overview

This document describes the architecture, functionality, and security mechanisms of a Node.js/Express-based message board application. The system utilizes PostgreSQL for data persistence, Passport.js for authentication, and EJS for rendering views. It implements a tiered membership system (Guest, Member, Full Member, Admin) with granular permissions regarding visibility and content management.

## 2. Core Features & User Roles

### 2.1 Guest Users

- **Access:** Can view the public message board (`/`).
- **Visibility:** All user names are masked as "Anonymous".
- **Actions:** Cannot post messages, cannot log in, cannot delete content.

### 2.2 Base Members (Registered Users)

- **Access:** Can access the application after signing up and logging in.
- **Visibility:** User names remain masked as "Anonymous" on the home page.
- **Actions:**
  - Can post new messages (`/message`).
  - Cannot delete existing messages.

### 2.3 Full Members (Upgraded Users)

- **Access:** Same as Base Members, plus upgraded privileges.
- **Visibility:** User names are displayed on the home page based on their `member` flag in the database.
- **Upgrade Mechanism:** Requires entering a secret verification code (`/code`). This is validated via `codeValidator`.

### 2.4 Administrators

- **Access:** Full access to all features.
- **Visibility:** Can see all user names and manage content.
- **Actions:**
  - Can delete messages from the home page (`/delete/:id`).
  - **Creation Restriction:** Cannot be created via the standard sign-up form unless they possess the specific `ADMIN_PASS` secret key defined in environment variables.

## 3. System Architecture

### 3.1 Technology Stack

- **Runtime:** Node.js
- **Framework:** Express.js (v4+)
- **Template Engine:** EJS (`views` folder)
- **Database:** PostgreSQL (via `pg` pool)
- **Authentication:** Passport.js (Local Strategy)
- **Validation:** Custom validators in the `/validators` folder.
- **Security:** `bcryptjs` for password hashing, `dotenv` for environment configuration.

### 3.2 Directory Structure

```text
/project-root
├── controllers/          # Business logic and request handlers (membersController.js)
├── db/                   # Database connections and queries
│   ├── pool.js           # PostgreSQL connection pool instance
│   └── query.js          # SQL functions for CRUD operations
├── views/                # EJS template files (.ejs)
├── validators/           # Input validation logic (codevalidator, message_validation)
├── routes/               # Express route definitions (indexRouter.js)
├── config/               # Passport configuration and environment settings
│   └── passport.js       # Authentication strategy definition
├── app.js                # Application entry point and middleware setup
├── populatedb.js         # Database seeding script for developers
└── package.json          # Dependencies list
```

## 4. Security & Data Flow

### 4.1 Authentication Flow (Passport Local Strategy)

1.  **Login Attempt:** User submits credentials to `/log-in`.
2.  **Verification:** `passport.js` executes the `LocalStrategy`:
    - Queries `users` table for username.
    - Hashes provided password and compares it against stored hash using `bcrypt.compare`.
3.  **Session Creation:** Upon success, Passport creates a session cookie (stored in PostgreSQL via `connect-pg-simple`) containing the user's ID (`user.id`).
4.  **Deserialization:** On subsequent requests, Passport retrieves the full user profile from the `userinfo` table using the session ID to populate `req.user`.

### 4.2 Session Management

- Sessions are persisted in the database rather than memory to ensure data survives server restarts.
- The `saveUninitialized: false` and `resave: false` options optimize performance by only saving sessions that contain actual user data.
- Session expiration is set to 30 days (`maxAge`).

### 4.3 Input Validation & Sanitization

- **Sign Up:** Validates required fields and checks for the secret admin password before allowing admin creation.
- **Code Upgrade:** Uses `codeValidator` to ensure only users with the correct secret code can upgrade their status.
- **Message Posting:** Uses `messageValidators` to sanitize titles and content, preventing injection attacks or empty submissions.

### 4.4 Database Security

- All SQL queries use parameterized statements (`$1`, `$2`) to prevent SQL Injection.
- Passwords are never stored in plain text; they are hashed with a salt factor of 10 using `bcryptjs`.
- Transactions (`BEGIN`/`COMMIT`/`ROLLBACK`) are used during user creation to ensure data integrity (e.g., creating the user ID before linking it to the userinfo table).

## 5. API Endpoints & Routes

| Method | Path          | Description                               | Auth Required?              | Role Check                                          |
| :----- | :------------ | :---------------------------------------- | :-------------------------- | :-------------------------------------------------- |
| `GET`  | `/`           | Display home page with all messages.      | No (Guests see "Anonymous") | Full Members/Admins see real names.                 |
| `POST` | `/sign-up`    | Register new user account.                | No                          | Checks for Admin Secret Key if admin role selected. |
| `GET`  | `/code`       | Display verification code input form.     | Yes (Logged In)             | N/A                                                 |
| `POST` | `/code`       | Verify secret code to upgrade status.     | Yes                         | Validates against `ADMIN_PASS`.                     |
| `GET`  | `/log-in`     | Display login form.                       | No                          | N/A                                                 |
| `POST` | `/log-in`     | Authenticate user and create session.     | No                          | Runs Passport Local Strategy.                       |
| `GET`  | `/log-out`    | Destroy session cookie and clear state.   | Yes (Logged In)             | N/A                                                 |
| `GET`  | `/message`    | Display form to post a new message.       | Yes (Base Member+)          | N/A                                                 |
| `POST` | `/message`    | Submit new message content.               | Yes (Base Member+)          | Validates input via `messageValidators`.            |
| `GET`  | `/delete/:id` | Delete a specific message from the board. | Yes (Full Member/Admin)     | Checks if user has delete permission.               |

## 6. Database Schema Logic

### Tables Involved

1.  **`users`**: Stores authentication credentials (`username`, `password_hash`).
2.  **`userinfo`**: Stores profile data and permissions (`firstname`, `lastname`, `member` flag, `admin` boolean). Linked to `users.id`.
3.  **`messages`**: Stores content (`title`, `message_text`) linked to the poster via `usersid`.

### Key Queries

- **Retrieving Messages:** Joins `messages` and `userinfo` tables. Filters display based on the `member` flag in the view logic (if `req.user.member` is true, show name; else "Anonymous").
- **User Creation:** Uses a transaction to first insert into `users`, retrieve the generated ID, then conditionally insert into `userinfo`.
- **Upgrading Status:** Updates the `member` boolean flag in `userinfo` upon successful code verification.

## 7. Developer Notes & Maintenance

- **Database Seeding:** Developers should run `populatedb.js` to initialize the database with default users and tables before starting development.
- **Environment Variables:** Critical secrets (like `COOKIE_SECRET` and `ADMIN_PASS`) must be managed via `.env` files, not hardcoded in source code.
- **Error Handling:** Global error middleware is recommended for production to handle uncaught exceptions gracefully without exposing stack traces to clients.
