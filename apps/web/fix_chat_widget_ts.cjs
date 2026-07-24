const fs = require('fs');
const path = require('path');

const chatWidgetPath = path.join(__dirname, 'src', 'portals', 'client', 'components', 'ChatWidget.tsx');
let chatWidgetContent = fs.readFileSync(chatWidgetPath, 'utf8');

chatWidgetContent = chatWidgetContent.replace(/updatedAt: new Date\(\)\.toISOString\(\),\s*/g, '');
chatWidgetContent = chatWidgetContent.replace(/updatedAt: new Date\(\)\.toISOString\(\)\s*/g, '');

fs.writeFileSync(chatWidgetPath, chatWidgetContent);
console.log('Fixed TS errors in ChatWidget');
