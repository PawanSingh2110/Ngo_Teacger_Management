import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  CircularProgress,
  Avatar,
  Divider,
  LinearProgress,
} from '@mui/material'
import {
  CheckCircle,
  Cancel,
  CalendarMonth,
  AccessTime,
} from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { teacherApi } from '../../services/apiServices'
import dayjs from 'dayjs'

function StatCard({ icon, label, value, color }) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: 'none',
        border: '1px solid #E5E7EB',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: `${color}.light`,
              color: `${color}.main`,
              width: 52,
              height: 52,
            }}
          >
            {icon}
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              {value ?? '—'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default function TeacherDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['teacher-dashboard'],
    queryFn: () => teacherApi.getDashboard(),
    refetchInterval: 30000,
  })

  const dashboard = data?.data?.data

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    )
  }

  const isPresent = dashboard?.todayStatus === 'PRESENT'
  const isAbsent = dashboard?.todayStatus === 'ABSENT'

  const bannerBg =
    isPresent ? 'success.light' : isAbsent ? 'error.light' : 'warning.light'
  const bannerBorder =
    isPresent ? 'success.main' : isAbsent ? 'error.main' : 'warning.main'
  const bannerIcon = isPresent ? (
    <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />
  ) : isAbsent ? (
    <Cancel sx={{ fontSize: 40, color: 'error.main' }} />
  ) : (
    <AccessTime sx={{ fontSize: 40, color: 'warning.main' }} />
  )

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', width: '100%', overflowX: 'hidden' }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
          My Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {dayjs().format('dddd, MMMM D, YYYY')}
        </Typography>
      </Box>

      {/* Today Status Banner */}
      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          bgcolor: bannerBg,
          border: '1px solid',
          borderColor: bannerBorder,
          boxShadow: 'none',
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
            {bannerIcon}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h6" fontWeight={700}>
                {isPresent
                  ? 'Present Today ✓'
                  : isAbsent
                  ? 'Absent Today'
                  : 'Attendance Not Marked Yet'}
              </Typography>
              <Typography variant="body2">
                {isPresent && dashboard?.todayLoginTime
                  ? `Marked at ${dayjs(dashboard.todayLoginTime).format('hh:mm A')}`
                  : isAbsent
                  ? 'You were marked absent for today.'
                  : 'Go to “Mark Attendance” to mark your presence.'}
              </Typography>
            </Box>
            {dashboard?.todayStatus && (
              <Chip
                label={dashboard.todayStatus}
                color={isPresent ? 'success' : isAbsent ? 'error' : 'warning'}
                sx={{ fontWeight: 700 }}
              />
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <StatCard
            icon={<CheckCircle />}
            label="Total Present (All Time)"
            value={dashboard?.totalPresent}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StatCard
            icon={<Cancel />}
            label="Total Absent (All Time)"
            value={dashboard?.totalAbsent}
            color="error"
          />
        </Grid>
      </Grid>

      {/* Monthly Summary */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: 'none',
          border: '1px solid #E5E7EB',
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 1,
            }}
          >
            <CalendarMonth />
            <Typography variant="h6" fontWeight={600}>
              Monthly Summary
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />

          {(!dashboard?.recentMonthlySummary ||
            dashboard.recentMonthlySummary.length === 0) && (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
              No attendance data yet.
            </Typography>
          )}

          {dashboard?.recentMonthlySummary?.length > 0 && (
            <Box
              sx={{
                maxHeight: 500,
                overflowY: 'auto',
                pr: 1,
              }}
            >
              {dashboard.recentMonthlySummary.map((month) => {
                const total = month.presentCount + month.absentCount
                const pct = total > 0 ? Math.round((month.presentCount / total) * 100) : 0
                const barColor =
                  pct >= 75 ? 'success' : pct >= 50 ? 'warning' : 'error'

                return (
                  <Box
                    key={`${month.year}-${month.month}`}
                    sx={{ mb: 3, '&:last-of-type': { mb: 0 } }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 0.5,
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight={600}>
                        {month.monthName} {month.year}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Chip
                          label={`✓ ${month.presentCount}`}
                          size="small"
                          color="success"
                        />
                        <Chip
                          label={`✗ ${month.absentCount}`}
                          size="small"
                          color="error"
                        />
                        <Chip
                          label={`${pct}%`}
                          size="small"
                          color={barColor}
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      color={barColor}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                )
              })}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
