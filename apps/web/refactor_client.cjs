const fs = require('fs');
const path = require('path');

const clientHomePath = path.join(__dirname, 'src', 'portals', 'client', 'pages', 'ClientHomePage.tsx');
let clientHomeContent = fs.readFileSync(clientHomePath, 'utf8');

clientHomeContent = clientHomeContent.replace(/import \{ MOCK_TICKETS, MockTicket, TicketStatus \} from '\.\.\/\.\.\/mocks\/data';/, 
`import { MockTicket, TicketStatus } from '../../mocks/data';
import { useTickets } from '../../hooks/use-tickets';`);

clientHomeContent = clientHomeContent.replace(/export default function ClientHomePage\(\) \{([\s\S]*?)const \{ user \} = useAuth\(\);/,
`export default function ClientHomePage() {
  const { user } = useAuth();
  const { tickets } = useTickets();`);

clientHomeContent = clientHomeContent.replace(/MOCK_TICKETS/g, 'tickets');
fs.writeFileSync(clientHomePath, clientHomeContent);
console.log('Refactoring ClientHomePage done.');

const newTicketModalPath = path.join(__dirname, 'src', 'portals', 'client', 'components', 'NewTicketModal.tsx');
let newTicketModalContent = fs.readFileSync(newTicketModalPath, 'utf8');

newTicketModalContent = newTicketModalContent.replace(/import \{ MOCK_TICKETS, TICKET_CATEGORIES, MockTicket \} from '\.\.\/\.\.\/mocks\/data';/, 
`import { TICKET_CATEGORIES, MockTicket } from '../../mocks/data';
import { useTickets } from '../../hooks/use-tickets';`);

newTicketModalContent = newTicketModalContent.replace(/export function NewTicketModal\(\{ isOpen, onClose \}: NewTicketModalProps\) \{([\s\S]*?)const \{ user \} = useAuth\(\);/,
`export function NewTicketModal({ isOpen, onClose }: NewTicketModalProps) {
  const { user } = useAuth();
  const { createTicket, tickets } = useTickets();`);

newTicketModalContent = newTicketModalContent.replace(/const newTicket: MockTicket = \{([\s\S]*?)createdAt: new Date\(\)\.toISOString\(\)([\s\S]*?)\};\n\s*MOCK_TICKETS\.unshift\(newTicket\);/g,
`const newTicket: MockTicket = {$1createdAt: new Date().toISOString()$2};
      await createTicket(newTicket);`);

// For generating ticket number
newTicketModalContent = newTicketModalContent.replace(/MOCK_TICKETS\.reduce\(\(max, t\) => Math\.max\(max, t\.number\), 1000\) \+ 1/g,
`tickets.reduce((max, t) => Math.max(max, t.number), 1000) + 1`);

fs.writeFileSync(newTicketModalPath, newTicketModalContent);
console.log('Refactoring NewManualTicketModal done.');

// removed
