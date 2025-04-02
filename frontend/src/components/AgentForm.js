import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Stack,
} from '@mui/material';
import { Plus } from 'lucide-react';
import axios from 'axios';

const AgentForm = ({ onAgentCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    instructions: '',
    model: 'gpt-3.5-turbo',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/agents', formData);
      onAgentCreated(response.data);
      setFormData({
        name: '',
        instructions: '',
        model: 'gpt-3.5-turbo',
      });
      setSuccess('Agent created successfully!');
      setError('');
    } catch (error) {
      setError(error.response?.data?.error || 'Error creating agent');
      setSuccess('');
    }
  };

  return (
    <Paper 
      sx={{ 
        p: 3, 
        width: "100%",
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }}
    >
      <Typography 
        variant="h6" 
        gutterBottom 
        sx={{ 
          mb: 3,
          color: 'white',
          fontWeight: 600,
        }}
      >
        Create New AI Agent
      </Typography>

      <Stack spacing={2}>
        {error && <Alert severity="error" sx={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', color: '#ef4444' }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              label="Agent Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              variant="outlined"
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
                },
                '& .MuiInputLabel-root': {
                  color: 'white',
                  '&.Mui-focused': {
                    color: '#60a5fa',
                  },
                  '&.MuiInputLabel-shrink': {
                    color: 'white',
                  },
                },
              }}
            />

            <TextField
              fullWidth
              label="Instructions"
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              multiline
              rows={4}
              required
              variant="outlined"
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
                },
                '& .MuiInputLabel-root': {
                  color: 'white',
                  '&.Mui-focused': {
                    color: '#60a5fa',
                  },
                  '&.MuiInputLabel-shrink': {
                    color: 'white',
                  },
                },
              }}
            />

            <FormControl fullWidth>
              <InputLabel 
                sx={{ 
                  color: 'white',
                  '&.Mui-focused': {
                    color: '#60a5fa',
                  },
                  '&.MuiInputLabel-shrink': {
                    color: 'white',
                  },
                }}
              >
                Model
              </InputLabel>
              <Select
                name="model"
                value={formData.model}
                onChange={handleChange}
                label="Model"
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
                <MenuItem value="gpt-3.5-turbo">GPT-3.5 Turbo</MenuItem>
                <MenuItem value="gpt-4">GPT-4</MenuItem>
              </Select>
            </FormControl>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              startIcon={<Plus size={20} />}
              fullWidth
              sx={{
                backgroundColor: '#3b82f6',
                '&:hover': {
                  backgroundColor: '#2563eb',
                },
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Create Agent
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
};

export default AgentForm;