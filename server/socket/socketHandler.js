const Room = require('../models/Room');

const socketHandler = (io) => {
  // Store active rooms and user counts
  const activeRooms = new Map();
  
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', async (roomId) => {
      try {
        socket.join(roomId);
        socket.currentRoom = roomId;

        // Update room activity
        await Room.findOneAndUpdate(
          { roomId },
          { lastActivity: new Date() },
          { upsert: true }
        );

        // Track active users
        if (!activeRooms.has(roomId)) {
          activeRooms.set(roomId, new Set());
        }
        activeRooms.get(roomId).add(socket.id);

        // Notify room of user count
        const userCount = activeRooms.get(roomId).size;
        io.to(roomId).emit('user-count', userCount);

        console.log(`User ${socket.id} joined room ${roomId}`);
      } catch (error) {
        socket.emit('error', 'Failed to join room');
      }
    });

    socket.on('cursor-move', (data) => {
      if (socket.currentRoom) {
        socket.to(socket.currentRoom).emit('cursor-move', {
          userId: socket.id,
          x: data.x,
          y: data.y
        });
      }
    });

    socket.on('draw-start', async (data) => {
      if (socket.currentRoom) {
        socket.to(socket.currentRoom).emit('draw-start', data);
        
        // Save to database
        await Room.findOneAndUpdate(
          { roomId: socket.currentRoom },
          { 
            $push: { 
              drawingData: {
                type: 'stroke',
                data: { ...data, action: 'start' },
                timestamp: new Date()
              }
            },
            lastActivity: new Date()
          }
        );
      }
    });

    socket.on('draw-move', async (data) => {
      if (socket.currentRoom) {
        socket.to(socket.currentRoom).emit('draw-move', data);
        
        // Save to database (throttled)
        await Room.findOneAndUpdate(
          { roomId: socket.currentRoom },
          { 
            $push: { 
              drawingData: {
                type: 'stroke',
                data: { ...data, action: 'move' },
                timestamp: new Date()
              }
            },
            lastActivity: new Date()
          }
        );
      }
    });

    socket.on('draw-end', async (data) => {
      if (socket.currentRoom) {
        socket.to(socket.currentRoom).emit('draw-end', data);
        
        // Save to database
        await Room.findOneAndUpdate(
          { roomId: socket.currentRoom },
          { 
            $push: { 
              drawingData: {
                type: 'stroke',
                data: { ...data, action: 'end' },
                timestamp: new Date()
              }
            },
            lastActivity: new Date()
          }
        );
      }
    });

    socket.on('clear-canvas', async () => {
      if (socket.currentRoom) {
        socket.to(socket.currentRoom).emit('clear-canvas');
        
        // Clear drawing data in database
        await Room.findOneAndUpdate(
          { roomId: socket.currentRoom },
          { 
            drawingData: [{
              type: 'clear',
              data: {},
              timestamp: new Date()
            }],
            lastActivity: new Date()
          }
        );
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      if (socket.currentRoom && activeRooms.has(socket.currentRoom)) {
        activeRooms.get(socket.currentRoom).delete(socket.id);
        
        const userCount = activeRooms.get(socket.currentRoom).size;
        io.to(socket.currentRoom).emit('user-count', userCount);
        
        // Remove cursor
        socket.to(socket.currentRoom).emit('user-disconnected', socket.id);
        
        // Clean up empty rooms
        if (userCount === 0) {
          activeRooms.delete(socket.currentRoom);
        }
      }
    });
  });
};

module.exports = socketHandler;