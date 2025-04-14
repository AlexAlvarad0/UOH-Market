import { useState, useEffect } from 'react';
import { Box, Typography, TextField, IconButton } from '@mui/material';
import { List } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';

const ChatPage = () => {
  const { conversationId } = useParams();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    // Aquí irá la lógica para cargar conversaciones y mensajes
  }, [conversationId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí irá la lógica para enviar mensajes
    setMessage('');
  };

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
      <Box sx={{ width: 300, borderRight: 1, borderColor: 'divider', p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Conversaciones
        </Typography>
        <List
          itemLayout="horizontal"
          dataSource={conversations}
          renderItem={(item: any) => (
            <List.Item>
              <List.Item.Meta
                title={item.name}
                description={item.lastMessage}
              />
            </List.Item>
          )}
        />
      </Box>

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto' }}>
          {messages.map((msg: any) => (
            <Box
              key={msg.id}
              sx={{
                mb: 1,
                p: 1,
                backgroundColor: msg.isMine ? '#e3f2fd' : '#f5f5f5',
                borderRadius: 1,
                maxWidth: '70%',
                alignSelf: msg.isMine ? 'flex-end' : 'flex-start',
              }}
            >
              <Typography variant="body1">{msg.text}</Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <form onSubmit={handleSend} style={{ display: 'flex' }}>
            <TextField
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
              size="small"
            />
            <IconButton type="submit" color="primary">
              <SendOutlined />
            </IconButton>
          </form>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatPage;
