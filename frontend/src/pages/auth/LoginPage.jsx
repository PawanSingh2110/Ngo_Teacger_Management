import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  School,
} from '@mui/icons-material'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import { authApi } from '../../services/apiServices'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')

  const { mutate, isPending } = useMutation({
    mutationFn: () => authApi.login(form),

    onSuccess: (res) => {
      const data = res.data.data

      login(data)

      toast.success(`Welcome back, ${data.fullName}!`)

      navigate(
        data.role === 'SUPER_ADMIN'
          ? '/admin/dashboard'
          : '/teacher/dashboard'
      )
    },

    onError: (err) => {
      const msg =
        err.response?.data?.message ||
        'Login failed. Please try again.'

      setError(msg)
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()

    setError('')

    if (!form.email || !form.password) {
      setError('Email and password are required')
      return
    }

    mutate()
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        fontFamily: 'Poppins, sans-serif',
        background:
          'linear-gradient(135deg, #F8FAF8 0%, #EDF7ED 100%)',
      }}
    >
      <Card
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 440,
          borderRadius: 5,
          overflow: 'hidden',
          border: '1px solid #E8F5E9',
          backgroundColor: '#FFFFFF',
          boxShadow:
            '0 15px 40px rgba(46,125,50,0.08)',
        }}
      >
        {/* NGO Accent Bar */}
        <Box
          sx={{
            height: 6,
            background:
              'linear-gradient(90deg, #2E7D32 0%, #26A69A 100%)',
          }}
        />

        <CardContent sx={{ p: 5 }}>
          {/* Logo + Title */}
          <Box
            sx={{
              textAlign: 'center',
              mb: 4,
            }}
          >
            <Box
              sx={{
                width: 74,
                height: 74,
                borderRadius: '20px',
                backgroundColor: '#2E7D32',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
                boxShadow:
                  '0 10px 25px rgba(46,125,50,0.18)',
              }}
            >
              <School
                sx={{
                  color: '#FFFFFF',
                  fontSize: 38,
                }}
              />
            </Box>

            <Typography
              sx={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 700,
                fontSize: '1.8rem',
                color: '#1F2937',
              }}
            >
              NGO Attendance
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                color: '#6B7280',
                fontSize: '0.95rem',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              Teacher Attendance Management System
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
              }}
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              autoFocus
              required
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
              sx={{
                mb: 2.5,

                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                },

                '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                  borderColor: '#2E7D32',
                },

                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#2E7D32',
                },
              }}
            />

            <TextField
              fullWidth
              label="Password"
              required
              type={showPass ? 'text' : 'password'}
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
              sx={{
                mb: 3,

                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                },

                '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                  borderColor: '#2E7D32',
                },

                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#2E7D32',
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={() =>
                        setShowPass(!showPass)
                      }
                    >
                      {showPass ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              size="large"
              variant="contained"
              disabled={isPending}
              sx={{
                py: 1.6,
                borderRadius: 3,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                fontFamily: 'Poppins, sans-serif',
                backgroundColor: '#2E7D32',
                boxShadow: 'none',

                '&:hover': {
                  backgroundColor: '#1B5E20',
                  boxShadow:
                    '0 10px 20px rgba(46,125,50,0.18)',
                },

                '&:disabled': {
                  backgroundColor: '#81C784',
                  color: '#FFFFFF',
                },
              }}
            >
              {isPending ? (
                <CircularProgress
                  size={24}
                  color="inherit"
                />
              ) : (
                'Sign In'
              )}
            </Button>
          </Box>

          <Typography
            sx={{
              textAlign: 'center',
              mt: 4,
              color: '#6B7280',
              fontSize: '0.8rem',
              lineHeight: 1.6,
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            Login is separate from attendance marking.
            <br />
            Teachers can login from anywhere.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}