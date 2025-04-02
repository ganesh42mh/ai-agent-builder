import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Stack,
  Button,
} from '@mui/material';
import { Bot, GitBranch, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

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
        {/* Hero Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            py: 8,
            mb: 8,
          }}
        >
          <Bot size={64} color={'white'} />
          <Typography
            variant="h2"
            component="h1"
            sx={{
              color: 'white',
              fontWeight: 700,
              mb: 2,
            }}
          >
            AI Agent Builder
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              maxWidth: '800px',
            }}
          >
            Create powerful AI agents with our intuitive builder. Choose between simple text-to-text agents or complex multi-step AI pipelines.
          </Typography>
        </Box>

        {/* Navigation Cards */}
        <Grid container spacing={4} justifyContent="center">
          {/* Simple Agent Card */}
          <Grid item xs={12} md={6} lg={5}>
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
              <CardActionArea onClick={() => navigate('/simple-agent')} sx={{ height: '100%' }}>
                <CardContent>
                  <Stack spacing={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Bot size={32} color={'white'} />
                      <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
                        Simple Text-to-Text Agent
                      </Typography>
                    </Box>
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      Create a straightforward AI agent that processes text input and generates text output. Perfect for chatbots, content generation, and simple automation tasks.
                    </Typography>
                    <Button
                      variant="contained"
                      endIcon={<ArrowRight />}
                      sx={{
                        alignSelf: 'flex-start',
                        background: 'rgba(255, 255, 255, 0.1)',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.2)',
                        },
                      }}
                    >
                      Get Started
                    </Button>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>

          {/* Pipeline Agent Card */}
          <Grid item xs={12} md={6} lg={5}>
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
              <CardActionArea onClick={() => navigate('/pipeline-agent')} sx={{ height: '100%' }}>
                <CardContent>
                  <Stack spacing={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <GitBranch size={32} color={'white'} />
                      <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
                        Multi-step AI Pipeline
                      </Typography>
                    </Box>
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      Build complex AI workflows with multiple steps, data processing, and model selection. Ideal for advanced use cases requiring sophisticated AI pipelines.
                    </Typography>
                    <Button
                      variant="contained"
                      endIcon={<ArrowRight />}
                      sx={{
                        alignSelf: 'flex-start',
                        background: 'rgba(255, 255, 255, 0.1)',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.2)',
                        },
                      }}
                    >
                      Get Started
                    </Button>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Home; 