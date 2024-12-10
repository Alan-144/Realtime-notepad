const socket = io();
const textarea = document.getElementById('notepad');
const cursorContainer = document.getElementById('cursor-container');

// Each user will have a unique color for their cursor
const userColor = `hsl(${Math.random() * 360}, 100%, 50%)`;

// Store the cursor’s position
let cursorPosition = { start: 0, end: 0 };

// Function to update the cursor’s position based on caret position
function updateCursorPosition() {
    cursorPosition.start = textarea.selectionStart;
    cursorPosition.end = textarea.selectionEnd;
    socket.emit('cursor-move', cursorPosition);
}

// Listen for cursor movements and updates
textarea.addEventListener('input', () => {
    updateCursorPosition();
});

textarea.addEventListener('keyup', () => {
    updateCursorPosition();
});

// Listen for cursor updates from other users
socket.on('cursor-update', (data) => {
    const { userId, position } = data;
    let cursorElem = document.getElementById(`cursor-${userId}`);
    
    if (!cursorElem) {
        // Create a new cursor element for the user
        cursorElem = document.createElement('div');
        cursorElem.id = `cursor-${userId}`;
        cursorElem.className = 'cursor';
        cursorElem.style.backgroundColor = data.color; // Set the cursor color
        cursorContainer.appendChild(cursorElem);
    }

    // Update cursor position
    const textareaRect = textarea.getBoundingClientRect();
    const cursorPos = getCursorCoordinates(position.start);

    cursorElem.style.top = `${cursorPos.top + textareaRect.top}px`;
    cursorElem.style.left = `${cursorPos.left + textareaRect.left}px`;
});

// Function to get coordinates of the cursor in the textarea
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
