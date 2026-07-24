const fs = require('fs');
const path = require('path');

const chatQueue = path.join(__dirname, 'src', 'portals', 'operational', 'pages', 'ChatQueuePage.tsx');
let chatQueueContent = fs.readFileSync(chatQueue, 'utf8');

chatQueueContent = chatQueueContent.replace(/currentChat\.messages\.push\(clientReply\);\s*\/\*\s*removed\s*\*\/\(\(\{[\s\S]*?\}\);/g, 
  'updateChat(currentChat.id, { messages: [...currentChat.messages, clientReply] });');

chatQueueContent = chatQueueContent.replace(/setSelectedId\(chatInMock \? \{ \.\.\.chatInMock \} : \{ \.\.\.selected, status: newStatus \}\);/g, '');

chatQueueContent = chatQueueContent.replace(/chatInMock\.messages\.push\(newMsg\);\s*\/\*\s*removed\s*\*\/\(\(\{[\s\S]*?\}\);/g, 
  'updateChat(chatInMock.id, { messages: [...chatInMock.messages, newMsg] });');

chatQueueContent = chatQueueContent.replace(/chatInMockNow\.messages\.push\(clientReply\);\s*\/\*\s*removed\s*\*\/\(\(\{[\s\S]*?\}\);/g, 
  'updateChat(chatInMockNow.id, { messages: [...chatInMockNow.messages, clientReply] });');

chatQueueContent = chatQueueContent.replace(/chatInMockNow\.messages\.push\(staffReply\);\s*\/\*\s*removed\s*\*\/\(\(\{[\s\S]*?\}\);/g, 
  'updateChat(chatInMockNow.id, { messages: [...chatInMockNow.messages, staffReply] });');

fs.writeFileSync(chatQueue, chatQueueContent);
console.log('Fixed typescript errors part 4');
