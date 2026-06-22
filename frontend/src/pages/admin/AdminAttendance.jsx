import { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  CircularProgress,
  Alert,
  Autocomplete,
  Avatar,
} from '@mui/material'
import { FileDownload, FilterList, People, CheckCircle, Cancel, Search } from '@mui/icons-material'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'
import { adminApi } from '../../services/apiServices'

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
}

function StatCard({ title, value, icon, bgColor, iconColor }) {
  return (
    <Card
      sx={{
        borderRadius: 4,
        border: `1px solid ${theme.borderColor}`,
        boxShadow: 'none',
        height: '100%',
      }}
    >
      <CardContent
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 3,
          '&:last-child': { pb: 3 },
        }}
      >
        <Avatar
          sx={{
            bgcolor: bgColor,
            color: iconColor,
            width: 52,
            height: 52,
          }}
        >
          {icon}
        </Avatar>

        <Box>
          <Typography variant="body2" sx={{ color: theme.secondaryText }}>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={700} color={theme.primaryText}>
            {value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default function AdminAttendance() {
  const [filters, setFilters] = useState({
    teacherId: '',
    centerId: '',
    shiftId: '',
    status: '',
    fromDate: '',
    toDate: '',
    month: '',
    year: '',
  })
  const [applied, setApplied] = useState({})
  const [page, setPage] = useState(1)

  const { data: centersData } = useQuery({
    queryKey: ['centers-list'],
    queryFn: () => adminApi.getCenters(),
  })

  const { data: teachersData } = useQuery({
    queryKey: ['teachers-list-all'],
    queryFn: () => adminApi.getTeachers({ size: 200 }),
  })

  const { data: shiftsData } = useQuery({
    queryKey: ['shifts-list'],
    queryFn: () => adminApi.getShifts(),
  })

  const centers = centersData?.data?.data || []
  const teachers = teachersData?.data?.data?.content || []
  const shifts = shiftsData?.data?.data || []

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-attendance', applied, page],
    queryFn: () =>
      adminApi.getAttendance({
        ...Object.fromEntries(Object.entries(applied).filter(([, v]) => v !== '')),
        page: page - 1,
        size: 20,
      }),
  })

  const records = data?.data?.data?.content || []
  const totalPages = data?.data?.data?.totalPages || 1
  const totalElements = data?.data?.data?.totalElements || 0

  const { mutate: exportExcel, isPending: exporting } = useMutation({
    mutationFn: () =>
      adminApi.exportAttendance(Object.fromEntries(Object.entries(applied).filter(([, v]) => v !== ''))),
    onSuccess: (res) => {
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `attendance_${dayjs().format('YYYY-MM-DD')}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Excel downloaded!')
    },
    onError: () => toast.error('Export failed'),
  })

  const applyFilters = () => {
    setApplied({ ...filters })
    setPage(1)
  }

  const clearFilters = () => {
    setFilters({
      teacherId: '',
      centerId: '',
      shiftId: '',
      status: '',
      fromDate: '',
      toDate: '',
      month: '',
      year: '',
    })
    setApplied({})
    setPage(1)
  }

  // const totalRecords = totalElements
  // const presentRecords = records.filter((r) => r.status === 'PRESENT').length
  // const absentRecords = records.filter((r) => r.status === 'ABSENT').length
  // const showingResults = records.length

  return (
    <Box sx={{ width: '100%', overflowX: 'hidden' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          p: 2.5,
          borderRadius: 3,
          bgcolor: theme.lightGreenBackground,
          border: `1px solid ${theme.borderColor}`,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: theme.primaryText, mb: 0.5 }}>
            Attendance Records
          </Typography>
          <Typography variant="body2" sx={{ color: theme.secondaryText }}>
            Track attendance, filter records and export reports
          </Typography>
        </Box>
        <Button
          startIcon={<FileDownload />}
          variant="contained"
          color="success"
          onClick={() => exportExcel()}
          disabled={exporting}
          sx={{
            bgcolor: theme.primaryGreen,
            color: 'white',
            fontWeight: 600,
            px: 3,
            py: 1.2,
            borderRadius: 2,
            boxShadow: 'none',
            '&:hover': {
              bgcolor: theme.darkGreenHover,
              boxShadow: 'none',
            },
          }}
        >
          {exporting ? 'Exporting...' : 'Export Excel'}
        </Button>
      </Box>
{/* 
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Records"
            value={totalRecords}
            icon={<People fontSize="small" />}
            bgColor="#EEF2FF"
            iconColor="#4F46E5"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Present"
            value={presentRecords}
            icon={<CheckCircle fontSize="small" />}
            bgColor="#E8F5E9"
            iconColor="#2E7D32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Absent"
            value={absentRecords}
            icon={<Cancel fontSize="small" />}
            bgColor="#FEE2E2"
            iconColor="#DC2626"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Showing Results"
            value={showingResults}
            icon={<Search fontSize="small" />}
            bgColor="#EFF6FF"
            iconColor="#2563EB"
          />
        </Grid>
      </Grid> */}

      <Card
        sx={{
          mb: 3,
          borderRadius: 4,
          border: `1px solid ${theme.borderColor}`,
          boxShadow: 'none',
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 0.5, color: theme.primaryText }}
          >
            <FilterList fontSize="small" /> Filters
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Autocomplete
                size="small"
                options={teachers}
                value={teachers.find((t) => t.id === filters.teacherId) || null}
                getOptionLabel={(option) => option?.fullName || ''}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onChange={(_, teacher) => setFilters({ ...filters, teacherId: teacher?.id || '' })}
                renderInput={(params) => <TextField {...params} label="Teacher" placeholder="All Teachers" />}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Autocomplete
                size="small"
                options={centers}
                value={centers.find((c) => c.id === filters.centerId) || null}
                getOptionLabel={(option) => option?.centerName || ''}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onChange={(_, center) => setFilters({ ...filters, centerId: center?.id || '' })}
                renderInput={(params) => <TextField {...params} label="Center" placeholder="All Centers" />}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Shift</InputLabel>
                <Select
                  value={filters.shiftId}
                  label="Shift"
                  onChange={(e) => setFilters({ ...filters, shiftId: e.target.value })}
                >
                  <MenuItem value="">All Shifts</MenuItem>
                  {shifts.map((shift) => (
                    <MenuItem key={shift.id} value={shift.id}>
                      {shift.shiftName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="PRESENT">Present</MenuItem>
                  <MenuItem value="ABSENT">Absent</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                size="small"
                label="From Date"
                type="date"
                value={filters.fromDate}
                onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                size="small"
                label="To Date"
                type="date"
                value={filters.toDate}
                onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Month</InputLabel>
                <Select value={filters.month} label="Month" onChange={(e) => setFilters({ ...filters, month: e.target.value })}>
                  <MenuItem value="">Any</MenuItem>
                  {Array.from({ length: 12 }, (_, i) => (
                    <MenuItem key={i + 1} value={i + 1}>
                      {dayjs().month(i).format('MMMM')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Year"
                type="number"
                value={filters.year}
                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                placeholder="2026"
              />
            </Grid>

            <Grid item xs={12} sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <Button
                onClick={clearFilters}
                variant="outlined"
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
                Clear
              </Button>
              <Button
                onClick={applyFilters}
                variant="contained"
                sx={{
                  bgcolor: theme.primaryGreen,
                  color: 'white',
                  fontWeight: 600,
                  '&:hover': { bgcolor: theme.darkGreenHover },
                }}
              >
                Apply
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

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
            borderBottom: `1px solid ${theme.borderColor}`,
            bgcolor: '#F8FAF8',
          }}
        >
          <Typography variant="h6" fontWeight={600} color={theme.primaryText}>
            Attendance Directory
          </Typography>
          <Typography variant="body2" color={theme.secondaryText}>
            Manage and review attendance records
          </Typography>
        </Box>

        <TableContainer
          sx={{
            height: 500,
            maxHeight: 500,
            overflowY: 'auto',
            overflowX: 'auto',
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#F1F8F4',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: theme.primaryGreen,
              borderRadius: '8px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              backgroundColor: theme.darkGreenHover,
            },
          }}
        >
          <Table stickyHeader sx={{ minWidth: 1650 }}>
            <TableHead>
              <TableRow
                sx={{
                  '& th': {
                    fontWeight: 700,
                    bgcolor: theme.tableHeaderBackground,
                    color: theme.primaryText,
                    borderBottom: `1px solid ${theme.borderColor}`,
                    py: 1.5,
                  },
                }}
              >
                <TableCell width={60}>#</TableCell>
                <TableCell width={260}>Teacher</TableCell>
                <TableCell width={170}>Shift</TableCell>
                <TableCell width={220}>Center</TableCell>
                <TableCell width={180}>Date</TableCell>
                <TableCell width={160}>Login Time</TableCell>
                <TableCell width={160}>Logout Time</TableCell>
                <TableCell width={150}>Punctuality</TableCell>
                <TableCell width={190}>Logout Location</TableCell>
                <TableCell width={120}>Status</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={28} sx={{ color: theme.primaryGreen }} />
                  </TableCell>
                </TableRow>
              )}

              {error && (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                    <Alert severity="error" sx={{ display: 'inline-flex' }}>
                      {error.response?.data?.message || error.message || 'Failed to load attendance records'}
                    </Alert>
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && !error && records.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No records found. Adjust filters.</Typography>
                  </TableCell>
                </TableRow>
              )}

              {records.map((r, i) => (
                <TableRow
                  key={r.id}
                  hover
                  sx={{
                    backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                    '&:hover': {
                      backgroundColor: theme.lightGreenBackground,
                    },
                  }}
                >
                  <TableCell>{(page - 1) * 20 + i + 1}</TableCell>
                  <TableCell>
                    <Typography fontWeight={600} color={theme.primaryText}>
                      {r.teacherName}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: theme.primaryText }}>{r.shiftName || '-'}</TableCell>
                  <TableCell sx={{ color: theme.primaryText }}>{r.centerName || '—'}</TableCell>
                  <TableCell sx={{ color: theme.primaryText }}>
                    {r.attendanceDate ? dayjs(r.attendanceDate).format('DD MMM YYYY') : '—'}
                  </TableCell>
                  <TableCell sx={{ color: theme.primaryText }}>
                    {r.loginTime ? dayjs(r.loginTime).format('hh:mm A') : '—'}
                  </TableCell>
                  <TableCell sx={{ color: theme.primaryText }}>
                    {r.logoutTime ? dayjs(r.logoutTime).format('hh:mm A') : '—'}
                  </TableCell>
                  <TableCell>
                    {r.status === 'PRESENT' ? (
                      <Chip
                        label={r.late ? `Late by ${r.lateByMinutes || 0} min` : 'On time'}
                        size="small"
                        sx={{
                          bgcolor: r.late ? '#FFF7ED' : theme.lightGreenBackground,
                          color: r.late ? '#C2410C' : theme.primaryGreen,
                          fontWeight: 600,
                        }}
                      />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        r.logoutWithinRadius == null
                          ? 'Not marked'
                          : r.logoutWithinRadius
                            ? 'Inside radius'
                            : 'Outside radius'
                      }
                      size="small"
                      sx={{
                        backgroundColor:
                          r.logoutWithinRadius == null
                            ? theme.grayBackground
                            : r.logoutWithinRadius
                              ? theme.lightGreenBackground
                              : theme.redBackground,
                        color:
                          r.logoutWithinRadius == null
                            ? theme.secondaryText
                            : r.logoutWithinRadius
                              ? theme.primaryGreen
                              : theme.redAccent,
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={r.status}
                      size="small"
                      sx={{
                        backgroundColor: r.status === 'PRESENT' ? theme.lightGreenBackground : theme.redBackground,
                        color: r.status === 'PRESENT' ? theme.primaryGreen : theme.redAccent,
                        fontWeight: 600,
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
              color="primary"
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: 2,
                  color: theme.primaryText,
                },
                '& .MuiPaginationItem-selected': {
                  backgroundColor: theme.primaryGreen,
                  color: 'white',
                  fontWeight: 600,
                },
                '& .MuiPaginationItem-root:hover': {
                  backgroundColor: theme.lightGreenBackground,
                },
              }}
            />
          </Box>
        )}
      </Card>
    </Box>
  )
}
