const fs = require('fs');
const path = require('path');

const clientTicketsPath = path.join(__dirname, 'src', 'portals', 'client', 'pages', 'ClientTicketsPage.tsx');
let clientTicketsContent = fs.readFileSync(clientTicketsPath, 'utf8');

clientTicketsContent = clientTicketsContent.replace(/import \{ MOCK_TICKETS, MockClient, MockTicket, TicketStatus, TicketPriority \} from '\.\.\/\.\.\/\.\.\/mocks\/data';/, 
`import { MockClient, MockTicket, TicketStatus, TicketPriority } from '../../../mocks/data';
import { useTickets } from '../../../hooks/use-tickets';`);

clientTicketsContent = clientTicketsContent.replace(/export default function ClientTicketsPage\(\) \{([\s\S]*?)const \{ user \} = useAuth\(\);/,
`export default function ClientTicketsPage() {
  const { user } = useAuth();
  const { tickets, updateTicket } = useTickets();`);

clientTicketsContent = clientTicketsContent.replace(/MOCK_TICKETS/g, 'tickets');

// Replacing the comment mutation
clientTicketsContent = clientTicketsContent.replace(/const tInMock = tickets\.find\(t => t\.id === selectedTicket\.id\);\n\s*if \(tInMock\) \{\n\s*tInMock\.comments\.push\(newComment\);\n\s*tInMock\.updatedAt = new Date\(\)\.toISOString\(\);\n\s*\}/g,
`const tInMock = tickets.find(t => t.id === selectedTicket.id);
      if (tInMock) {
        updateTicket(tInMock.id, { 
          comments: [...tInMock.comments, newComment],
          updatedAt: new Date().toISOString()
        });
      }`);

fs.writeFileSync(clientTicketsPath, clientTicketsContent);
console.log('Refactoring ClientTicketsPage done.');
