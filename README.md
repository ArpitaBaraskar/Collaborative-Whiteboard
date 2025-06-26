# 🎨 Collaborative Whiteboard Application

A real-time collaborative whiteboard built with the **MERN stack** and **Socket.io**. Users can draw on a shared canvas, see others' cursors live, and collaborate in real-time using unique room codes.

---

## 📁 Project Structure
```
project-root/
├── client/ # React frontend
│ ├── src/
│ ├── public/
│ └── package.json
├── server/ # Node.js backend
│ ├── models/
│ ├── routes/
│ ├── socket/
│ └── server.js
├── README.md
└── package.json
```
---

## ⚙️ Setup Instructions

### Prerequisites

- Node.js & npm
- MongoDB

### Backend

```bash
cd server
npm install
npm start
```

### Frontend

```bash
cd client
npm install
npm start
```

### Full Application

- Run MongoDB (mongod)
- Start the backend server
- Start the frontend
---

## API Documentation

### REST Endpoints

- `POST /api/rooms/join`  
  Join or create a room  
  **Body**: `{ roomId: string }`

- `GET /api/rooms/:roomId`  
  Fetch room information

### Socket Events

| Event          | Payload                  | Description                |
| -------------- | ------------------------ | -------------------------- |
| `join-room`    | `{ roomId, socketId }`   | Join a room                |
| `leave-room`   | `{ roomId }`             | Leave the room             |
| `cursor-move`  | `{ x, y, userId }`       | Share cursor position      |
| `draw-start`   | `{ x, y, color, width }` | Start a drawing stroke     |
| `draw-move`    | `{ x, y }`               | Continue drawing           |
| `draw-end`     | `null`                   | End drawing                |
| `clear-canvas` | `null`                   | Clear canvas for all users |

---

## Architecture Overview

### Frontend

- `RoomJoin.js`: Room code input
- `Whiteboard.js`: Main whiteboard component
- `DrawingCanvas.js`: HTML5 canvas drawing logic
- `Toolbar.js`: Drawing controls (color, stroke, clear)
- `UserCursors.js`: Track other users' cursors

### Backend

- Express REST API
- Socket.io real-time communication
- MongoDB for room persistence

### MongoDB Schema

```js
// Room Schema
{
  roomId: String,
  createdAt: Date,
  lastActivity: Date,
  drawingData: [ DrawingCommand ]
}

// DrawingCommand Schema
{
  type: 'stroke' | 'clear',
  data: {
    path: [{ x, y }],
    color: String,
    width: Number
  },
  timestamp: Date
}
```

---

## Deployment Guide

### Recommended Stack

- **Frontend**: Vercel / Netlify
- **Backend**: Render / Heroku
- **Database**: MongoDB Atlas

### Steps

1. Deploy frontend (GitHub → Vercel)
2. Deploy backend (Render/Heroku)
3. Set `MONGO_URI` env variable in backend
4. Configure CORS and WebSocket in production

---

## Best Practices

- Throttle cursor updates (~60fps)
- Compress/stage drawing data before DB writes
- Use unique colors for each user cursor
- Clean up rooms inactive > 24 hours

---

## Features Checklist

- [x] Create/Join room by code
- [x] Real-time collaborative drawing
- [x] Real-time cursor tracking
- [x] Adjustable stroke width
- [x] Color selection
- [x] Clear canvas option
- [x] MongoDB persistence
- [x] Responsive UI
- [x] Active user display

---

## Developed By

**Arpita Baraskar**  
MERN Stack Developer  
🔗 [Portfolio](https://arpita-portfolio-theta.vercel.app)  
💻 [GitHub](https://github.com/ArpitaBaraskar)

---
