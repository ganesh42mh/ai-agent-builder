import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import { Users, Trash2 } from 'lucide-react';
import axios from 'axios';

const AgentList = ({ agents, onAgentDeleted }) => {
  const handleDelete = async (agentId) => {
    try {
      await axios.delete(`http://localhost:5000/api/agents/${agentId}`);
      onAgentDeleted(agentId);
    } catch (error) {
      console.error('Error deleting agent:', error);
    }
  };

  return (
    <Paper 
      sx={{ 
        p: 3,
        width: "500px",
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }}
    >
      <Box sx={{ 
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        mb: 3 
      }}>
        <Users size={24} color="white" />
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
          Created Agents
        </Typography>
      </Box>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Model</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Instructions</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Created</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {agents.map((agent) => (
              <TableRow 
                key={agent._id} 
                hover
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              >
                <TableCell sx={{ color: 'white', fontWeight: 500 }}>
                  {agent.name}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={agent.model}
                    color={agent.model.includes('4') ? 'secondary' : 'primary'}
                    size="small"
                    sx={{ 
                      fontWeight: 500,
                      backgroundColor: agent.model.includes('4') ? '#7c3aed' : '#3b82f6',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: agent.model.includes('4') ? '#6d28d9' : '#2563eb',
                      },
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Typography 
                    variant="body2" 
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {agent.instructions}
                  </Typography>
                </TableCell>
                <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  {new Date(agent.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDelete(agent._id)}
                    color="error"
                  >
                    <Trash2 size={20} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default AgentList;