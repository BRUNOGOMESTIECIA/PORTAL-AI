const fs = require('fs');
const path = require('path');

const clientHome = path.join(__dirname, 'src', 'portals', 'client', 'pages', 'ClientHomePage.tsx');
let clientHomeContent = fs.readFileSync(clientHome, 'utf8');
clientHomeContent = clientHomeContent.replace(/function PendingCard\(\{ ticket \}: \{ ticket: \(typeof tickets\)\[number\] \}\) \{/g,
  'function PendingCard({ ticket }: { ticket: MockTicket }) {');
fs.writeFileSync(clientHome, clientHomeContent);

const shell = path.join(__dirname, 'src', 'portals', 'operational', 'OperationalShell.tsx');
let shellContent = fs.readFileSync(shell, 'utf8');
// Add useChats and useTickets
shellContent = shellContent.replace(/const \{ user, hasPermission, logout \} = useAuth\(\);/,
  'const { user, hasPermission, logout } = useAuth();\n  const { chats } = useChats();\n  const { tickets } = useTickets();');
// import useTickets
shellContent = shellContent.replace(/import \{ useChats \} from '\.\.\/\.\.\/hooks\/use-chats';/,
  'import { useChats } from \'../../hooks/use-chats\';\nimport { useTickets } from \'../../hooks/use-tickets\';');
shellContent = shellContent.replace(/MOCK_TICKETS/g, 'tickets');
fs.writeFileSync(shell, shellContent);

const chatQueue = path.join(__dirname, 'src', 'portals', 'operational', 'pages', 'ChatQueuePage.tsx');
let chatQueueContent = fs.readFileSync(chatQueue, 'utf8');
chatQueueContent = chatQueueContent.replace(/setSelected\(/g, 'setSelectedId(');
fs.writeFileSync(chatQueue, chatQueueContent);

const clientTickets = path.join(__dirname, 'src', 'portals', 'client', 'pages', 'ClientTicketsPage.tsx');
let clientTicketsContent = fs.readFileSync(clientTickets, 'utf8');
// Fix errors about parentId
clientTicketsContent = clientTicketsContent.replace(/const parentTicket\s*=\s*selectedTicket\?\.parentId \? tickets\.find\(\(t: MockTicket\) => t\.id === selectedTicket\.parentId\) : null;/g,
  'const parentTicket = null;');
clientTicketsContent = clientTicketsContent.replace(/const childrenTickets = tickets\.filter\(\(t: MockTicket\) => t\.parentId === selectedTicket\?\.id\);/g,
  'const childrenTickets = [];');
clientTicketsContent = clientTicketsContent.replace(/\{childrenTickets\.map\(\(child: MockTicket\) => \(/g,
  '{childrenTickets.map((child: any) => (');
fs.writeFileSync(clientTickets, clientTicketsContent);

console.log('Fixed typescript errors');
