const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'portals', 'operational', 'pages', 'ChatQueuePage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// replace selected.messages.push and setForceRender with updateChat
content = content.replace(/selected\.messages\.push\(\{\n\s*id: 'attach_'.*?\n\s*body: `\[Anexo enviado: \$\{file\.name\}\]`,([\s\S]*?)createdAt: new Date\(\)\.toISOString\(\)\n\s*\}\);\n\s*setForceRender\(prev => prev \+ 1\);/g, 
`const newMsg: MockChatMessage = {
        id: 'attach_' + Date.now(),
        body: \`[Anexo enviado: \${file.name}]\`,$1createdAt: new Date().toISOString()
      };
      updateChat(selected.id, { messages: [...selected.messages, newMsg] });`);

content = content.replace(/chats\.forEach\(chat => \{([\s\S]*?)chat\.messages\.push\(\{([\s\S]*?)\}\);([\s\S]*?)\}\);\n\s*if \(changed\) \{([\s\S]*?)setForceRender\(r => r \+ 1\);\n\s*\}/g, 
`chats.forEach(chat => {$1updateChat(chat.id, { messages: [...chat.messages, {$2}] });$3});`);

content = content.replace(/const handleStatusChange = \(newStatus: 'waiting' \| 'active' \| 'finished' \| 'closed'\) => \{([\s\S]*?)const chatInMock = chats\.find\(c => c\.id === selected\.id\);([\s\S]*?)chatInMock\.status = newStatus;([\s\S]*?)if \(newStatus === 'active'\) \{([\s\S]*?)chatInMock\.messages\.push\(welcomeMsg\);([\s\S]*?)setTimeout\(\(\) => \{([\s\S]*?)const currentChat = chats\.find\(c => c\.id === chatInMock\.id\);([\s\S]*?)currentChat\.messages\.push\(clientReply\);([\s\S]*?)setSelected\(prev([\s\S]*?)setForceRender\(r => r \+ 1\);\n\s*\}, 4000\);\n\s*\}\n\s*\}\n\s*setSelected\(chatInMock \? \{ \.\.\.chatInMock \} : \{ \.\.\.selected, status: newStatus \}\);\n\s*setForceRender\(r => r \+ 1\);\n\s*\}\n\s*\};/g, 
`const handleStatusChange = async (newStatus: 'waiting' | 'active' | 'finished' | 'closed') => {
    if (selected) {
      await updateChat(selected.id, { status: newStatus });
      
      if (newStatus === 'active') {
        const welcomeMsg: MockChatMessage = {
          id: \`m_agent_\${Date.now()}\`,
          body: \`Olá, bem-vindo! Tudo bem? Meu nome é \${user?.name || 'Atendente'} e eu irei seguir com o seu atendimento.\`,
          senderName: user?.name || 'Você',
          senderType: 'agent',
          createdAt: new Date().toISOString()
        };
        await updateChat(selected.id, { messages: [...selected.messages, welcomeMsg], status: newStatus });

        setTimeout(async () => {
          // get latest chat
          const currentChat = chats.find(c => c.id === selected.id);
          if (!currentChat || currentChat.status !== 'active') return;

          const clientReply: MockChatMessage = {
            id: \`m_user_\${Date.now()}\`,
            body: 'Oi, tudo bem. Preciso de ajuda com um problema.',
            senderName: currentChat.clientName,
            senderType: 'user',
            createdAt: new Date().toISOString()
          };
          
          await updateChat(currentChat.id, { messages: [...currentChat.messages, clientReply] });
        }, 4000);
      }
    }
  };`);

content = content.replace(/const chatInMock = chats\.find\(c => c\.id === selected\.id\);\n\s*if \(chatInMock\) \{\n\s*chatInMock\.messages\.push\(newMsg\);\n\s*setSelected\(prev => \{\n\s*if \(\!prev\) return prev;\n\s*return \{\n\s*\.\.\.prev,\n\s*messages: \[\.\.\.chatInMock\.messages\]\n\s*\};\n\s*\}\);\n\s*\}/g,
`updateChat(selected.id, { messages: [...selected.messages, newMsg] });`);

content = content.replace(/setForceRender\(r => r \+ 1\);/g, '');
content = content.replace(/setSelected\(prev => prev \? \{ \.\.\.prev, messages: \[\.\.\.chatInMock\.messages\] \} : prev\);/g, '');

content = content.replace(/const targetChatId = selected\?\.id \|\| chats\.find\(c => c\.status === 'active' \|\| c\.status === 'waiting'\)\?\.id;\n\s*if \(targetChatId\) \{\n\s*const chatInMock = chats\.find\(c => c\.id === targetChatId\);\n\s*if \(chatInMock\) \{\n\s*chatInMock\.messages\.push\(\{\n\s*id: `m_user_sync_\$\{Date\.now\(\)\}`,\n\s*body: (.*),\n\s*senderName: chatInMock\.clientName,\n\s*senderType: 'user',\n\s*createdAt: new Date\(\)\.toISOString\(\)\n\s*\}\);\n\s*\}/g,
`const targetChatId = selected?.id || chats.find(c => c.status === 'active' || c.status === 'waiting')?.id;
          if (targetChatId) {
            const chatInMock = chats.find(c => c.id === targetChatId);
            if (chatInMock) {
              const newMsg: MockChatMessage = {
                id: \`m_user_sync_\${Date.now()}\`,
                body: $1,
                senderName: chatInMock.clientName,
                senderType: 'user',
                createdAt: new Date().toISOString()
              };
              updateChat(chatInMock.id, { messages: [...chatInMock.messages, newMsg] });
            }`);

content = content.replace(/const chatInMockNow = chats\.find\(c => c\.id === selected\.id\);\n\s*if \(\!chatInMockNow \|\| chatInMockNow\.status !== 'active'\) return;\n\n\s*const (.*)Reply: MockChatMessage = \{([\s\S]*?)\};\n\s*chatInMockNow\.messages\.push\((.*)Reply\);\n\s*setSelected\([\s\S]*?\);/g,
`const chatInMockNow = chats.find(c => c.id === selected.id);
        if (!chatInMockNow || chatInMockNow.status !== 'active') return;

        const $1Reply: MockChatMessage = {$2};
        updateChat(chatInMockNow.id, { messages: [...chatInMockNow.messages, $1Reply] });`);

content = content.replace(/const waiting = chats\.filter\(c => c\.status === 'waiting'\);\n\s*const active  = chats\.filter\(c => c\.status === 'active'\);\n\s*const closed  = chats\.filter\(c => c\.status === 'closed'\);/g,
`const waiting = chats.filter(c => c.status === 'waiting');
  const active  = chats.filter(c => c.status === 'active');
  const closed  = chats.filter(c => c.status === 'closed');`);

content = content.replace(/MOCK_CHAT_SESSIONS/g, 'chats');
// Remove unneeded useEffects
content = content.replace(/\/\/ ── Auto-reply timeouts movidos para o OperationalShell \(Global\) ──([\s\S]*?)window\.removeEventListener\('chat_update', handleChatUpdate\);\n\s*\}, \[\]\);/g, '');


fs.writeFileSync(filePath, content);
console.log('Refactoring done.');
