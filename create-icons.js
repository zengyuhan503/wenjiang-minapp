const fs = require('fs');
const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==';

fs.writeFileSync('static/image/company-house.png', Buffer.from(base64Image, 'base64'));
fs.writeFileSync('static/image/ticket-orange.png', Buffer.from(base64Image, 'base64'));
fs.writeFileSync('static/image/close-icon.png', Buffer.from(base64Image, 'base64'));
console.log('Icons created successfully');
