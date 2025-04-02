import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Stack, useTheme, useMediaQuery } from '@mui/material';
import { Bot } from 'lucide-react';
import AgentForm from '../components/AgentForm';
import ChatInterface from '../components/ChatInterface';
import AgentList from '../components/AgentList';
import axios from 'axios';

const SimpleAgent = () => {
  const [agents, setAgents] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const fetchAgents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/agents');
      setAgents(response.data);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleAgentCreated = (newAgent) => {
    setAgents([...agents, newAgent]);
  };

  const handleAgentDeleted = (deletedAgentId) => {
    setAgents(agents.filter(agent => agent._id !== deletedAgentId));
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: 4,
        background: 'linear-gradient(45deg, #2c3e50 0%, #3498db 25%, #8e44ad 50%, #27ae60 75%, #1abc9c 100%)',
        backgroundSize: '200% 200%',
        animation: 'aurora 15s ease infinite',
        '@keyframes aurora': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            mb: { xs: 4, md: 6 },
          }}
        >
          <Bot size={isMobile ? 32 : 40} color={'white'} />
          <Typography
            variant={isMobile ? "h5" : "h4"}
            component="h1"
            sx={{
              color: 'white',
              textAlign: 'center',
            }}
          >
            Simple Text-to-Text Agent
          </Typography>
        </Box>

        <Grid 
          container 
          spacing={{ xs: 2, md: 4 }} 
          sx={{ 
            flexWrap: 'nowrap', 
            flexDirection: { xs: 'column', md: 'row' },
            height: { xs: 'auto', md: 'calc(100vh - 200px)' }
          }}
        >
          {/* Left Column - Agent Creation/List */}
          <Grid 
            item 
            xs={12} 
            md={3} 
            lg={2}
            sx={{
              width: { xs: '100%', md: 'auto' },
              maxWidth: { xs: '100%', md: '300px' },
              mx: 'auto'
            }}
          >
            <Stack spacing={{ xs: 2, md: 4 }}>
              <AgentForm onAgentCreated={handleAgentCreated} />
              <AgentList agents={agents} onAgentDeleted={handleAgentDeleted} />
            </Stack>
          </Grid>

          {/* Right Column - Chat Interface */}
          <Grid 
            item 
            xs={12} 
            md={9} 
            lg={10}
            sx={{
              width: { xs: '100%', md: 'auto' },
              height: { xs: '600px', md: '100%' },
              minHeight: { xs: '600px', md: 'auto' }
            }}
          >
            <Box
              sx={{
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <ChatInterface agents={agents} />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default SimpleAgent; 