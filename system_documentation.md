# EV Data Acquisition System - Technical Documentation

## 🔗 System Overview
The **EV Data Acquisition System** is a professional-grade MERN stack application (MongoDB, Express, React, Node.js) designed for real-time telemetry monitoring, fleet diagnostics, and hardware infrastructure management.

---

## 🏗️ 1. Architecture Stack

### **Frontend (Terminal Interface)**
- **Framework**: React.js with Vite
- **Styling**: Vanilla CSS with Tailwind CSS for high-density layouts.
- **Iconography**: Lucide React (Premium "Zap" branding).
- **Visualization**: ApexCharts (Time-series telemetry) & Leaflet (GPS Geofencing).
- **API Client**: Axios with interceptors for JWT management.

### **Backend (Data Engine)**
- **Runtime**: Node.js & Express
- **Database**: MongoDB (Atlas) for telemetry persistence.
- **Real-time**: Socket.io for millisecond-precision dashboard updates.
- **Authentication**: JSON Web Tokens (JWT) & 6-Digit OTP Handshakes (Nodemailer).
- **File Storage**: Multer-based infrastructure for OTA firmware (.bin).

---

## 📡 2. Frontend & Backend Connection

The connection between the UI and server is governed by a secure, token-based architecture.

### **A. API Communication (Axios)**
All frontend requests are routed through a centralized API instance.
- **Environment**: `VITE_API_URL` (Defaults to `http://localhost:5000/api`)
- **Headers**: Every protected request automatically attaches the `Authorization: Bearer <token>` header stored in `LocalStorage` upon a successful login.

### **B. Real-time Telemetry Flow (Socket.io)**
The dashboard does not rely solely on polling; it uses a bi-directional WebSocket connection.
1. **Source**: ESP32 Hardware or Postman simulation posts data to `/api/device-data`.
2. **Backend**: Receives data, saves it to MongoDB, and immediately emits a `telemetry-update` event via Socket.io.
3. **Frontend**: The `Dashboard.jsx` component listens for this event and updates the KPI cards and sparklines instantly without a page refresh.

### **C. Authentication Flow**
1. **Login**: User posts email/password to `/api/auth/login`.
2. **JWT**: Backend returns a signed token.
3. **Storage**: Frontend stores the token in `AuthContext` and persist it in `LocalStorage`.
4. **Verification**: `AdminRoute.jsx` and `ProtectedRoute.jsx` verify the token's validity before allowing access to the dashboard.

---

## 🛰️ 3. Hardware Integration (ESP32 / IoT)

### **Telemetry Ingestion**
Devices transmit a JSON payload to the `/api/device-data` endpoint:
```json
{
  "deviceId": "EV-X1-P01",
  "batterySOC": 92,
  "batteryVoltage": 402,
  "gpsLatitude": 20.296,
  "gpsLongitude": 85.824
}
```

### **OTA Infrastructure (Over-the-Air Updates)**
1. **Upload**: Admins upload a `.bin` firmware file via the **OTA Dispatch Center**.
2. **Storage**: Files are hosted in the `/backend/uploads/` directory.
3. **Trigger**: When an ESP32 checks in via `/api/ota/device-ping`, the backend serves the location of the new firmware if a version mismatch is detected.

---

## 🛠️ 4. Environment Configuration

### **Backend (.env)**
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_complex_security_key
EMAIL_USER=your_smtp_email
EMAIL_PASS=your_smtp_app_password
```

### **Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000
```

---

## 🚀 5. Getting Started

### **Running the System**
1. **Clone & Install**:
   ```bash
   npm install --prefix backend
   npm install --prefix frontend
   ```
2. **Start Backend**:
   ```bash
   cd backend && npm start
   ```
3. **Start Frontend**:
   ```bash
   cd frontend && npm run dev
   ```

---

> [!NOTE]
> **Microsoft Word Export**: To create a Word file, copy all content above, open a new Word document, and paste. The Markdown formatting will translate into professional headings and code blocks.
