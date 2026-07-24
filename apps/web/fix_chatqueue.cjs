const fs = require('fs');
const path = require('path');

const chatQueue = path.join(__dirname, 'src', 'portals', 'operational', 'pages', 'ChatQueuePage.tsx');
let chatQueueContent = fs.readFileSync(chatQueue, 'utf8');

chatQueueContent = chatQueueContent.replace(
/const handleStatusChange = \([\s\S]*?\} \/\/\s*3\.5 segundos para parecer natural/g,
  '/*REPLACED_HANDLE_STATUS*/'
);

const newHandleStatusChange = `const handleStatusChange = async (newStatus: 'waiting' | 'active' | 'finished' | 'closed') => {
    if (selected) {
      const chatInMock = chats.find(c => c.id === selected.id);
      if (chatInMock) {
        if (newStatus === 'active') {
          const welcomeMsg: MockChatMessage = {
            id: \`m_agent_\${Date.now()}\`,
            body: \`Olá, bem-vindo! Tudo bem? Meu nome é \${user?.name || 'Atendente'} e eu irei seguir com o seu atendimento.\`,
            senderName: user?.name || 'Você',
            senderType: 'agent',
            createdAt: new Date().toISOString()
          };
          
          await updateChat(chatInMock.id, { 
            status: newStatus, 
            agentName: user?.name || 'Atendente',
            messages: [...chatInMock.messages, welcomeMsg] 
          });

          // Simular o cliente respondendo às boas-vindas para iniciar o timer de inatividade de 2m
          setTimeout(() => {
            const currentChat = chats.find(c => c.id === chatInMock.id);
            if (!currentChat || currentChat.status !== 'active') return;

            const clientReply: MockChatMessage = {
              id: \`m_user_\${Date.now()}\`,
              body: 'Oi, tudo bem. Preciso de ajuda com um problema.',
              senderName: currentChat.clientName,
              senderType: 'user',
              createdAt: new Date().toISOString()
            };
            
            // Refetch or use the updated messages
            updateChat(currentChat.id, { messages: [...currentChat.messages, clientReply] });
            
          }, 4000);
        } else {
          await updateChat(chatInMock.id, { status: newStatus });
        }
      }
    }
  };

  const handleSendMessage = () => {
    if (!input.trim() || !selected || selected.status === 'waiting' || !hasPermission('chat.attend')) return;

    const newMsg: MockChatMessage = {
      id: \`m_agent_\${Date.now()}\`,
      body: input.trim(),
      senderName: 'Você',
      senderType: isInternalNote ? 'internal' : 'agent',
      createdAt: new Date().toISOString()
    };

    const chatInMock = chats.find(c => c.id === selected.id);
    if (chatInMock) {
      updateChat(chatInMock.id, { messages: [...chatInMock.messages, newMsg] });
    }

    setInput('');

    // Envia a mensagem para o painel do cliente pela rede local se não for nota interna
    if (!isInternalNote) {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'agent_msg', body: newMsg.body }));
      } else {
        const channel = new BroadcastChannel('chat_sync');
        channel.postMessage({ type: 'agent_msg', body: newMsg.body });
        channel.close();
      }
    }

    // Simular resposta do cliente em tempo real (apenas se for ambiente standalone)
    if (!isInternalNote) {
      setTimeout(() => {
        const chatInMockNow = chats.find(c => c.id === selected.id);
        if (!chatInMockNow || chatInMockNow.status !== 'active') return;

        const clientReply: MockChatMessage = {
          id: \`m_user_\${Date.now()}\`,
          body: 'Entendido! Estou acompanhando por aqui.',
          senderName: chatInMockNow.clientName,
          senderType: 'user',
          createdAt: new Date().toISOString()
        };
        
        updateChat(chatInMockNow.id, { messages: [...chatInMockNow.messages, clientReply] });
        
      }, 3000);
    } else {
      // Simular resposta de um colega atendente se ele for mencionado na nota interna
      const mentionedStaff = MOCK_STAFF.find(s => input.includes(\`@\${s.name}\`));
      if (mentionedStaff) {
        setTimeout(() => {
          const chatInMockNow = chats.find(c => c.id === selected.id);
          if (!chatInMockNow || chatInMockNow.status !== 'active') return;

          const staffReply: MockChatMessage = {
            id: \`m_staff_\${Date.now()}\`,
            body: \`Oi! Vi que você me marcou na nota. Como posso ajudar neste caso?\`,
            senderName: mentionedStaff.name,
            senderType: 'internal',
            createdAt: new Date().toISOString()
          };
          
          updateChat(chatInMockNow.id, { messages: [...chatInMockNow.messages, staffReply] });
          
        }, 3500); // 3.5 segundos para parecer natural`;

chatQueueContent = chatQueueContent.replace(
  /const handleStatusChange = \([\s\S]*?\} \/\/\s*3\.5 segundos para parecer natural/g,
  newHandleStatusChange
);

fs.writeFileSync(chatQueue, chatQueueContent);
console.log('Fixed handleStatusChange loop and mutation');
