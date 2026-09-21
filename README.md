# Scan to Capture

**Scan to Capture** is a lightweight, high-utility web-to-extension system designed to bridge mobile phone cameras directly to a PC browser. It allows you to snap a photo with your smartphone camera and automatically receive it on your PC, converted and copied directly to your operating system clipboard (ready to press `Ctrl + V` into ChatGPT, Claude, or any AI chat interface).

This project avoids heavy background RAM usage on your PC and eliminates the friction of syncing files through cloud drives or messaging apps.

---

## 🏗️ Architecture & How It Works

```text
[ PC Extension ] ---> Generates Room ID & Renders QR Code
        |
        v
[ Mobile Phone ] <--- Scans QR Code (Loads HTTPS Web App)
        |
        v
[ Phone Camera ] ---> Snaps Photo, Downsamples Canvas Payload
        |
        v
[ Relay Server ] ---> Relays Base64 Image Payload via Socket.io Room
        |
        v
[ PC Extension ] <--- Formats as PNG Blob & Copies to Clipboard (Ctrl+V)
```

### 1. PC Chrome Extension (Manifest V3)
Opens a popup UI generating a random `roomId` encoded into a QR code pointing to the mobile client URL.

### 2. Mobile Web App (Zero Install)
Scanning the QR code opens a lightweight web page with an `<input type="file" capture="environment">` native camera trigger.

### 3. Node.js + Socket.io Server
Establishes ephemeral Socket.io rooms, bridging communication between the phone client and PC extension.

### 4. Canvas Compression & PNG Conversion
The mobile client downscales smartphone camera captures via HTML5 Canvas to keep payloads under limits, and the PC extension converts received images into an `image/png` Blob to write directly to the system clipboard.

---

## 🛠️ Tech Stack

- **PC Extension:** Chrome Extension Manifest V3, HTML5, Vanilla JavaScript
- **Mobile Client:** HTML5 Canvas, Socket.io Client API
- **Backend Relay Server:** Node.js, Express, Socket.io
- **QR Generation:** External QR API (`api.qrserver.com`)
- **Tunneling (Optional):** `ngrok` for routing past local network AP isolation / strict Wi-Fi subnets

---

## 📂 Project Structure

```text
scan-to-capture/
├── extension/
│   ├── manifest.json      # Manifest V3 permissions & popup config
│   ├── popup.html         # Extension popup UI layout
│   ├── popup.js           # QR generator, Socket listener & clipboard write logic
│   └── socket.io.js       # Standalone Socket.io client library
├── public/
│   └── index.html         # Mobile web app interface & image canvas compression
├── server.js              # Express static server & Socket.io relay handler
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js installed on your PC
- Google Chrome (or any Chromium-based browser) installed
- Phone and PC on the same Wi-Fi network, or use an `ngrok` tunnel for remote connections

---

## 1. Backend Server Setup

Clone or create the project folder and install dependencies:

```bash
npm install express socket.io cors
```

Start the Node.js server:

```bash
node server.js
```

The server will run at:

```text
http://localhost:2000
```

---

## 2. Configure Local IP or ngrok Tunnel

### Option A: Local Network (Wi-Fi)

Find your PC's local Wi-Fi IP address by running:

```bash
ipconfig
```

For example:

```text
172.16.32.176
```

Ensure Windows Firewall permits incoming connections on port `2000` for Node.js.

In `extension/popup.js`, set:

```javascript
const SERVER_URL = 'http://172.16.32.176:2000';
```

### Option B: ngrok Tunnel

If your phone cannot reach your PC over local Wi-Fi due to router isolation or strict institutional network rules:

Start an ngrok tunnel on port `2000`:

```bash
ngrok http 2000
```

Copy the forwarding URL, for example:

```text
https://your-ngrok-subdomain.ngrok-free.dev
```

Then update `extension/popup.js`:

```javascript
const SERVER_URL = 'https://your-ngrok-subdomain.ngrok-free.dev';
```

---

## 3. Load Chrome Extension

1. Open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** using the toggle in the top-right corner.
3. Click **Load unpacked**.
4. Select the `extension/` folder.

---

## 💻 Usage

### 1. Open Extension Popup
Click the **Scan to Capture** extension icon in your PC browser toolbar.

### 2. Scan QR Code
Scan the rendered QR code using your smartphone camera.

### 3. Capture Photo
Tap the photo capture button on your phone to launch the native camera and snap a picture.

### 4. Paste Anywhere
Once the image is sent, the status in the extension popup updates to:

```text
✓ Copied!
```

Press `Ctrl + V` on your PC to paste the image.

### Use in AI Tabs

Focus any text input field on your PC in applications such as:

- ChatGPT
- Claude
- Gemini
- Other AI chat interfaces

Then press:

```text
Ctrl + V
```

to paste the captured image immediately.

---

## 🔒 Permissions & Security

### `clipboardWrite`

Allows the Chrome extension to write image binaries directly to the system clipboard.

### Ephemeral Room Sessions

Socket.io rooms use randomized session strings such as:

```javascript
Math.random().toString(36)
```

This keeps transmission scoped to the specific session/room.

### In-Memory Payloads

Image data exists as Base64/PNG buffers only during transmission and is immediately discarded afterward. No image files need to be stored on disk, helping prevent unnecessary disk usage and persistent image storage.

---

## 🔄 Data Flow Summary

```text
Smartphone Camera
       │
       ▼
Capture Image
       │
       ▼
HTML5 Canvas
       │
       ▼
Downsample / Compress
       │
       ▼
Base64 Payload
       │
       ▼
Socket.io Room
       │
       ▼
Node.js Relay Server
       │
       ▼
PC Chrome Extension
       │
       ▼
PNG Blob
       │
       ▼
System Clipboard
       │
       ▼
Ctrl + V
```

---

## 🎯 Goal

**Scan to Capture** provides a fast bridge between a smartphone camera and a PC browser without requiring users to:

- Upload images to cloud storage
- Send images through messaging applications
- Download images manually
- Keep a heavy desktop application running in the background

The intended workflow is simple:

**Scan → Capture → Transfer → Paste**
