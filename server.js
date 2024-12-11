const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let notepadContent = '';  // Store the shared text content
let users = {};           // Store user data (userId, color)

io.on('connection', (socket) => {
    console.log('A user connected');
    
    // Assign a unique color to each user
    const userColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
    users[socket.id] = { color: userColor };

    // Send the user's color and initial cursor position
    socket.emit('cursor-update', { userId: socket.id, color: userColor, position: { start: 0, end: 0 } });
    socket.emit('update-text', notepadContent); // Send current notepad content

    // Broadcast other users' cursor position to this new user
    for (const userId in users) {
        if (userId !== socket.id) {
            socket.emit('cursor-update', { userId, color: users[userId].color, position: { start: 0, end: 0 } });
        }
    }

    // Handle real-time typing changes
    socket.on('text-changed', (data) => {
        notepadContent = data;
        // Broadcast the new content to all users
        socket.broadcast.emit('update-text', data);
    });

    // Handle cursor movements
    socket.on('cursor-move', (position) => {
        io.emit('cursor-update', { userId: socket.id, color: users[socket.id].color, position });
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
        delete users[socket.id];  // Remove user from the list on disconnect
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
