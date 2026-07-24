const fs = require('fs');
const path = require('path');

const chatQueue = path.join(__dirname, 'src', 'portals', 'operational', 'pages', 'ChatQueuePage.tsx');
let chatQueueContent = fs.readFileSync(chatQueue, 'utf8');

chatQueueContent = chatQueueContent.replace(
/          await updateChat\(chatInMock.id, \{/g,
  `          setActiveTab(newStatus === 'active' ? 'em_atendimento' : newStatus === 'waiting' ? 'entrada' : 'encerrados');
          await updateChat(chatInMock.id, {`
);

fs.writeFileSync(chatQueue, chatQueueContent);
console.log('Added setActiveTab to handleStatusChange');
