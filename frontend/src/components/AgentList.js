import React, { useState } from 'react';
import { Typography } from '@mui/material';
import { Users, Trash2, X, Bot, Calendar, Code } from 'lucide-react';
import axios from 'axios';

const AgentList = ({ agents, onAgentDeleted }) => {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = async (agentId) => {
    try {
      await axios.delete(`http://localhost:5000/api/agents/${agentId}`);
      onAgentDeleted(agentId);
    } catch (error) {
      console.error('Error deleting agent:', error);
    }
  };

  const handleCapsuleClick = (agent) => {
    setSelectedAgent(agent);
    setIsModalOpen(true);
  };

  const Modal = ({ agent, onClose }) => {
    if (!agent) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        width: "100%",
        height: "100%"
      }}>
        <div style={{
          backgroundColor: 'rgba(30, 41, 59, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '24px',
          width: '90%',
          maxWidth: '500px',
          maxHeight: '80vh',
          overflowY: 'auto',
          position: 'relative',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
            }}
          >
            <X size={20} />
          </button>

          <div style={{ marginBottom: '24px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <Bot size={24} color="white" />
              <Typography variant="h5" style={{ color: 'white', fontWeight: 600 }}>
                {agent.name}
              </Typography>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.875rem'
            }}>
              <Calendar size={16} />
              <span>Created on {new Date(agent.createdAt).toLocaleDateString()}</span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '24px',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.875rem'
            }}>
              <Code size={16} />
              <span>Model: {agent.model}</span>
            </div>

            <div>
              <Typography variant="subtitle1" style={{ 
                color: 'white', 
                fontWeight: 500,
                marginBottom: '8px'
              }}>
                Instructions
              </Typography>
              <Typography style={{
                color: 'rgba(255, 255, 255, 0.8)',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap'
              }}>
                {agent.instructions}
              </Typography>
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px'
          }}>
            <button
              onClick={() => {
                handleDelete(agent._id);
                onClose();
              }}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                color: '#ef4444',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
              }}
            >
              <Trash2 size={16} />
              Delete Agent
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ 
      width: "100%",
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px'
      }}>
        <Users size={20} color="white" />
        <Typography variant="h6" style={{ color: 'white', fontWeight: 600, fontSize: '1rem' }}>
          Created Agents
        </Typography>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '8px',
        maxHeight: '220px',
        overflowY: 'auto',
        paddingRight: '8px'
      }}>
        {agents.map((agent) => (
          <div
            key={agent._id}
            onClick={() => handleCapsuleClick(agent)}
            style={{
              backgroundColor: 'rgba(30, 41, 59, 0.7)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '6px 12px',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              position: 'relative',
              cursor: 'pointer',
              fontSize: '0.875rem',
              color: 'white',
              fontWeight: 500,
              width: '100%',
              ':hover': {
                backgroundColor: 'rgba(30, 41, 59, 0.8)',
                transform: 'translateY(-1px)'
              }
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.8)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.7)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span style={{ 
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {agent.name}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(agent._id);
              }}
              style={{
                background: 'none',
                border: 'none',
                padding: '4px',
                cursor: 'pointer',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                flexShrink: 0,
                ':hover': {
                  backgroundColor: 'rgba(239, 68, 68, 0.1)'
                }
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <Modal 
          agent={selectedAgent} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default AgentList;