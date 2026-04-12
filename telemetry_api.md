# EV Data Acquisition System - Telemetry API Documentation

This document provides a comprehensive guide for interacting with the backend API. All endpoints are designed to be tested using **Postman** or simulated via hardware (ESP32).

---

## 🛠️ Global Configuration

### Base URL
- **Development**: `http://localhost:5000/api`
- **Production**: Update this to your deployed backend URL.

### Authentication Header
Most protected routes require a JWT token:
`Authorization: Bearer <your_jwt_token>`

---

## 🔐 1. Authentication Module
Manage user access and node provisioning.

### 📥 POST /auth/register
Register a new operator or admin.
- **Body (JSON)**:
```json
{
  "email": "operator@io.node",
  "password": "secure_password_123",
  "role": "admin" 
}
```

### 🔑 POST /auth/login
Generate a session token.
- **Body (JSON)**:
```json
{
  "email": "operator@io.node",
  "password": "secure_password_123"
}
```
- **Response**: Returns a `token` to be used in the Authorization header.

### 📩 POST /auth/send-otp
Send a 6-digit handshake code for verification.
- **Body (JSON)**:
```json
{
  "email": "operator@io.node"
}
```

### 🛡️ POST /auth/verify-otp
Verify the handshake code.
- **Body (JSON)**:
```json
{
  "email": "operator@io.node",
  "otp": "123456"
}
```

---

## 📊 2. Telemetry & Data Module
The core ingestion engine for hardware simulation and data retrieval.

### 📡 POST /device-data (Public / ESP32)
Primary endpoint for transmitting real-time vehicle metrics.
- **Body (JSON)**:
```json
{
  "deviceId": "EV-TRK-9901",
  "batterySOC": 85.5,
  "batteryVoltage": 398.2,
  "batteryTemperature": 32.5,
  "motorTemperature": 45.1,
  "motorRPM": 4500,
  "wheelRPM": 1200,
  "loss": 2.4,
  "torque": 250.5,
  "gpsLatitude": 20.2961,
  "gpsLongitude": 85.8245
}
```

### 📜 GET /vehicle/history (Protected)
Fetch past telemetry for a specific device.
- **Query Params**: `?deviceId=EV-TRK-9901&limit=50`
- **Response**: Array of historical data points sorted by time.

### 📍 GET /vehicle/latest (Protected)
Get the single most recent state of a vehicle.
- **Query Params**: `?deviceId=EV-TRK-9901`

### 📥 GET /download (Protected)
Download full telemetry history in Excel format.
- **Query Params**: `?deviceId=EV-TRK-9901`

---

## 🏗️ 3. Fleet & Dashboard Management
Register nodes and configure live monitors.

### 🖥️ GET /dashboards (Protected)
List all active telemetry workstations.

### ➕ POST /dashboards (Admin Only)
Provision a new dashboard workstation for a device.
- **Body (JSON)**:
```json
{
  "dashboardName": "Fleet Node A1",
  "deviceId": "EV-TRK-9901"
}
```

### 🗑️ DELETE /dashboards/:id (Admin Only)
Decommission a dashboard.

### 📟 GET /devices (Protected)
List all connected ESP32/Hardware nodes and their last-seen status.

---

## 🚀 4. OTA Infrastructure
Manage over-the-air firmware updates for the hardware nodes.

### 🛰️ GET /ota/device-ping
ESP32 heartbeat to check for pending updates.
- **Query Params**: `?deviceId=EV-TRK-9901`

### 📤 POST /ota/upload/:deviceId (Admin)
Upload a `.bin` firmware file directly to the server.
- **Form-Data**:
  - `firmware`: [Binary File]

### 🔗 POST /ota/update-link/:deviceId (Admin)
Trigger an update via a GitHub or CDN link.
- **Body (JSON)**:
```json
{
  "firmwareUrl": "https://github.com/user/repo/raw/main/build/v2.bin"
}
```

---

## 👥 5. User & System Management

### 🔍 GET /users (Admin)
List all provisioned accounts.

### 🔄 PUT /users/:id (Admin)
Update user privileges or profile.
- **Body (JSON)**:
```json
{
  "role": "admin"
}
```

### 🚨 GET /logs (Protected)
View system-wide security and operational logs.

---

> [!TIP]
> **Postman Tip**: Create an Environment in Postman called `EV-Acquisition` and add a variable `token`. In the **Login** request's "Tests" tab, add:
> `pm.environment.set("token", pm.response.json().token);`
> Then, in all other requests, set the Auth type to **Bearer Token** and use `{{token}}`.
