# Finance Dashboard Backend

A backend system for a role-based finance dashboard. Built with **Node.js**, **Express**, and **MongoDB**.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js |
| Framework | Express v5 |
| Database | MongoDB (Mongoose) |
| Auth | JWT (jsonwebtoken) |
| Validation | express-validator |
| Password Hashing | bcrypt |
| Rate Limiting | express-rate-limit |

---

## Project Structure

```
├── server.js                        # Entry point — loads env, starts server
├── app.js                           # Express app setup, middleware, routes
├── src/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── middlewares/
│   │   ├── auth.js                  # JWT verification + role guard
│   │   └── errorHandling.js        # Centralized error handler
│   ├── utils/
│   │   └── validators.js           # express-validator rule sets
│   └── Modules/
│       ├── Admin/                   # Admin login + user management
│       ├── Users/                   # User register/login/profile
│       ├── FinancialRecords/        # CRUD for financial records
│       └── DashboardSummary/        # Aggregated dashboard APIs
```

---

## Setup & Running Locally

### 1. Clone and install

```bash
git clone <repo-url>
cd <project-folder>
npm install
```

### 2. Create `.env` file in root

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_secret_key
ADMIN={"_id":"some_id","email":"admin@example.com","password":"yourpassword","role":"admin"}
```

> **Note:** The `ADMIN` field holds the hardcoded admin credentials as a JSON string. This is intentional — the admin account is not stored in the database, making it isolated from regular user management.

### 3. Start the server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs at `http://localhost:3000`

---

## Roles & Permissions

| Action | Viewer | Analyst | Admin |
|---|:---:|:---:|:---:|
| Login | ✅ | ✅ | ✅ |
| View own profile | ✅ | ✅ | ✅ |
| View dashboard summary | ✅ | ✅ | ✅ |
| View category breakdown | ✅ | ✅ | ✅ |
| View trends | ✅ | ✅ | ✅ |
| View recent activity | ❌ | ✅ | ✅ |
| View financial records | ❌ | ✅ | ✅ |
| Create/Update/Delete records | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

> **Analyst vs Admin on records:** Analysts see only non-deleted records. Admins can see all records including soft-deleted ones.

---

## API Reference

All protected routes require the header:
```
Authorization: Bearer <token>
```

---

### Auth — Users

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/users/register` | Public | Register a new user |
| POST | `/api/users/login` | Public | Login and receive JWT |
| GET | `/api/users/profile` | Any logged-in user | Get own profile |

**POST /api/users/register**
```json
{
  "username": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```
> Role defaults to `viewer`. Role cannot be set at registration — only admin can assign roles.

**POST /api/users/login**
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

---

### Auth — Admin

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/admin/login` | Public | Admin login |

**POST /api/admin/login**
```json
{
  "email": "admin@example.com",
  "password": "yourpassword"
}
```

---

### User Management (Admin only)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/admin/user` | Admin | Create a new user |
| GET | `/api/admin/users` | Admin | List all users (paginated) |
| PATCH | `/api/admin/users/:id` | Admin | Update a user |

**GET /api/admin/users** — Query params:

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Results per page |
| `search` | string | — | Search by name (case-insensitive) |
| `sort` | `asc`/`desc` | `desc` | Sort by creation date |

**PATCH /api/admin/users/:id** — All fields optional:
```json
{
  "name": "New Name",
  "email": "new@email.com",
  "role": "analyst",
  "status": "inactive",
  "isDeleted": true
}
```
> `role` can be set to `viewer` or `analyst` only via this route. Admin role is reserved.

---

### Financial Records

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/records` | Admin | Create a record |
| GET | `/api/records` | Admin, Analyst | List records (filtered, paginated) |
| GET | `/api/records/:id` | Admin, Analyst | Get a single record |
| PUT | `/api/records/:id` | Admin | Update a record |
| DELETE | `/api/records/:id` | Admin | Soft delete a record |

**POST /api/records**
```json
{
  "type": "income",
  "amount": 5000.00,
  "category": "Salary",
  "date": "2025-04-01",
  "notes": "April salary"
}
```

**GET /api/records** — Query params:

| Param | Type | Description |
|---|---|---|
| `type` | `income`/`expense` | Filter by type |
| `category` | string | Filter by category (exact match) |
| `startDate` | ISO8601 | Filter from date |
| `endDate` | ISO8601 | Filter to date |
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 10, max: 100) |

---

### Dashboard Summary

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/dashboard/summary` | Viewer, Analyst, Admin | Total income, expenses, net balance |
| GET | `/api/dashboard/category-breakdown` | Viewer, Analyst, Admin | Totals grouped by category |
| GET | `/api/dashboard/trends` | Viewer, Analyst, Admin | Monthly income/expense trends |
| GET | `/api/dashboard/recent-activity` | Analyst, Admin | Last 5 financial records |

**GET /api/dashboard/category-breakdown** — Optional query param:
- `type=income` or `type=expense` to filter by type

**GET /api/dashboard/trends** — Returns monthly grouped totals:
```json
{
  "success": true,
  "data": [
    { "year": 2025, "month": 3, "type": "income", "total": 15000 },
    { "year": 2025, "month": 3, "type": "expense", "total": 8200 }
  ]
}
```

---

## Access Control Implementation

Access control is handled via two middleware functions in `src/middlewares/auth.js`:

1. **`auth`** — Verifies the JWT token. For regular users, it also queries the DB to confirm the user still exists, is not deleted, and is active. Admin tokens are verified purely by the JWT payload (admin is not stored in DB).

2. **`verifyRole(...roles)`** — A factory function that returns a middleware checking if the authenticated user's role is in the allowed list. Applied per route.

Example:
```js
router.post('/', auth, verifyRole('admin'), controller.createRecord);
```

---

## Data Models

### User
| Field | Type | Notes |
|---|---|---|
| name | String | Required |
| email | String | Required, unique |
| password | String | Bcrypt hashed |
| role | `viewer`/`analyst` | Default: viewer |
| status | `active`/`inactive` | Default: active |
| isDeleted | Boolean | Soft delete flag |

### Financial Record
| Field | Type | Notes |
|---|---|---|
| amount | Number | Min: 0.01 |
| type | `income`/`expense` | Required |
| category | String | Required |
| date | Date | Required, indexed |
| notes | String | Optional, max 500 chars |
| isDeleted | Boolean | Soft delete flag |

Indexes on `type`, `category`, `date`, `isDeleted`, and a compound index on `(type, category, date)` for efficient filtering.

---

## Assumptions & Design Decisions

1. **Admin is not stored in the database.** The admin account is defined via the `ADMIN` env variable as a JSON string. This keeps admin access isolated and prevents it from appearing in user listings or being accidentally modified.

2. **Soft delete is used for both users and financial records.** Records are never permanently deleted. Admin can still see soft-deleted financial records; analysts cannot.

3. **Viewer role cannot access raw financial records.** Viewers can only see aggregated dashboard summaries (totals, trends, breakdowns) — not the underlying transaction data.

4. **Public registration always creates a `viewer`.** Role elevation can only be done by an admin via `PATCH /api/admin/users/:id`.

5. **Rate limiting is global** at 100 requests per 15 minutes per IP. This is applied to all routes.

6. **JWT expiry is 48 hours.** There is no refresh token mechanism — users re-login after expiry. This is acceptable for the scope of this assignment.

7. **`notes` is the field name for record descriptions** in both schema and API — consistent throughout.

---

## Postman Collection

Full API documentation with example requests and responses is available here:
[View Postman Docs](https://documenter.getpostman.com/view/47929773/2sBXiqF98n)

