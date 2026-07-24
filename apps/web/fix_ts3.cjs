const fs = require('fs');
const path = require('path');

const chatQueue = path.join(__dirname, 'src', 'portals', 'operational', 'pages', 'ChatQueuePage.tsx');
let chatQueueContent = fs.readFileSync(chatQueue, 'utf8');

// The issue is multiple setSelectedId calls. Let's find them with a more robust regex or just string replacement
chatQueueContent = chatQueueContent.replace(/setSelectedId\(\(prev\) => \{[\s\S]*?return \{ \.\.\.prev, status: 'active', agentName: user\.name \};\s*\}\);/g, 
  "if (selectedId) updateChat(selectedId, { status: 'active', agentName: user.name });");
  
chatQueueContent = chatQueueContent.replace(/setSelectedId\(\(prev\) => \{\s*if \(\!prev\) return prev;\s*return \{ \.\.\.prev, status: 'active' \};\s*\}\);/g, 
  "if (selectedId) updateChat(selectedId, { status: 'active' });");

chatQueueContent = chatQueueContent.replace(/setSelectedId\(\(prev\) => \{\s*if \(\!prev\) return prev;\s*return \{ \.\.\.prev, status: 'finished' \};\s*\}\);/g, 
  "if (selectedId) updateChat(selectedId, { status: 'finished' });");

chatQueueContent = chatQueueContent.replace(/setSelectedId\(\(prev\) => \{\s*if \(\!prev\) return prev;\s*return \{ \.\.\.prev, status: 'closed' \};\s*\}\);/g, 
  "if (selectedId) updateChat(selectedId, { status: 'closed' });");

// The one returning `{ ...updatedChat } : prev`
chatQueueContent = chatQueueContent.replace(/setSelectedId\(prev => \{[\s\S]*?return updatedChat \? \{ \.\.\.updatedChat \} : prev;[\s\S]*?\}\);/g, '');

// If there's any `setSelectedId({ ...prev, status: 'closed' })` etc
chatQueueContent = chatQueueContent.replace(/setSelectedId\(\{ \.\.\.selected, status: 'closed' \}\);/g, 
  "if (selectedId) updateChat(selectedId, { status: 'closed' });");

// Let's replace any lingering `prev =>` in setSelectedId
chatQueueContent = chatQueueContent.replace(/setSelectedId\(\(prev\) => /g, '/* removed */(');

fs.writeFileSync(chatQueue, chatQueueContent);

const clientTickets = path.join(__dirname, 'src', 'portals', 'client', 'pages', 'ClientTicketsPage.tsx');
let clientTicketsContent = fs.readFileSync(clientTickets, 'utf8');
clientTicketsContent = clientTicketsContent.replace(/\{selectedTicket\.tags\?\.map/g, '{selectedTicket?.tags?.map');
fs.writeFileSync(clientTickets, clientTicketsContent);

console.log('Fixed typescript errors part 3');
