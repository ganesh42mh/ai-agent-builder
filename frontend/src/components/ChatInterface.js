import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Avatar,
} from '@mui/material';
import { Send, Bot, User } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../config';

const ChatInterface = ({ agents }) => {
  const [selectedAgent, setSelectedAgent] = useState('');
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [agentChatHistories, setAgentChatHistories] = useState({});
  const chatContainerRef = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedAgent) return;

    const newMessage = {
      text: message,
      sender: 'user'
    };

    setChatHistory(prev => [...prev, newMessage]);
    setMessage('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/agents/${selectedAgent}/run`, {
        message: message.trim()
      });

      const aiMessage = {
        text: response.data.response,
        sender: 'ai'
      };

      setChatHistory(prev => [...prev, aiMessage]);
      setAgentChatHistories(prev => ({
        ...prev,
        [selectedAgent]: [...prev[selectedAgent], newMessage, aiMessage]
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        text: 'Error: Failed to send message. Please try again.',
        sender: 'ai'
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleAgentChange = async (e) => {
    const newAgentId = e.target.value;
    setSelectedAgent(newAgentId);

    if (agentChatHistories[newAgentId]) {
      setChatHistory(agentChatHistories[newAgentId]);
    } else {
      try {
        const response = await axios.get(`${API_BASE_URL}/agents/${newAgentId}/chat`);

        if (response.data && response.data.messages) {
          const formattedHistory = response.data.messages.map(msg => ({
            text: msg.content,
            sender: msg.type === 'human' ? 'user' : 'ai'
          }));
          setChatHistory(formattedHistory);
          setAgentChatHistories(prev => ({
            ...prev,
            [newAgentId]: formattedHistory
          }));
        } else {
          setChatHistory([]);
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
        setChatHistory([]);
      }
    }
  };

  return (
    <Paper sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'rgba(30, 41, 59, 0.7)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    }}>
      <Stack sx={{
        height: '100%',
        minHeight: '600px'
      }}>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <FormControl fullWidth>
            <InputLabel sx={{ 
              color: 'white',
              '&.Mui-focused': {
                color: '#60a5fa',
              },
              '&.MuiInputLabel-shrink': {
                color: 'white',
              },
            }}>Select Agent</InputLabel>
            <Select
              value={selectedAgent}
              onChange={handleAgentChange}
              label="Select Agent"
              sx={{
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#60a5fa',
                },
                '& .MuiSelect-icon': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
              }}
            >
              {agents.map((agent) => (
                <MenuItem key={agent._id} value={agent._id}>
                  {agent.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box
          ref={chatContainerRef}
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            bgcolor: 'rgba(15, 23, 42, 0.6)',
            p: 3,
          }}
        >
          <List>
            {chatHistory.map((msg, index) => (
              <ListItem
                key={index}
                sx={{
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1,
                    flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                    maxWidth: '70%',
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: msg.sender === 'user' ? '#3b82f6' : '#7c3aed',
                    }}
                  >
                    {msg.sender === 'user' ? <User size={20} /> : <Bot size={20} />}
                  </Avatar>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: msg.sender === 'user' ? '#3b82f6' : 'rgba(15, 23, 42, 0.8)',
                      color: 'white',
                      borderRadius: 2,
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <Typography variant="body1" sx={{whiteSpace: 'pre-wrap', textAlign:'justify'}}>
                      {msg.text}
                    </Typography>
                  </Paper>
                </Box>
              </ListItem>
            ))}
          </List>
        </Box>

        <Box
          component="form"
          onSubmit={handleSendMessage}
          sx={{
            p: 3,
            borderTop: 1,
            borderColor: 'rgba(255, 255, 255, 0.1)',
            bgcolor: 'rgba(15, 23, 42, 0.6)',
          }}
        >
          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={!selectedAgent}
              variant="outlined"
              size="medium"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#60a5fa',
                  },
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  color: 'white',
                  '& .MuiInputLabel-root': {
                    color: 'white',
                    '&.Mui-focused': {
                      color: '#60a5fa',
                    },
                    '&.MuiInputLabel-shrink': {
                      color: 'white',
                    },
                  },
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!selectedAgent || !message.trim()}
              sx={{ 
                px: 3,
                backgroundColor: '#3b82f6',
                '&:hover': {
                  backgroundColor: '#2563eb',
                },
              }}
            >
              <Send size={20} />
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
};

export default ChatInterface;