const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let notepadContent = ''; // Shared text content

io.on('connection', (socket) => {
    console.log('A user connected');

    // Send current content to new user
    socket.emit('update-text', notepadContent);

    // Update content and broadcast changes
    socket.on('text-changed', (data) => {
        notepadContent = data;
        socket.broadcast.emit('update-text', data);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
