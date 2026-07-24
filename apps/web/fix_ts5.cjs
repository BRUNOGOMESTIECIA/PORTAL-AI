const fs = require('fs');
const path = require('path');

const chatQueue = path.join(__dirname, 'src', 'portals', 'operational', 'pages', 'ChatQueuePage.tsx');
let chatQueueContent = fs.readFileSync(chatQueue, 'utf8');

// Replace setSelectedId(prev => { ... })
chatQueueContent = chatQueueContent.replace(/setSelectedId\(prev => \{[\s\S]*?\}\);/g, '');

// Also replace `currentChat.messages.push` and similar which we missed
chatQueueContent = chatQueueContent.replace(/currentChat\.messages\.push\(clientReply\);/g, 
  'updateChat(currentChat.id, { messages: [...currentChat.messages, clientReply] });');

chatQueueContent = chatQueueContent.replace(/chatInMock\.messages\.push\(newMsg\);/g, 
  'updateChat(chatInMock.id, { messages: [...chatInMock.messages, newMsg] });');

chatQueueContent = chatQueueContent.replace(/chatInMockNow\.messages\.push\(clientReply\);/g, 
  'updateChat(chatInMockNow.id, { messages: [...chatInMockNow.messages, clientReply] });');

chatQueueContent = chatQueueContent.replace(/chatInMockNow\.messages\.push\(staffReply\);/g, 
  'updateChat(chatInMockNow.id, { messages: [...chatInMockNow.messages, staffReply] });');

fs.writeFileSync(chatQueue, chatQueueContent);
console.log('Fixed typescript errors part 5');
