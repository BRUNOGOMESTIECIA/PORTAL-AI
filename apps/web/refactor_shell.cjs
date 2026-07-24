const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'portals', 'operational', 'OperationalShell.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Imports
content = content.replace(/import \{ MOCK_CHAT_SESSIONS, MOCK_STAFF \} from '\.\.\/\.\.\/mocks\/data';/, 
`import { MOCK_STAFF } from '../../mocks/data';
import { useChats } from '../../hooks/use-chats';`);

// GlobalChatAlerts
content = content.replace(/function GlobalChatAlerts\(\{ collapsed \}: \{ collapsed\?: boolean \}\) \{([\s\S]*?)const \[alerts, setAlerts\] = useState/,
`function GlobalChatAlerts({ collapsed }: { collapsed?: boolean }) {
  const { chats, updateChat } = useChats();
  const [alerts, setAlerts] = useState`);

// Replace MOCK_CHAT_SESSIONS.forEach
content = content.replace(/MOCK_CHAT_SESSIONS\.forEach\(chat => \{([\s\S]*?)chat\.messages\.push\(\{([\s\S]*?)\}\);([\s\S]*?)hasChanges = true;([\s\S]*?)\}\);/g, 
`chats.forEach(chat => {$1updateChat(chat.id, { messages: [...chat.messages, {$2}] });$3hasChanges = true;$4});`);

// Remove chat_update dispatch
content = content.replace(/if \(hasChanges\) \{\n\s*window\.dispatchEvent\(new Event\('chat_update'\)\);\n\s*\}/g, '');

// Replace all remaining MOCK_CHAT_SESSIONS
content = content.replace(/MOCK_CHAT_SESSIONS/g, 'chats');

fs.writeFileSync(filePath, content);
console.log('Refactoring OperationalShell done.');
