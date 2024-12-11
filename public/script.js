const socket = io();
const textarea = document.getElementById('notepad');
const cursorContainer = document.getElementById('cursor-container');

// Generate a unique color for each user
const userColor = `hsl(${Math.random() * 360}, 100%, 50%)`;

let cursorPosition = { start: 0, end: 0 };

// Keep track of the user's own cursor position
let userCursor = { start: 0, end: 0 };

// Update cursor position and send it to the server
function updateCursorPosition() {
    userCursor.start = textarea.selectionStart;
    userCursor.end = textarea.selectionEnd;
    socket.emit('cursor-move', userCursor); // Send only this user's cursor position
}

// Listen for text input changes and send updates to the server
textarea.addEventListener('input', () => {
    socket.emit('text-changed', textarea.value); // Send updated text to server
    updateCursorPosition(); // Send updated cursor position
});

// Listen for keyup to ensure the cursor position is updated
textarea.addEventListener('keyup', () => {
    updateCursorPosition();
});

// Update the text content when the server broadcasts new text
socket.on('update-text', (newText) => {
    textarea.value = newText; // Update text content
});

// Handle other users' cursor movements
socket.on('cursor-update', (data) => {
    const { userId, position, color } = data;

    // Create a cursor element for new users
    let cursorElem = document.getElementById(`cursor-${userId}`);
    
    if (!cursorElem) {
        cursorElem = document.createElement('div');
        cursorElem.id = `cursor-${userId}`;
        cursorElem.className = 'cursor';
        cursorElem.style.backgroundColor = color;
        cursorContainer.appendChild(cursorElem);
    }

    // Position the cursor relative to the textarea
    const textareaRect = textarea.getBoundingClientRect();
    const cursorPos = getCursorCoordinates(position.start);

    cursorElem.style.top = `${cursorPos.top + textareaRect.top}px`;
    cursorElem.style.left = `${cursorPos.left + textareaRect.left}px`;
});

// Function to calculate the cursor coordinates based on the caret position
function getCursorCoordinates(position) {
    const textBeforeCursor = textarea.value.substring(0, position);
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.whiteSpace = 'pre-wrap';
    div.textContent = textBeforeCursor;
    document.body.appendChild(div);
    const rect = div.getBoundingClientRect();
    document.body.removeChild(div);
    return { top: rect.top, left: rect.left };
}
