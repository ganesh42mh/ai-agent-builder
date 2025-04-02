import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Bot, Play, Trash2, Upload } from 'lucide-react';
import axios from 'axios';

const PipelineList = () => {
  const [pipelines, setPipelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [file, setFile] = useState(null);
  const [postContent, setPostContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [pipelineResult, setPipelineResult] = useState(null);
  const [showResultDialog, setShowResultDialog] = useState(false);

  useEffect(() => {
    fetchPipelines();
  }, []);

  const fetchPipelines = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/pipelines');
      setPipelines(response.data);
    } catch (error) {
      setError('Failed to fetch pipelines');
    } finally {
      setLoading(false);
    }
  };

  const handleRunPipeline = async (pipeline) => {
    try {
      setSelectedPipeline(pipeline);
      setOpenDialog(true);
    } catch (error) {
      console.error('Error preparing pipeline execution:', error);
      setError('Failed to prepare pipeline execution');
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleExecutePipeline = async (pipeline) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setSelectedPipeline(pipeline);
      setOpenDialog(true);

      // Create FormData object
      const formData = new FormData();
      
      // Handle text input
      if (pipeline.inputType === 'text') {
        formData.append('input', postContent);
      } else if (file) {
        formData.append('file', file);
      }

      // Execute pipeline
      const response = await axios.post(
        `http://localhost:5000/api/pipelines/${pipeline._id}/execute`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setSuccess('Pipeline executed successfully!');
      setPipelineResult(response.data);
      setOpenDialog(false);
      setFile(null);
    } catch (error) {
      console.error('Error executing pipeline:', error);
      setError(error.response?.data?.error || 'Failed to execute pipeline');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePipeline = async (pipelineId) => {
    try {
      await axios.delete(`http://localhost:5000/api/pipelines/${pipelineId}`);
      setSuccess('Pipeline deleted successfully!');
      fetchPipelines();
    } catch (error) {
      setError('Failed to delete pipeline');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

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
            mb: 6,
          }}
        >
          <Bot size={40} color={'white'} />
          <Typography
            variant="h4"
            component="h1"
            sx={{
              color: 'white',
              textAlign: 'center',
            }}
          >
            Your AI Pipelines
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Grid container spacing={3}>
          {pipelines.map((pipeline) => (
            <Grid item xs={12} md={6} lg={4} key={pipeline._id}>
              <Card
                sx={{
                  height: '100%',
                  background: 'rgba(30, 41, 59, 0.7)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                  },
                }}
              >
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h6" sx={{ color: 'white' }}>
                      {pipeline.name}
                    </Typography>
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      {pipeline.description}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                      Steps: {pipeline.steps.length}
                    </Typography>
                  </Stack>
                </CardContent>
                <CardActions>
                  <Button
                    startIcon={<Play />}
                    onClick={() => handleRunPipeline(pipeline)}
                    sx={{ color: 'white' }}
                  >
                    Run Pipeline
                  </Button>
                  <Button
                    startIcon={<Trash2 />}
                    onClick={() => handleDeletePipeline(pipeline._id)}
                    sx={{ color: 'white' }}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          PaperProps={{
            sx: {
              background: 'rgba(30, 41, 59, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <DialogTitle sx={{ color: 'white' }}>
            Run Pipeline: {selectedPipeline?.name}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              {selectedPipeline?.inputType !== 'text' && (
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<Upload />}
                  sx={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.2)',
                    },
                  }}
                >
                  Upload File
                  <input
                    type="file"
                    hidden
                    onChange={handleFileChange}
                    accept={selectedPipeline?.inputType === 'pdf' ? '.pdf' : '*'}
                  />
                </Button>
              )}
              {selectedPipeline?.inputType === 'text' && (
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label={`Enter your ${selectedPipeline.name.toLowerCase()} input`}
                  placeholder={`Enter the text to process through ${selectedPipeline.name}`}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#60a5fa',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'white',
                      '&.Mui-focused': {
                        color: '#60a5fa',
                      },
                    },
                  }}
                />
              )}
              {(file || selectedPipeline?.inputType === 'text') && (
                <Typography sx={{ color: 'white' }}>
                  {selectedPipeline?.inputType === 'text' ? 'Post content ready' : `Selected file: ${file?.name || ''}`}
                </Typography>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)} sx={{ color: 'white' }}>
              Cancel
            </Button>
            <Button
              onClick={() => handleExecutePipeline(selectedPipeline)}
              disabled={loading}
              sx={{ color: 'white' }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Execute'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default PipelineList; 