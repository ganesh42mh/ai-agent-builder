import React, { useState, useEffect } from 'react';
import { Typography, Grid, useTheme, useMediaQuery, Paper } from '@mui/material';
import { Bot } from 'lucide-react';
import AgentForm from '../components/AgentForm';
import ChatInterface from '../components/ChatInterface';
import AgentList from '../components/AgentList';
import axios from 'axios';

const SimpleAgent = () => {
  const [agents, setAgents] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

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

  const containerStyle = {
    width: '100%',
    padding: '10px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap:"10px"
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    marginBottom: isSmallScreen ? '24px' : isMobile ? '32px' : '48px',
    transition: 'all 0.3s ease-in-out'
  };

  const mainGridStyle = {
    display: 'flex',
    flexDirection: 'row',
    gap: isSmallScreen ? '16px' : isMobile ? '24px' : '32px',
    height: isMobile ? 'auto' : 'calc(100vh - 180px)',
    minHeight: isMobile ? 'auto' : '600px',
    maxHeight: isMobile ? 'none' : 'calc(100vh - 120px)'
  };

  const leftColumnStyle = {
    width: isMobile ? '100%' : '320px',
    maxWidth: isMobile ? '100%' : '320px',
    margin: isMobile ? '0 auto' : '0',
    height: isMobile ? 'auto' : '100%',
    display: 'flex',
    flexDirection: 'column',
    gap:'10px'
  };

  const rightColumnStyle = {
    width:  '100%' ,
    height: isMobile ? '600px' : '100%',
    minHeight: isMobile ? '600px' : 'auto',
  };


  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        padding: "10px",
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
      <div style={containerStyle}>
        <div style={headerStyle}>
          <Bot size={isSmallScreen ? 28 : isMobile ? 32 : 40} color={'white'} />
          <Typography
            variant={isSmallScreen ? "h6" : isMobile ? "h5" : "h4"}
            component="h1"
            style={{
              color: 'white',
              textAlign: 'center',
              fontWeight: 600,
              letterSpacing: '0.5px',
              margin: 0
            }}
          >
            Simple Text-to-Text Agent
          </Typography>
        </div>

        <div style={mainGridStyle}>
          {/* Left Column - Agent Creation/List */}
          <div style={leftColumnStyle}>

            <AgentForm onAgentCreated={handleAgentCreated} />
            <AgentList agents={agents} onAgentDeleted={handleAgentDeleted} />

          </div>

          {/* Right Column - Chat Interface */}
          <div style={rightColumnStyle}>

            <ChatInterface agents={agents} />

          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleAgent; 