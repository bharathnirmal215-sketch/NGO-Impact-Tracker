import { useState } from 'react'
import { useRouter } from 'next/router'
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
  Card,
  CardContent,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AssessmentIcon from '@mui/icons-material/Assessment'
import SendIcon from '@mui/icons-material/Send'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export default function SubmitReport() {
  const router = useRouter()
  const theme = useTheme()
  const [formData, setFormData] = useState({
    ngo_id: '',
    month: '',
    people_helped: '',
    events_conducted: '',
    funds_utilized: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('')
    setSuccess(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const payload = {
        ngo_id: formData.ngo_id,
        month: formData.month,
        people_helped: parseInt(formData.people_helped),
        events_conducted: parseInt(formData.events_conducted),
        funds_utilized: parseFloat(formData.funds_utilized),
      }

      const response = await axios.post(`${API_URL}/report`, payload)
      
      setSuccess(true)
      setFormData({
        ngo_id: '',
        month: '',
        people_helped: '',
        events_conducted: '',
        funds_utilized: '',
      })
      
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (err: any) {
      if (err.response?.data) {
        const errorData = err.response.data
        if (typeof errorData === 'object') {
          const errorMessages = Object.entries(errorData)
            .map(([key, value]: [string, any]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('\n')
          setError(errorMessages)
        } else {
          setError(errorData)
        }
      } else {
        setError('Failed to submit report. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/')}
            sx={{ mb: 3, color: 'text.secondary' }}
          >
            Back to Home
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Card
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                p: 1.5,
                borderRadius: 2,
              }}
            >
              <AssessmentIcon />
            </Card>
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 0.5 }}>
                Submit Monthly Report
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Submit a single monthly report with your impact metrics
              </Typography>
            </Box>
          </Box>
        </Box>

        <Card sx={{ boxShadow: 3 }}>
          <CardContent sx={{ p: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                Report submitted successfully! Redirecting...
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  fullWidth
                  label="NGO ID"
                  name="ngo_id"
                  value={formData.ngo_id}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Month (YYYY-MM)"
                  name="month"
                  value={formData.month}
                  onChange={handleChange}
                  required
                  placeholder="2024-01"
                  helperText="Format: YYYY-MM"
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="People Helped"
                  name="people_helped"
                  type="number"
                  value={formData.people_helped}
                  onChange={handleChange}
                  required
                  inputProps={{ min: 0 }}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Events Conducted"
                  name="events_conducted"
                  type="number"
                  value={formData.events_conducted}
                  onChange={handleChange}
                  required
                  inputProps={{ min: 0 }}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Funds Utilized (₹)"
                  name="funds_utilized"
                  type="number"
                  value={formData.funds_utilized}
                  onChange={handleChange}
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />

                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                    sx={{
                      flex: 1,
                      py: 1.5,
                      fontSize: '1rem',
                      borderRadius: 2,
                    }}
                  >
                    {loading ? 'Submitting...' : 'Submit Report'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => router.push('/')}
                    sx={{
                      flex: 1,
                      py: 1.5,
                      fontSize: '1rem',
                      borderRadius: 2,
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}
