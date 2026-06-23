import { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Chip,
  Pagination,
  CircularProgress,
  Grid,
} from '@mui/material'
import { CalendarMonth, CheckCircle, Cancel } from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { teacherApi } from '../../services/apiServices'
import dayjs from 'dayjs'

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
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
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

export default function AttendanceHistory() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['teacher-history', page],
    queryFn: () => teacherApi.getHistory(page - 1, 20),
  })

  const records = data?.data?.data?.content || []
  const totalPages = data?.data?.data?.totalPages || 1
  const total = data?.data?.data?.totalElements || 0

  const presentCount = records.filter((r) => r.status === 'PRESENT').length
  const absentCount = records.filter((r) => r.status === 'ABSENT').length

  return (
    <Box sx={{ width: '100%', overflowX: 'hidden' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} color="#1F2937" sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
          Attendance History
        </Typography>

        <Typography
          sx={{
            color: '#6B7280',
            mt: 0.5,
          }}
        >
          Track your attendance records and teaching activity
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total Records"
            value={total}
            icon={<CalendarMonth />}
            bgColor="#EFF6FF"
            iconColor="#2563EB"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <StatCard
            title="Present"
            value={presentCount}
            icon={<CheckCircle />}
            bgColor="#E8F5E9"
            iconColor="#2E7D32"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <StatCard
            title="Absent"
            value={absentCount}
            icon={<Cancel />}
            bgColor="#FEE2E2"
            iconColor="#DC2626"
          />
        </Grid>
      </Grid>

      <Card
        sx={{
          borderRadius: 4,
          border: '1px solid #E8F5E9',
          overflow: 'hidden',
          boxShadow: 'none',
        }}
      >
        <Box
          sx={{
            px: 3,
            py: 2,
            bgcolor: '#F8FAF8',
            borderBottom: '1px solid #E8F5E9',
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Attendance Records
          </Typography>

          <Typography variant="body2" color="text.secondary">
            View all attendance history
          </Typography>
        </Box>

        <TableContainer
          sx={{
            height: 550,
            maxHeight: { xs: '68vh', md: 550 },
            overflow: 'auto',
          }}
        >
          <Table stickyHeader sx={{ minWidth: { xs: 900, md: 1080 } }}>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: '#F1F8F4' } }}>
                <TableCell>#</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Day</TableCell>
                <TableCell>Center</TableCell>
                <TableCell>Login Time</TableCell>
                <TableCell>Logout Time</TableCell>
                <TableCell>Shift</TableCell>
                <TableCell>Punctuality</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && records.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No attendance records found.
                  </TableCell>
                </TableRow>
              )}

              {records.map((r, i) => (
                <TableRow
                  key={r.id}
                  hover
                  sx={{
                    bgcolor: i % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                  }}
                >
                  <TableCell>{(page - 1) * 20 + i + 1}</TableCell>
                  <TableCell>
                    <Typography fontWeight={600}>
                      {r.attendanceDate ? dayjs(r.attendanceDate).format('DD MMM YYYY') : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>
                    {r.attendanceDate ? dayjs(r.attendanceDate).format('dddd') : '—'}
                  </TableCell>
                  <TableCell>{r.centerName || '—'}</TableCell>
                  <TableCell>{r.loginTime ? dayjs(r.loginTime).format('hh:mm A') : '—'}</TableCell>
                  <TableCell>{r.logoutTime ? dayjs(r.logoutTime).format('hh:mm A') : '—'}</TableCell>
                  <TableCell>
                    {r.shiftName || '-'}
                  </TableCell>
                  <TableCell>
                    {r.status === 'PRESENT' ? (
                      <Chip
                        label={r.late ? `Late by ${r.lateByMinutes || 0} min` : 'On time'}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          bgcolor: r.late ? '#FFF7ED' : '#E8F5E9',
                          color: r.late ? '#C2410C' : '#2E7D32',
                        }}
                      />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={r.status}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        bgcolor: r.status === 'PRESENT' ? '#E8F5E9' : '#FEE2E2',
                        color: r.status === 'PRESENT' ? '#2E7D32' : '#DC2626',
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, v) => setPage(v)}
              sx={{
                '& .Mui-selected': {
                  bgcolor: '#2E7D32 !important',
                  color: '#fff',
                },
              }}
            />
          </Box>
        )}
      </Card>
    </Box>
  )
}
