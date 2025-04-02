import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Button,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Bot, ArrowLeft, ArrowRight, Check, Upload, List, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CustomActionForm from '../components/CustomActionForm';

const steps = [
  'Define Input',
  'Data Processing',
  'AI Model Selection',
  'Output Configuration',
  'Review & Deploy',
];
  
const PipelineAgent = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    inputType: '',
    inputDescription: '',
    processingSteps: '',
    modelType: '',
    modelConfig: '',
    outputFormat: '',
    outputDestination: '',
    apiEndpoint: '',
    emailAddress: '',
    webhookUrl: '',
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [pipelineId, setPipelineId] = useState(null);
  const [selectedActions, setSelectedActions] = useState([]);
  const [actionRegistry, setActionRegistry] = useState({});
  const [actionCategories, setActionCategories] = useState([]);
  const [actionsByCategory, setActionsByCategory] = useState({});
  const [showCustomActionForm, setShowCustomActionForm] = useState(false);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const addAction = (actionName) => {
    const action = actionRegistry[actionName];
    if (!action) return;

    setSelectedActions([...selectedActions, {
      name: actionName,
      inputs: {},
      description: action.description
    }]);
  };

  const removeAction = (index) => {
    setSelectedActions(selectedActions.filter((_, i) => i !== index));
  };

  const updateActionInputs = (index, inputs) => {
    const newActions = [...selectedActions];
    newActions[index] = {
      ...newActions[index],
      inputs
    };
    setSelectedActions(newActions);
  };

  const handleSavePipeline = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const pipelineData = {
        name: formData.name,
        description: formData.description,
        steps: selectedActions.map(action => ({
          action: action.name,
          inputs: action.inputs
        })),
        inputType: formData.inputType
      };

      const response = await fetch('http://localhost:5000/api/pipelines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pipelineData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save pipeline');
      }

      const savedPipeline = await response.json();
      setSuccess('Pipeline created successfully! You can now run it from the pipeline list.');
      setPipelineId(savedPipeline._id);
      
      // Navigate to pipeline list after successful creation
      setTimeout(() => {
        navigate('/pipelines');
      }, 1500);
    } catch (error) {
      console.error('Error saving pipeline:', error);
      setError(error.message || 'Failed to save pipeline');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCustomAction = async (customAction) => {
    try {
      const response = await axios.post('http://localhost:5000/api/custom-actions', customAction);
      const newAction = response.data;
      
      // Add the new custom action to the registry
      setActionRegistry(prev => ({
        ...prev,
        [newAction.name]: {
          name: newAction.name,
          description: newAction.description,
          category: 'custom',
          requiredInputs: Object.keys(newAction.inputSchema.properties)
        }
      }));

      // Add to actions by category
      setActionsByCategory(prev => ({
        ...prev,
        custom: [
          ...(prev.custom || []),
          { name: newAction.name, description: newAction.description }
        ]
      }));

      // Add to categories if not exists
      setActionCategories(prev => {
        if (!prev.includes('custom')) {
          return [...prev, 'custom'];
        }
        return prev;
      });

      setShowCustomActionForm(false);
      setSuccess('Custom action created successfully!');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create custom action');
    }
  };

  // Fetch available actions when component mounts
  useEffect(() => {
    const fetchActions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/pipelines/actions');
        setActionRegistry(response.data.registry);
        setActionCategories(response.data.categories);
        setActionsByCategory(response.data.actionsByCategory);
      } catch (error) {
        console.error('Failed to fetch actions:', error);
        setError('Failed to load available actions. Please try again.');
      }
    };

    fetchActions();
  }, []);

  const getPipelineBuilderContent = () => {
    if (!actionCategories.length) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </Box>
      );
    }

    return (
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ color: 'white' }}>
            Build Your Pipeline
          </Typography>
          <Button
            variant="contained"
            onClick={() => setShowCustomActionForm(true)}
            startIcon={<Plus />}
            sx={{
              bgcolor: '#7c3aed',
              '&:hover': { bgcolor: '#5b21b6' }
            }}
          >
            Create Custom Action
          </Button>
        </Box>
        
        {showCustomActionForm ? (
          <CustomActionForm
            onSave={handleSaveCustomAction}
            onCancel={() => setShowCustomActionForm(false)}
          />
        ) : (
          <>
            {/* Action Categories */}
            {actionCategories.map(category => (
              <Box key={category}>
                <Typography variant="subtitle1" sx={{ color: 'white', mb: 1 }}>
                  {category.replace('_', ' ').toUpperCase()}
                </Typography>
                <Grid container spacing={2}>
                  {actionsByCategory[category]?.map(({ name, description }) => (
                    <Grid item xs={12} sm={6} md={4} key={name}>
                      <Paper
                        sx={{
                          p: 2,
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          cursor: 'pointer',
                          '&:hover': {
                            background: 'rgba(255, 255, 255, 0.1)',
                          }
                        }}
                        onClick={() => addAction(name)}
                      >
                        <Typography sx={{ color: 'white', fontWeight: 'bold' }}>
                          {actionRegistry[name]?.name || name}
                        </Typography>
                        <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                          {description}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))}

            {/* Selected Actions */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                Selected Actions
              </Typography>
              {selectedActions.map((action, index) => (
                <Paper
                  key={index}
                  sx={{
                    p: 2,
                    mb: 2,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography sx={{ color: 'white', fontWeight: 'bold' }}>
                      {actionRegistry[action.name]?.name || action.name}
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => removeAction(index)}
                      sx={{ color: 'error.main' }}
                    >
                      Remove
                    </Button>
                  </Box>
                  
                  {/* Action Inputs */}
                  <Stack spacing={2}>
                    {actionRegistry[action.name]?.requiredInputs.map(input => (
                      <TextField
                        key={input}
                        fullWidth
                        label={input}
                        value={action.inputs[input] || ''}
                        onChange={(e) => updateActionInputs(index, {
                          ...action.inputs,
                          [input]: e.target.value
                        })}
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
                            color: 'rgba(255, 255, 255, 0.7)',
                          },
                        }}
                      />
                    ))}
                  </Stack>
                </Paper>
              ))}
            </Box>
          </>
        )}
      </Stack>
    );
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Pipeline Name"
              value={formData.name}
              onChange={handleChange('name')}
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
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={2}
              value={formData.description}
              onChange={handleChange('description')}
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
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'white' }}>Input Type</InputLabel>
              <Select
                value={formData.inputType}
                onChange={handleChange('inputType')}
                label="Input Type"
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#60a5fa',
                  },
                }}
              >
                <MenuItem value="text">Text</MenuItem>
                <MenuItem value="pdf">PDF Document</MenuItem>
                <MenuItem value="image">Image</MenuItem>
                <MenuItem value="audio">Audio</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Input Description"
              multiline
              rows={4}
              value={formData.inputDescription}
              onChange={handleChange('inputDescription')}
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
            {(formData.inputType === 'pdf' || formData.inputType === 'image' || formData.inputType === 'audio') && (
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
                  accept={
                    formData.inputType === 'pdf' ? '.pdf' :
                    formData.inputType === 'image' ? 'image/*' :
                    formData.inputType === 'audio' ? 'audio/*' : '*'
                  }
                />
              </Button>
            )}
            {file && (
              <Typography sx={{ color: 'white' }}>
                Selected file: {file.name}
              </Typography>
            )}
          </Stack>
        );
      case 1:
        return getPipelineBuilderContent();
      case 2:
        return (
          <Stack spacing={3}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'white' }}>Model Type</InputLabel>
              <Select
                value={formData.modelType}
                onChange={handleChange('modelType')}
                label="Model Type"
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#60a5fa',
                  },
                }}
              >
                <MenuItem value="gpt-4">GPT-4</MenuItem>
                <MenuItem value="gpt-3.5-turbo">GPT-3.5 Turbo</MenuItem>
                <MenuItem value="claude-2">Claude 2</MenuItem>
                <MenuItem value="custom">Custom Model</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Model Configuration"
              multiline
              rows={4}
              value={formData.modelConfig}
              onChange={handleChange('modelConfig')}
              placeholder="Specify any additional model configuration parameters"
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
          </Stack>
        );
      case 3:
        return (
          <Stack spacing={3}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'white' }}>Output Format</InputLabel>
              <Select
                value={formData.outputFormat}
                onChange={handleChange('outputFormat')}
                label="Output Format"
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#60a5fa',
                  },
                }}
              >
                <MenuItem value="text">Text</MenuItem>
                <MenuItem value="json">JSON</MenuItem>
                <MenuItem value="image">Image</MenuItem>
                <MenuItem value="audio">Audio</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Output Destination</InputLabel>
              <Select
                value={formData.outputDestination}
                onChange={handleChange('outputDestination')}
                label="Output Destination"
              >
                <MenuItem value="database">Database (Store Results)</MenuItem>
                <MenuItem value="api">API Endpoint</MenuItem>
                <MenuItem value="file">Download File</MenuItem>
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="webhook">Webhook</MenuItem>
              </Select>
            </FormControl>

            {formData.outputDestination === 'api' && (
              <TextField
                fullWidth
                label="API Endpoint URL"
                value={formData.apiEndpoint || ''}
                onChange={handleChange('apiEndpoint')}
                sx={{ mt: 2 }}
              />
            )}

            {formData.outputDestination === 'email' && (
              <TextField
                fullWidth
                label="Email Address"
                value={formData.emailAddress || ''}
                onChange={handleChange('emailAddress')}
                sx={{ mt: 2 }}
              />
            )}

            {formData.outputDestination === 'webhook' && (
              <TextField
                fullWidth
                label="Webhook URL"
                value={formData.webhookUrl || ''}
                onChange={handleChange('webhookUrl')}
                sx={{ mt: 2 }}
              />
            )}
          </Stack>
        );
      case 4:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
              Pipeline Configuration Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper
                  sx={{
                    p: 2,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Input Configuration
                  </Typography>
                  <Typography sx={{ color: 'white' }}>Type: {formData.inputType}</Typography>
                  <Typography sx={{ color: 'white' }}>{formData.inputDescription}</Typography>
                  {file && (
                    <Typography sx={{ color: 'white' }}>
                      File: {file.name}
                    </Typography>
                  )}
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper
                  sx={{
                    p: 2,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Processing Steps
                  </Typography>
                  {selectedActions.map((action, index) => (
                    <Box key={index} sx={{ mb: 1 }}>
                      <Typography sx={{ color: 'white', fontWeight: 'bold' }}>
                        {index + 1}. {actionRegistry[action.name]?.name || action.name}
                      </Typography>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                        {action.description}
                      </Typography>
                      {Object.keys(action.inputs).length > 0 && (
                        <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', ml: 2 }}>
                          Inputs: {Object.entries(action.inputs).map(([key, value]) => (
                            <span key={key}>{key}: {value}, </span>
                          ))}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper
                  sx={{
                    p: 2,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Model Configuration
                  </Typography>
                  <Typography sx={{ color: 'white' }}>Type: {formData.modelType}</Typography>
                  <Typography sx={{ color: 'white' }}>{formData.modelConfig}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper
                  sx={{
                    p: 2,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Output Configuration
                  </Typography>
                  <Typography sx={{ color: 'white' }}>Format: {formData.outputFormat}</Typography>
                  <Typography sx={{ color: 'white' }}>Destination: {formData.outputDestination}</Typography>
                  {formData.outputDestination === 'api' && (
                    <Typography sx={{ color: 'white' }}>API Endpoint: {formData.apiEndpoint}</Typography>
                  )}
                  {formData.outputDestination === 'email' && (
                    <Typography sx={{ color: 'white' }}>Email: {formData.emailAddress}</Typography>
                  )}
                  {formData.outputDestination === 'webhook' && (
                    <Typography sx={{ color: 'white' }}>Webhook URL: {formData.webhookUrl}</Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Stack>
        );
      default:
        return 'Unknown step';
    }
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
            justifyContent: 'space-between',
            mb: 6,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Bot size={40} color={'white'} />
            <Typography
              variant="h4"
              component="h1"
              sx={{
                color: 'white',
                textAlign: 'center',
              }}
            >
              Multi-step AI Pipeline Builder
            </Typography>
          </Box>
          <Button
            startIcon={<List />}
            onClick={() => navigate('/pipelines')}
            sx={{
              color: 'white',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            View All Pipelines
          </Button>
        </Box>

        <Paper
          sx={{
            p: 4,
            background: 'rgba(30, 41, 59, 0.7)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
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

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel sx={{ color: 'white' }}>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ mb: 4 }}>{getStepContent(activeStep)}</Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              disabled={activeStep === 0 || loading}
              onClick={handleBack}
              startIcon={<ArrowLeft />}
              sx={{
                color: 'white',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={activeStep === steps.length - 1 ? handleSavePipeline : handleNext}
              endIcon={activeStep === steps.length - 1 ? <Check /> : <ArrowRight />}
              disabled={loading}
              sx={{
                background: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : activeStep === steps.length - 1 ? (
                'Deploy Pipeline'
              ) : (
                'Next'
              )}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default PipelineAgent; 