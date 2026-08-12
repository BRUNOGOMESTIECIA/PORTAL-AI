const fs = require('fs');
const file = 'C:/Users/Bruno Gomes/Documents/PORTAL-AI/apps/web/src/portals/operational/pages/ChatQueuePage.tsx';
const content = fs.readFileSync(file, 'utf8');

const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('Ticket criado!') || line.includes('adicionado ao board') || line.includes('createdTicketId')) {
    console.log(`Line ${index + 1}: ${line}`);
  }
});
