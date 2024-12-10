const socket = io();

const textarea = document.getElementById('notepad');

// Send text to the server on change
textarea.addEventListener('input', () => {
    socket.emit('text-changed', textarea.value);
});

// Update text area when server sends changes
socket.on('update-text', (data) => {
    textarea.value = data;
});
