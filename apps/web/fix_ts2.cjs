const fs = require('fs');
const path = require('path');

const chatQueue = path.join(__dirname, 'src', 'portals', 'operational', 'pages', 'ChatQueuePage.tsx');
let chatQueueContent = fs.readFileSync(chatQueue, 'utf8');

// Fix `setSelectedId(chat)` -> `setSelectedId(chat.id)`
chatQueueContent = chatQueueContent.replace(/setSelectedId\(chat\)/g, 'setSelectedId(chat.id)');
chatQueueContent = chatQueueContent.replace(/setSelectedId\(found\)/g, 'setSelectedId(found.id)');

// Fix `setSelectedId(prev => ...)` since we don't need it because selected is computed from selectedId
chatQueueContent = chatQueueContent.replace(/setSelectedId\(\(prev\) => \{[\s\S]*?return updatedChat \? \{ \.\.\.updatedChat \} : prev;[\s\S]*?\}\);/g, '');
chatQueueContent = chatQueueContent.replace(/setSelectedId\(\(prev\) => \{\s*if \(\!prev\) return prev;\s*return \{ \.\.\.prev, status: 'active', agentName: user\.name \};\s*\}\);/g, '');
chatQueueContent = chatQueueContent.replace(/setSelectedId\(\(prev\) => \{\s*if \(\!prev\) return prev;\s*return \{ \.\.\.prev, status: 'finished' \};\s*\}\);/g, '');
chatQueueContent = chatQueueContent.replace(/setSelectedId\(\(prev\) => \{\s*if \(\!prev\) return prev;\s*return \{ \.\.\.prev, status: 'closed' \};\s*\}\);/g, '');

// Also remove `chat.messages.push` inside useEffect and replace with `updateChat`
chatQueueContent = chatQueueContent.replace(/chat\.messages\.push\(\{([\s\S]*?)\}\);/g, 
  'updateChat(chat.id, { messages: [...chat.messages, {$1}] });');
// Replace `setSelectedId(null)` which was actually `setSelected(null)` before my replace
// Oh wait, `setSelectedId(null)` is fine!

fs.writeFileSync(chatQueue, chatQueueContent);

const clientHome = path.join(__dirname, 'src', 'portals', 'client', 'pages', 'ClientHomePage.tsx');
let clientHomeContent = fs.readFileSync(clientHome, 'utf8');
clientHomeContent = clientHomeContent.replace(/import \{ MockClient, MOCK_KB_ARTICLES, MockKbArticle \} from '\.\.\/\.\.\/\.\.\/mocks\/data';/, 
  'import { MockClient, MOCK_KB_ARTICLES, MockKbArticle, MockTicket } from \'../../../mocks/data\';');
fs.writeFileSync(clientHome, clientHomeContent);

console.log('Fixed typescript errors');
