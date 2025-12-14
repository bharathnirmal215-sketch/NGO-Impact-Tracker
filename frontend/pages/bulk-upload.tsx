import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Alert,
  LinearProgress,
  CircularProgress,
  Card,
  CardContent,
  useTheme,
  alpha,
  Chip,
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

interface JobStatus {
  job_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  total_rows: number
  processed_rows: number
  successful_rows: number
  failed_rows: number
  error_message?: string
}

export default function BulkUpload() {
  const router = useRouter()
  const theme = useTheme()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null)
  const [error, setError] = useState('')
  const [polling, setPolling] = useState(false)

  useEffect(() => {
    if (jobId && !polling) {
      setPolling(true)
      const interval = setInterval(async () => {
        try {
          const response = await axios.get(`${API_URL}/job-status/${jobId}`)
          const status = response.data
          setJobStatus(status)

          if (status.status === 'completed' || status.status === 'failed') {
            clearInterval(interval)
            setPolling(false)
          }
        } catch (err) {
          console.error('Error polling job status:', err)
        }
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [jobId, polling])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Please select a CSV file')
        return
      }
      setFile(selectedFile)
      setError('')
      setJobId(null)
      setJobStatus(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file')
      return
    }

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await axios.post(`${API_URL}/reports/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setJobId(response.data.job_id)
      
      // Handle both async (202) and sync (200) responses
      if (response.data.status && response.data.total_rows !== undefined) {
        // Synchronous processing completed - use the actual status from backend
        setJobStatus({
          job_id: response.data.job_id,
          status: response.data.status,
          total_rows: response.data.total_rows || 0,
          processed_rows: response.data.processed_rows || 0,
          successful_rows: response.data.successful_rows || 0,
          failed_rows: response.data.failed_rows || 0,
          error_message: response.data.error_message,
        })
      } else {
        // Asynchronous processing started (shouldn't happen now, but keep for compatibility)
        setJobStatus({
          job_id: response.data.job_id,
          status: 'pending',
          total_rows: 0,
          processed_rows: 0,
          successful_rows: 0,
          failed_rows: 0,
        })
      }
    } catch (err: any) {
      if (err.response?.data) {
        setError(err.response.data.error || 'Upload failed')
      } else {
        setError('Failed to upload file. Please try again.')
      }
    } finally {
      setUploading(false)
    }
  }

  const progress = jobStatus && jobStatus.total_rows > 0
    ? (jobStatus.processed_rows / jobStatus.total_rows) * 100
    : 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'failed':
        return 'error'
      case 'processing':
        return 'info'
      default:
        return 'default'
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
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
                bgcolor: alpha(theme.palette.secondary.main, 0.1),
                color: theme.palette.secondary.main,
                p: 1.5,
                borderRadius: 2,
              }}
            >
              <CloudUploadIcon />
            </Card>
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 0.5 }}>
                Bulk Report Upload
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Upload a CSV file containing multiple monthly reports
              </Typography>
            </Box>
          </Box>
        </Box>

        <Card sx={{ boxShadow: 3, mb: 3 }}>
          <CardContent sx={{ p: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ mb: 3 }}>
              <input
                accept=".csv"
                style={{ display: 'none' }}
                id="csv-file-input"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="csv-file-input">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                  sx={{
                    py: 3,
                    borderRadius: 2,
                    borderStyle: 'dashed',
                    borderWidth: 2,
                    '&:hover': {
                      borderStyle: 'dashed',
                      borderWidth: 2,
                    },
                  }}
                >
                  {file ? file.name : 'Select CSV File'}
                </Button>
              </label>
            </Box>

            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={!file || uploading}
              fullWidth
              sx={{
                mb: 3,
                py: 1.5,
                fontSize: '1rem',
                borderRadius: 2,
              }}
            >
              {uploading ? <CircularProgress size={24} color="inherit" /> : 'Upload and Process'}
            </Button>

            {jobStatus && (
              <Card
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                      Processing Status
                    </Typography>
                    <Chip
                      icon={jobStatus.status === 'completed' ? <CheckCircleIcon /> : jobStatus.status === 'failed' ? <ErrorIcon /> : undefined}
                      label={jobStatus.status.charAt(0).toUpperCase() + jobStatus.status.slice(1)}
                      color={getStatusColor(jobStatus.status) as any}
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Job ID: {jobStatus.job_id}
                  </Typography>

                  {jobStatus.status === 'processing' && (
                    <Box sx={{ mt: 3 }}>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          mb: 2,
                        }}
                      />
                      <Typography variant="body2" sx={{ textAlign: 'center' }}>
                        Processed {jobStatus.processed_rows} of {jobStatus.total_rows} rows
                      </Typography>
                    </Box>
                  )}

                  {jobStatus.status === 'completed' && (
                    <Box sx={{ mt: 3 }}>
                      <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                        Processing completed successfully!
                      </Alert>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Chip
                          label={`Successful: ${jobStatus.successful_rows} rows`}
                          color="success"
                          variant="outlined"
                        />
                        {jobStatus.failed_rows > 0 && (
                          <Chip
                            label={`Failed: ${jobStatus.failed_rows} rows`}
                            color="error"
                            variant="outlined"
                          />
                        )}
                      </Box>
                      {jobStatus.error_message && (
                        <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                          <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.75rem', m: 0 }}>
                            {jobStatus.error_message}
                          </Typography>
                        </Alert>
                      )}
                    </Box>
                  )}

                  {jobStatus.status === 'failed' && (
                    <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                      {jobStatus.error_message || 'Processing failed'}
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            <Box
              sx={{
                mt: 4,
                p: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                borderRadius: 2,
              }}
            >
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
                CSV Format:
              </Typography>
              <Typography
                variant="body2"
                component="pre"
                sx={{
                  fontSize: '0.875rem',
                  fontFamily: 'monospace',
                  bgcolor: 'background.paper',
                  p: 2,
                  borderRadius: 1,
                  overflow: 'auto',
                }}
              >
                {`ngo_id,month,people_helped,events_conducted,funds_utilized
NGO001,2024-01,150,5,50000.00
NGO002,2024-01,200,8,75000.00`}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}
