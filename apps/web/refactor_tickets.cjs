const fs = require('fs');
const path = require('path');

const ticketsPath = path.join(__dirname, 'src', 'portals', 'operational', 'pages', 'TicketsPage.tsx');
let ticketsContent = fs.readFileSync(ticketsPath, 'utf8');

ticketsContent = ticketsContent.replace(/import \{ MOCK_TICKETS, MockTicket, MOCK_STAFF, TicketStatus, TicketPriority \} from '\.\.\/\.\.\/mocks\/data';/, 
`import { MockTicket, MOCK_STAFF, TicketStatus, TicketPriority } from '../../mocks/data';
import { useTickets } from '../../hooks/use-tickets';`);

ticketsContent = ticketsContent.replace(/export default function TicketsPage\(\) \{/,
`export default function TicketsPage() {
  const { tickets, updateTicket } = useTickets();`);

// MOCK_TICKETS -> tickets
ticketsContent = ticketsContent.replace(/MOCK_TICKETS/g, 'tickets');

// Updating ticket actions
ticketsContent = ticketsContent.replace(/const ticketInMock = tickets\.find\(t => t\.id === tId\);\n\s*if \(ticketInMock\) \{\n\s*ticketInMock\.status = 'closed';\n\s*ticketInMock\.closedAt = new Date\(\)\.toISOString\(\);\n\s*\}/g,
`updateTicket(tId, { status: 'closed', closedAt: new Date().toISOString() });`);

ticketsContent = ticketsContent.replace(/const ticketInMock = tickets\.find\(t => t\.id === tId\);\n\s*if \(ticketInMock\) \{\n\s*ticketInMock\.priority = newPriority;\n\s*\}/g,
`updateTicket(tId, { priority: newPriority });`);

fs.writeFileSync(ticketsPath, ticketsContent);
console.log('Refactoring TicketsPage done.');


const dashboardPath = path.join(__dirname, 'src', 'portals', 'operational', 'pages', 'DashboardPage.tsx');
let dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

dashboardContent = dashboardContent.replace(/import \{ MOCK_TICKETS \} from '\.\.\/\.\.\/mocks\/data';/, 
`import { useTickets } from '../../hooks/use-tickets';`);

dashboardContent = dashboardContent.replace(/export default function DashboardPage\(\) \{/,
`export default function DashboardPage() {
  const { tickets } = useTickets();`);

dashboardContent = dashboardContent.replace(/MOCK_TICKETS/g, 'tickets');

fs.writeFileSync(dashboardPath, dashboardContent);
console.log('Refactoring DashboardPage done.');
