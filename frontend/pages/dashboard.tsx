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
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  alpha,
  Chip,
  Avatar,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PeopleIcon from '@mui/icons-material/People'
import EventIcon from '@mui/icons-material/Event'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

interface Report {
  id: number
  ngo_id: string
  month: string
  people_helped: number
  events_conducted: number
  funds_utilized: number
  created_at: string
}

interface DashboardData {
  month: string
  total_ngos_reporting: number
  total_people_helped: number
  total_events_conducted: number
  total_funds_utilized: number
  reports: Report[]
}

export default function Dashboard() {
  const router = useRouter()
  const theme = useTheme()
  const [month, setMonth] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<DashboardData | null>(null)

  const handleLoad = async (monthToLoad?: string) => {
    // Ensure we have a string value - handle both string and object cases
    let monthValue: string
    if (monthToLoad) {
      monthValue = String(monthToLoad).trim()
    } else if (month) {
      // Handle case where month might be an object
      monthValue = typeof month === 'string' ? month.trim() : String(month).trim()
    } else {
      monthValue = ''
    }
    
    if (!monthValue) {
      setError('Please enter a month')
      return
    }

    // Validate format before sending - allow YYYY-MM format
    // Remove any extra whitespace and validate
    const cleanedMonth = monthValue.replace(/\s+/g, '')
    const monthRegex = /^\d{4}-\d{2}$/
    
    if (!monthRegex.test(cleanedMonth)) {
      setError(`Invalid format. Please use YYYY-MM (e.g., 2024-01). You entered: "${monthValue}"`)
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await axios.get(`${API_URL}/dashboard`, {
        params: { month: cleanedMonth },
      })
      setData(response.data)
    } catch (err: any) {
      if (err.response?.data) {
        setError(err.response.data.error || 'Failed to load dashboard data')
      } else {
        setError('Failed to load dashboard data. Please try again.')
      }
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  const getCurrentMonth = () => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }

  const handleLoadCurrentMonth = () => {
    const currentMonth = getCurrentMonth()
    setMonth(currentMonth)
    // Use setTimeout to ensure state is updated, or pass directly
    setTimeout(() => handleLoad(currentMonth), 0)
  }

  const statCards = data ? [
    {
      title: 'Total NGOs Reporting',
      value: data.total_ngos_reporting,
      icon: <DashboardIcon />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Total People Helped',
      value: data.total_people_helped.toLocaleString(),
      icon: <PeopleIcon />,
      color: theme.palette.secondary.main,
    },
    {
      title: 'Total Events Conducted',
      value: data.total_events_conducted.toLocaleString(),
      icon: <EventIcon />,
      color: '#f59e0b',
    },
    {
      title: 'Total Funds Utilized',
      value: `₹${data.total_funds_utilized.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
      icon: <AttachMoneyIcon />,
      color: '#10b981',
    },
  ] : []

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/')}
            sx={{ mb: 3, color: 'text.secondary' }}
          >
            Back to Home
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                width: 64,
                height: 64,
              }}
            >
              <DashboardIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 0.5 }}>
                Admin Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                View aggregated impact data and statistics
              </Typography>
            </Box>
          </Box>
        </Box>

        <Card sx={{ boxShadow: 3, mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Box 
              component="form"
              onSubmit={(e) => {
                e.preventDefault()
                handleLoad()
              }}
              sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}
            >
              <TextField
                label="Month (YYYY-MM)"
                value={month}
                onChange={(e) => {
                  const value = e.target.value
                  setMonth(value)
                  // Clear error when user starts typing
                  if (error) {
                    setError('')
                  }
                }}
                onKeyPress={(e) => {
                  // Allow Enter key to trigger load
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleLoad()
                  }
                }}
                placeholder="2024-01"
                helperText="Format: YYYY-MM (e.g., 2024-01)"
                sx={{ flex: 1, minWidth: 200 }}
                InputProps={{
                  sx: { borderRadius: 2 },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <TrendingUpIcon />}
                sx={{
                  minWidth: 140,
                  py: 1.5,
                  borderRadius: 2,
                }}
              >
                {loading ? 'Loading...' : 'Load Data'}
              </Button>
              <Button
                type="button"
                variant="outlined"
                onClick={handleLoadCurrentMonth}
                disabled={loading}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                }}
              >
                Current Month
              </Button>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mt: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}
          </CardContent>
        </Card>

        {data && (
          <>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Summary for {data.month}
              </Typography>
              <Chip
                label={`${data.reports?.length || 0} Reports`}
                color="primary"
                variant="outlined"
              />
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              {statCards.map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card
                    sx={{
                      height: '100%',
                      background: `linear-gradient(135deg, ${alpha(stat.color, 0.1)} 0%, ${alpha('#ffffff', 0.95)} 100%)`,
                      border: `1px solid ${alpha(stat.color, 0.2)}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography color="text.secondary" sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                          {stat.title}
                        </Typography>
                        <Box
                          sx={{
                            bgcolor: alpha(stat.color, 0.1),
                            color: stat.color,
                            p: 1,
                            borderRadius: 2,
                          }}
                        >
                          {stat.icon}
                        </Box>
                      </Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color }}>
                        {stat.value}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {data.reports && data.reports.length > 0 && (
              <Card sx={{ boxShadow: 3 }}>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ p: 3, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Individual NGO Reports
                    </Typography>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                            '& th': {
                              fontWeight: 600,
                              color: 'text.primary',
                            },
                          }}
                        >
                          <TableCell><strong>NGO ID</strong></TableCell>
                          <TableCell><strong>Month</strong></TableCell>
                          <TableCell align="right"><strong>People Helped</strong></TableCell>
                          <TableCell align="right"><strong>Events Conducted</strong></TableCell>
                          <TableCell align="right"><strong>Funds Utilized</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.reports.map((report, index) => (
                          <TableRow
                            key={report.id}
                            sx={{
                              '&:nth-of-type(odd)': {
                                bgcolor: alpha(theme.palette.primary.main, 0.02),
                              },
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                              },
                            }}
                          >
                            <TableCell>
                              <Chip
                                label={report.ngo_id}
                                size="small"
                                sx={{
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  color: theme.palette.primary.main,
                                  fontWeight: 600,
                                }}
                              />
                            </TableCell>
                            <TableCell>{report.month}</TableCell>
                            <TableCell align="right">
                              <Typography sx={{ fontWeight: 600 }}>
                                {report.people_helped.toLocaleString()}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography sx={{ fontWeight: 600 }}>
                                {report.events_conducted.toLocaleString()}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography sx={{ fontWeight: 600, color: theme.palette.secondary.main }}>
                                ₹{parseFloat(report.funds_utilized.toString()).toLocaleString('en-IN', {
                                  maximumFractionDigits: 2,
                                })}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {!data && !loading && (
          <Card sx={{ boxShadow: 3 }}>
            <CardContent sx={{ p: 6, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Data Loaded
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enter a month and click "Load Data" to view dashboard statistics
              </Typography>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  )
}
