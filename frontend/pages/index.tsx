import { useState } from 'react'
import { useRouter } from 'next/router'
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Avatar,
  useTheme,
  alpha,
} from '@mui/material'
import Link from 'next/link'
import AssessmentIcon from '@mui/icons-material/Assessment'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DashboardIcon from '@mui/icons-material/Dashboard'

export default function Home() {
  const theme = useTheme()
  const router = useRouter()

  const features = [
    {
      title: 'Submit Report',
      description: 'Submit a single monthly report with your impact metrics',
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.primary.main,
      href: '/submit-report',
      buttonText: 'Go to Form',
    },
    {
      title: 'Bulk Upload',
      description: 'Upload a CSV file with multiple monthly reports',
      icon: <CloudUploadIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.secondary.main,
      href: '/bulk-upload',
      buttonText: 'Upload CSV',
    },
    {
      title: 'Admin Dashboard',
      description: 'View aggregated impact data and statistics',
      icon: <DashboardIcon sx={{ fontSize: 40 }} />,
      color: '#f59e0b',
      href: '/dashboard',
      buttonText: 'View Dashboard',
    },
  ]

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        pb: 8,
      }}
    >
      <Container maxWidth="lg" sx={{ pt: 8, pb: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 800,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            NGO Impact Tracker
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto', fontWeight: 400 }}
          >
            Track and report the impact of your work with powerful analytics and insights
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: `1px solid ${alpha(feature.color, 0.2)}`,
                  background: `linear-gradient(135deg, ${alpha(feature.color, 0.05)} 0%, ${alpha('#ffffff', 0.95)} 100%)`,
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 4 }}>
                  <Avatar
                    sx={{
                      bgcolor: alpha(feature.color, 0.1),
                      color: feature.color,
                      width: 72,
                      height: 72,
                      mb: 3,
                      mx: 'auto',
                    }}
                  >
                    {feature.icon}
                  </Avatar>
                  <Typography
                    variant="h5"
                    component="h2"
                    gutterBottom
                    sx={{ fontWeight: 600, mb: 2, textAlign: 'center' }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 3, textAlign: 'center', minHeight: 48 }}
                  >
                    {feature.description}
                  </Typography>
                  <Link href={feature.href} passHref>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        bgcolor: feature.color,
                        '&:hover': {
                          bgcolor: feature.color,
                          opacity: 0.9,
                        },
                        py: 1.5,
                        fontSize: '1rem',
                      }}
                    >
                      {feature.buttonText}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Empowering NGOs to measure and showcase their impact
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}

