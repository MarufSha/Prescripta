# 🩺 Prescripta

A modern, role-based healthcare management platform designed to connect **patients**, **doctors**, and **administrators** in a secure, scalable system.

Built with a focus on **clean UI**, **strict role control**, and **real-world workflow simulation**, Prescripta provides a foundation for digital healthcare platforms.

---

## 🚀 Features

### 🔐 Authentication & Security

* Secure login & signup system
* Email verification flow
* Manual admin verification support
* Role-based access control (RBAC)

### 👤 Role System

* **Admin**

  * Manage users
  * Verify accounts manually
  * Assign or change roles (Doctor / Patient)
  * Delete users (with restrictions)

* **Doctor**

  * Maintain professional profile
  * Add specialties, degrees, designations
  * Manage chamber information

* **Patient**

  * Access platform services
  * Interact with system features (expandable)

---

### 🧠 Smart Role Management

* Prevents self-role modification
* Protects admin accounts from deletion
* Preserves doctor profile data even after role downgrade
* Validates doctor profiles before role conversion

---

### 📊 Admin Dashboard

* Paginated user table
* Bulk actions:

  * Change roles
  * Delete users
  * Verify users
* Advanced UI interactions (modals, tooltips, selection logic)

---

### 🎨 UI/UX

* Dark theme with emerald accent
* Glassmorphism-inspired design
* Responsive layout
* Built using modern component systems (shadcn-style UI)

---

## 🛠️ Tech Stack

### Frontend

* Next.js (App Router)
* React
* Tailwind CSS
* shadcn/ui components
* Zustand (state management)

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)

### Other

* JWT Authentication (httpOnly cookies)
* Email service integration (verification + welcome emails)

---

## 📂 Project Structure

```
/frontend
  /src
    /app
    /components
    /store
    /utils

/backend
  /controllers
  /models
  /routes
  /middleware
```

---

## ⚙️ Key Functional Highlights

* **Doctor Profile Validation**

  * Requires specialties, degrees, chambers, and contact info
  * Prevents incomplete professional data

* **Admin Restrictions**

  * Cannot delete themselves
  * Cannot modify other admins
  * Controlled role transitions

* **Data Sanitization**

  * Cleaned and structured user responses
  * Safe exposure of user data to frontend

---

## 🧪 Future Improvements

* Appointment booking system
* Prescription management
* Real-time chat between doctor and patient
* File uploads (medical reports)
* Analytics dashboard for admins
* Cloud deployment (AWS / Vercel)

---

## 📸 Screenshots (Coming Soon)


---

## 🧑‍💻 Author

**Maruf Shahriar**

---

## ⭐ Final Note

This project is built not just as a demo, but as a **realistic system design exercise** — focusing on how roles, permissions, and workflows behave in actual production environments.
