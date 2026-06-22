import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Typography,
} from '@mui/material'
import { CheckCircle, Logout } from '@mui/icons-material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'
import { attendanceApi } from '../../services/apiServices'

const theme = {
  primaryGreen: '#2E7D32',
  darkGreenHover: '#1B5E20',
  lightGreenBackground: '#E8F5E9',
  borderColor: '#E8F5E9',
  primaryText: '#1F2937',
  secondaryText: '#6B7280',
  surface: '#F8FAF8',
}

export default function LogoutAttendancePage() {
  const queryClient = useQueryClient()
  const [error, setError] = useState('')
  const [gettingLocation, setGettingLocation] = useState(false)
  const [logoutRecord, setLogoutRecord] = useState(null)
  const [now, setNow] = useState(dayjs())

  const { data, isLoading, isError } = useQuery({
    queryKey: ['today-status'],
    queryFn: () => attendanceApi.getTodayStatus(),
  })

  const record = logoutRecord || data?.data?.data
  const hasAttendance = record?.status === 'PRESENT'
  const isLoggedOut = record?.sessionStatus === 'LOGGED_OUT' || Boolean(record?.logoutTime)
  const shiftEnd = record?.shiftEndTime
    ? dayjs(`${record.attendanceDate}T${record.shiftEndTime}`)
    : null
  const shiftEnded = shiftEnd ? !now.isBefore(shiftEnd) : false

  const { mutate: markLogout, isPending } = useMutation({
    mutationFn: (location) => attendanceApi.markLogout(location),
    onSuccess: (res) => {
      const updatedRecord = res.data.data
      setLogoutRecord(updatedRecord)
      setError('')
      queryClient.invalidateQueries({ queryKey: ['today-status'] })
      toast.success('Logout attendance marked successfully.')
    },
    onError: (err) => {
      const message = err?.response?.data?.message || 'Failed to mark logout attendance.'
      setError(message)
      toast.error(message)
    },
  })

  const submitLogout = (silent = false) => {
    setError('')
    setGettingLocation(true)

    if (!navigator.geolocation) {
      if (!silent) setError('Your browser does not support GPS location.')
      setGettingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        markLogout({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setGettingLocation(false)
      },
      (err) => {
        let message = 'Unable to get your location. Please try again.'
        if (err.code === 1) {
          message = 'Location permission denied. Please allow location access in browser settings.'
        }
        if (err.code === 2) message = 'Location unavailable. Please try again.'
        if (err.code === 3) message = 'Location request timed out. Please try again.'
        if (!silent) setError(message)
        setGettingLocation(false)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }

  useEffect(() => {
    const timer = window.setInterval(() => setNow(dayjs()), 30000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!record?.id || !shiftEnded || isLoggedOut || isPending || gettingLocation) return
    if (!navigator.permissions?.query) return

    const autoLogoutKey = `auto-logout-${record.id}`
    if (sessionStorage.getItem(autoLogoutKey)) return
    sessionStorage.setItem(autoLogoutKey, 'attempted')

    navigator.permissions
      .query({ name: 'geolocation' })
      .then((permission) => {
        if (permission.state === 'granted') submitLogout(true)
      })
      .catch(() => {})
  }, [record?.id, shiftEnded, isLoggedOut, isPending, gettingLocation])

  return (
    <Box sx={{ width: '100%', overflowX: 'hidden' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} color={theme.primaryText}>
          Logout Attendance
        </Typography>
        <Typography sx={{ color: theme.secondaryText, mt: 0.5 }}>
          Close today's attendance session after your shift ends.
        </Typography>
      </Box>

      <Card
        sx={{
          borderRadius: 4,
          border: `1px solid ${theme.borderColor}`,
          boxShadow: 'none',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            px: 3,
            py: 2,
            bgcolor: theme.surface,
            borderBottom: `1px solid ${theme.borderColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Attendance Session
            </Typography>
            <Typography variant="body2" color={theme.secondaryText}>
              {isLoading
                ? 'Checking today attendance...'
                : isLoggedOut
                  ? 'Your teaching session has been closed.'
                  : shiftEnded
                    ? 'Your shift has ended. Mark your logout attendance.'
                    : shiftEnd
                      ? `Available after your shift ends at ${shiftEnd.format('hh:mm A')}.`
                      : 'Mark your attendance first before logout attendance.'}
            </Typography>
          </Box>
          <Chip
            label={isLoggedOut ? 'LOGGED OUT' : hasAttendance ? 'PENDING' : 'NOT MARKED'}
            color={isLoggedOut ? 'success' : hasAttendance ? 'warning' : 'default'}
            variant="outlined"
            sx={{ fontWeight: 700 }}
          />
        </Box>

        <CardContent sx={{ p: 3 }}>
          {isLoading && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress size={28} />
            </Box>
          )}

          {isError && (
            <Alert severity="error">Failed to load today's attendance status.</Alert>
          )}

          {!isLoading && !isError && !hasAttendance && (
            <Alert severity="info">
              You need to mark attendance before logout attendance is available.
            </Alert>
          )}

          {!isLoading && !isError && hasAttendance && isLoggedOut && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircle sx={{ fontSize: 56, color: theme.primaryGreen, mb: 1 }} />
              <Typography variant="h6" fontWeight={700} color={theme.primaryText}>
                Logout Attendance Marked
              </Typography>
              <Typography color={theme.secondaryText} sx={{ mt: 0.5 }}>
                Logged out at <strong>{dayjs(record.logoutTime).format('hh:mm A')}</strong>
              </Typography>
            </Box>
          )}

          {!isLoading && !isError && hasAttendance && !isLoggedOut && (
            <Box sx={{ maxWidth: 620, mx: 'auto' }}>
              <Alert severity="info" sx={{ mb: 3 }}>
                {shiftEnded
                  ? "Mark logout to close today's attendance session."
                  : 'The logout action will become available when your shift ends.'}
              </Alert>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  startIcon={
                    gettingLocation || isPending
                      ? <CircularProgress size={20} color="inherit" />
                      : <Logout />
                  }
                  onClick={() => submitLogout()}
                  disabled={!shiftEnded || gettingLocation || isPending}
                  sx={{
                    bgcolor: theme.primaryGreen,
                    fontWeight: 600,
                    '&:hover': { bgcolor: theme.darkGreenHover },
                  }}
                >
                  {gettingLocation || isPending ? 'Marking Logout...' : 'Mark Logout'}
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
