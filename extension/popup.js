const SERVER_URL = 'https://confused-recreate-bonus.ngrok-free.dev';

// 1. Generate Room ID once
const roomId = Math.random().toString(36).substring(2, 9);
const mobileUrl = `${SERVER_URL}/?room=${roomId}`;

// 2. Set QR Code
const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(mobileUrl)}`;
document.getElementById('qrcode').src = qrImageUrl;

const statusEl = document.getElementById('status');
statusEl.textContent = `Room: ${roomId} - Scan with phone...`;

// 3. Connect and join THAT SPECIFIC room
// Force WebSocket transport to skip ngrok's HTTP polling restrictions
const socket = io(SERVER_URL, {
  transports: ['websocket']
});

socket.on('connect', () => {
  console.log('Extension connected to socket server with ID:', socket.id);
  socket.emit('join-room', roomId);
});

socket.on('receive-image', async (base64Image) => {
  statusEl.textContent = "Photo received! Writing to clipboard...";

  try {
    // 1. Decode image and render onto PNG canvas
    const img = new Image();
    img.src = base64Image;
    await img.decode();

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // 2. Extract PNG Blob
    const pngBlob = await new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    });

    if (!pngBlob) {
      throw new Error("Failed to process image Blob.");
    }

    // 3. Write to Clipboard using un-focused promise wrapper
    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': pngBlob
      })
    ]);

    statusEl.textContent = "✓ Copied! Press Ctrl+V on PC.";
    console.log("Clipboard write successful!");
  } catch (err) {
    console.error("Clipboard error:", err);
    statusEl.textContent = "Failed. Click inside popup and try again!";
  }
});