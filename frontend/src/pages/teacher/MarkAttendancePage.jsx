import { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material'
import {
  LocationOn,
  CheckCircle,
  MyLocation,
  Send,
  AccessTime,
  Shield,
  ExpandMore,
  LocationOff,
  ErrorOutline,
} from '@mui/icons-material'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { attendanceApi } from '../../services/apiServices'
import dayjs from 'dayjs'

const STEPS = ['Allow Location', 'Verify GPS', 'Mark Attendance']

const theme = {
  primaryGreen: '#2E7D32',
  darkGreenHover: '#1B5E20',
  lightGreenBackground: '#E8F5E9',
  tableHeaderBackground: '#F1F8F4',
  borderColor: '#E8F5E9',
  primaryText: '#1F2937',
  secondaryText: '#6B7280',
  blueAccent: '#2563EB',
  redAccent: '#DC2626',
  blueBackground: '#EFF6FF',
  redBackground: '#FEE2E2',
  grayBackground: '#F3F4F6',
  surface: '#F8FAF8',
}

function StatCard({ title, value, icon, bgColor, iconColor }) {
  return (
    <Card
      sx={{
        borderRadius: 4,
        border: '1px solid #E8F5E9',
        boxShadow: 'none',
        height: '100%',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 3,
              bgcolor: bgColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: iconColor,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {value}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

function VerificationSuccessCard({ accuracy, capturedAt, onRetry, onMark, isPending, coords }) {
  return (
    <Box sx={{ textAlign: 'center', py: 1 }}>
      <Box
        sx={{
          width: 92,
          height: 92,
          borderRadius: '50%',
          bgcolor: theme.lightGreenBackground,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 2,
        }}
      >
        <LocationOn sx={{ fontSize: 46, color: theme.primaryGreen }} />
      </Box>

      <Typography variant="h5" fontWeight={700} color={theme.primaryText} sx={{ mb: 1 }}>
        Location Captured
      </Typography>

      <Typography variant="body2" color={theme.secondaryText} sx={{ mb: 3, maxWidth: 520, mx: 'auto' }}>
        Your location has been verified successfully. You can now mark attendance.
      </Typography>

      <Card
        sx={{
          borderRadius: 4,
          border: '1px solid #E8F5E9',
          bgcolor: theme.surface,
          boxShadow: 'none',
          maxWidth: 520,
          mx: 'auto',
          textAlign: 'left',
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2}>
            {/* <Grid item xs={12} sm={4}>
              <Typography variant="body2" color={theme.secondaryText}>
                Current Accuracy
              </Typography>
              <Typography variant="h6" fontWeight={700} color={theme.primaryText}>
                {accuracy}m
              </Typography>
            </Grid> */}
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color={theme.secondaryText}>
                Captured At
              </Typography>
              <Typography variant="h6" fontWeight={700} color={theme.primaryText}>
                {capturedAt}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color={theme.secondaryText}>
                Status
              </Typography>
              <Chip
                label="Location Verified"
                sx={{
                  bgcolor: theme.lightGreenBackground,
                  color: theme.primaryGreen,
                  fontWeight: 700,
                  mt: 0.5,
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Accordion
        sx={{
          maxWidth: 520,
          mx: 'auto',
          border: '1px solid #E8F5E9',
          boxShadow: 'none',
          borderRadius: '16px !important',
          overflow: 'hidden',
          mb: 3,
          '&:before': { display: 'none' },
        }}
      >
        <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: theme.surface }}>
          <Typography variant="body2" fontWeight={600}>
            Show Technical Details
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ textAlign: 'left', bgcolor: 'white' }}>
          <Typography variant="body2" color={theme.secondaryText}>
            Latitude: {coords.latitude.toFixed(6)}
          </Typography>
          <Typography variant="body2" color={theme.secondaryText}>
            Longitude: {coords.longitude.toFixed(6)}
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          onClick={onRetry}
          sx={{
            borderColor: theme.borderColor,
            color: theme.primaryText,
            fontWeight: 600,
            '&:hover': {
              borderColor: theme.primaryGreen,
              backgroundColor: theme.lightGreenBackground,
            },
          }}
        >
          Retry Location
        </Button>

        <Button
          variant="contained"
          size="large"
          startIcon={isPending ? <CircularProgress size={20} color="inherit" /> : <Send />}
          onClick={onMark}
          disabled={isPending}
          sx={{
            px: 4,
            bgcolor: theme.primaryGreen,
            color: 'white',
            fontWeight: 600,
            borderRadius: 2,
            boxShadow: 'none',
            '&:hover': {
              bgcolor: theme.darkGreenHover,
              boxShadow: 'none',
            },
          }}
        >
          {isPending ? 'Marking...' : 'Mark Attendance'}
        </Button>
      </Box>
    </Box>
  )
}

function VerificationErrorCard({ distanceFromCenter, allowedRadius, centerName, onRetry }) {
  return (
    <Box sx={{ textAlign: 'center', py: 1 }}>
      <Box
        sx={{
          width: 92,
          height: 92,
          borderRadius: '50%',
          bgcolor: theme.redBackground,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 2,
        }}
      >
        <LocationOff sx={{ fontSize: 46, color: theme.redAccent }} />
      </Box>

      <Typography variant="h5" fontWeight={700} color={theme.primaryText} sx={{ mb: 1 }}>
        Attendance Cannot Be Marked
      </Typography>

      <Card
        sx={{
          borderRadius: 4,
          border: '1px solid #FECACA',
          bgcolor: '#FFF7F7',
          boxShadow: 'none',
          maxWidth: 620,
          mx: 'auto',
          textAlign: 'left',
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="body1" sx={{ color: theme.primaryText, lineHeight: 1.7 }}>
            You are <strong>{distanceFromCenter}</strong> meters away from <strong>{centerName}</strong>.
          </Typography>

          <Typography variant="body1" sx={{ color: theme.primaryText, mt: 1.5, lineHeight: 1.7 }}>
            Maximum allowed distance: <strong>{allowedRadius}</strong> meters.
          </Typography>

          <Typography variant="body1" sx={{ color: theme.primaryText, mt: 1.5, lineHeight: 1.7 }}>
            Move closer to the center and try again.
          </Typography>
        </CardContent>
      </Card>

      <Button
        variant="contained"
        onClick={onRetry}
        sx={{
          px: 4,
          bgcolor: theme.primaryGreen,
          color: 'white',
          fontWeight: 600,
          borderRadius: 2,
          boxShadow: 'none',
          '&:hover': {
            bgcolor: theme.darkGreenHover,
            boxShadow: 'none',
          },
        }}
      >
        Try Again
      </Button>
    </Box>
  )
}

export default function MarkAttendancePage() {
  const [step, setStep] = useState(0)
  const [coords, setCoords] = useState(null)
  const [locError, setLocError] = useState('')
  const [locLoading, setLocLoading] = useState(false)
  const [marked, setMarked] = useState(null)
  const [verificationError, setVerificationError] = useState(null)

  const { data: todayData } = useQuery({
    queryKey: ['today-status'],
    queryFn: () => attendanceApi.getTodayStatus(),
  })
  const todayRecord = todayData?.data?.data

  const { mutate: markAttendance, isPending } = useMutation({
    mutationFn: () =>
      attendanceApi.markAttendance({
        latitude: coords.latitude,
        longitude: coords.longitude,
      }),
    onSuccess: (res) => {
      const record = res.data.data
      setMarked(record)
      setStep(3)
      toast.success('Attendance marked! You are PRESENT today 🎉')
    },
    onError: (err) => {
      const resData = err?.response?.data || {}
      const msg = resData?.message || 'Failed to mark attendance'

      const distanceFromCenter = resData?.distanceFromCenter
      const allowedRadius = resData?.allowedRadius
      const centerName = resData?.centerName

      if (
        distanceFromCenter !== undefined &&
        allowedRadius !== undefined &&
        centerName
      ) {
        setVerificationError({
          distanceFromCenter,
          allowedRadius,
          centerName,
        })
        setStep(2)
      } else {
        toast.error(msg)
      }
    },
  })

  const requestLocation = () => {
    setLocError('')
    setVerificationError(null)
    setLocLoading(true)

    if (!navigator.geolocation) {
      setLocError('Your browser does not support GPS location. Please use a modern browser.')
      setLocLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        })
        setStep(1)
        setLocLoading(false)
      },
      (err) => {
        let msg = 'Location access denied.'
        if (err.code === 1) msg = 'Location permission denied. Please allow location access in browser settings.'
        if (err.code === 2) msg = 'Location unavailable. Please try again.'
        if (err.code === 3) msg = 'Location request timed out. Please try again.'
        setLocError(msg)
        setLocLoading(false)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }

  if (todayRecord && todayRecord.status === 'PRESENT') {
    return (
      <Box sx={{ width: '100%', overflowX: 'hidden' }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} color={theme.primaryText}>
            Mark Attendance
          </Typography>
          <Typography sx={{ color: theme.secondaryText, mt: 0.5 }}>
            Track your daily attendance and center presence
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
              bgcolor: '#F8FAF8',
              borderBottom: `1px solid ${theme.borderColor}`,
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              Attendance Status
            </Typography>
            <Typography variant="body2" color={theme.secondaryText}>
              Your attendance for today has already been recorded
            </Typography>
          </Box>

          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Box
              sx={{
                width: 84,
                height: 84,
                borderRadius: '50%',
                bgcolor: theme.lightGreenBackground,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <CheckCircle sx={{ fontSize: 48, color: theme.primaryGreen }} />
            </Box>

            <Typography variant="h5" fontWeight={700} color={theme.primaryText}>
              Attendance Already Marked
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, mb: 3, color: theme.secondaryText }}>
              You are <strong>PRESENT</strong> today.
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Chip
                label={`Date: ${dayjs(todayRecord.attendanceDate).format('DD MMM YYYY')}`}
                sx={{
                  bgcolor: theme.blueBackground,
                  color: theme.blueAccent,
                  fontWeight: 600,
                }}
              />
              {todayRecord.loginTime && (
                <Chip
                  label={`Time: ${dayjs(todayRecord.loginTime).format('hh:mm A')}`}
                  sx={{
                    bgcolor: theme.lightGreenBackground,
                    color: theme.primaryGreen,
                    fontWeight: 600,
                  }}
                />
              )}
              {todayRecord.centerName && (
                <Chip
                  icon={<LocationOn />}
                  label={todayRecord.centerName}
                  sx={{
                    bgcolor: theme.lightGreenBackground,
                    color: theme.primaryGreen,
                    fontWeight: 600,
                  }}
                />
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>
    )
  }

  if (marked) {
    return (
      <Box sx={{ width: '100%', overflowX: 'hidden' }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} color={theme.primaryText}>
            Mark Attendance
          </Typography>
          <Typography sx={{ color: theme.secondaryText, mt: 0.5 }}>
            Attendance recorded successfully for today
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
              bgcolor: '#F8FAF8',
              borderBottom: `1px solid ${theme.borderColor}`,
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              Attendance Confirmed
            </Typography>
            <Typography variant="body2" color={theme.secondaryText}>
              Your presence has been marked successfully
            </Typography>
          </Box>

          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Box
              sx={{
                width: 84,
                height: 84,
                borderRadius: '50%',
                bgcolor: theme.lightGreenBackground,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <CheckCircle sx={{ fontSize: 48, color: theme.primaryGreen }} />
            </Box>

            <Typography variant="h5" fontWeight={700} color={theme.primaryText}>
              You're PRESENT Today
            </Typography>

            <Typography sx={{ mt: 1, mb: 3, color: theme.secondaryText }}>
              Attendance marked at <strong>{dayjs(marked.loginTime).format('hh:mm A')}</strong>
              {marked.centerName && ` — ${marked.centerName}`}
            </Typography>

            <Chip
              label="PRESENT"
              sx={{
                bgcolor: theme.lightGreenBackground,
                color: theme.primaryGreen,
                fontWeight: 700,
                fontSize: 14,
                px: 1.5,
              }}
            />
          </CardContent>
        </Card>
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%', overflowX: 'hidden' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} color={theme.primaryText}>
          Mark Attendance
        </Typography>
        <Typography sx={{ color: theme.secondaryText, mt: 0.5 }}>
          You must be physically present at your assigned center to mark attendance.
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Step"
            value={`${step + 1} / 3`}
            icon={<Shield />}
            bgColor="#EEF2FF"
            iconColor="#4F46E5"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Location"
            value={coords ? 'Captured' : 'Pending'}
            icon={<MyLocation />}
            bgColor={coords ? theme.lightGreenBackground : theme.blueBackground}
            iconColor={coords ? theme.primaryGreen : theme.blueAccent}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Status"
            value={todayRecord ? 'Done' : 'Ready'}
            icon={<AccessTime />}
            bgColor={theme.blueBackground}
            iconColor={theme.blueAccent}
          />
        </Grid>
      </Grid>

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
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Attendance Verification
          </Typography>
          <Typography variant="body2" color={theme.secondaryText}>
            Allow location access, verify GPS and mark attendance
          </Typography>
        </Box>

        <CardContent sx={{ p: 4 }}>
          <Stepper activeStep={step} sx={{ mb: 4 }}>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {step === 0 && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Box
                sx={{
                  width: 92,
                  height: 92,
                  borderRadius: '50%',
                  bgcolor: theme.lightGreenBackground,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <LocationOn sx={{ fontSize: 46, color: theme.primaryGreen }} />
              </Box>

              <Typography variant="h6" fontWeight={700} gutterBottom color={theme.primaryText}>
                Allow GPS Location
              </Typography>

              <Typography variant="body2" color={theme.secondaryText} sx={{ mb: 3, maxWidth: 460, mx: 'auto' }}>
                Your location will be verified against your assigned teaching center. Make sure you are physically
                at the center before proceeding.
              </Typography>

              {locError && (
                <Alert severity="error" sx={{ mb: 2, textAlign: 'left', maxWidth: 520, mx: 'auto' }}>
                  {locError}
                </Alert>
              )}

              <Button
                variant="contained"
                size="large"
                startIcon={locLoading ? <CircularProgress size={20} color="inherit" /> : <MyLocation />}
                onClick={requestLocation}
                disabled={locLoading}
                sx={{
                  px: 4,
                  py: 1.4,
                  bgcolor: theme.primaryGreen,
                  color: 'white',
                  fontWeight: 600,
                  borderRadius: 2,
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: theme.darkGreenHover,
                    boxShadow: 'none',
                  },
                }}
              >
                {locLoading ? 'Getting Location...' : 'Get My Location'}
              </Button>
            </Box>
          )}

          {step === 1 && coords && (
            <VerificationSuccessCard
              accuracy={Math.round(coords.accuracy)}
              capturedAt={dayjs().format('hh:mm A')}
              onRetry={() => {
                setStep(0)
                setCoords(null)
                setVerificationError(null)
              }}
              onMark={() => markAttendance()}
              isPending={isPending}
              coords={coords}
            />
          )}

          {step === 2 && verificationError && (
            <VerificationErrorCard
              distanceFromCenter={verificationError.distanceFromCenter}
              allowedRadius={verificationError.allowedRadius}
              centerName={verificationError.centerName}
              onRetry={() => {
                setStep(0)
                setCoords(null)
                setVerificationError(null)
              }}
            />
          )}
        </CardContent>
      </Card>
    </Box>
  )
}