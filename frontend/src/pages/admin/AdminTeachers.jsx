import { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Chip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  CircularProgress,
  Tooltip,
  Avatar,
} from '@mui/material'
import {
  Add,
  Edit,
  ToggleOn,
  ToggleOff,
  Search,
  Delete,
  LockReset,
  People,
  CheckCircle,
  Cancel,
} from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { adminApi } from '../../services/apiServices'
import TeacherForm from '../../components/admin/TeacherForm'

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

export default function AdminTeachers() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTeacher, setEditTeacher] = useState(null)
  const [resetTeacher, setResetTeacher] = useState(null)
  const [resetPassword, setResetPassword] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-teachers', page, searchInput, statusFilter],
    queryFn: () =>
      adminApi.getTeachers({
        page: page - 1,
        size: 15,
        search: searchInput || undefined,
        active: statusFilter === '' ? undefined : statusFilter === 'active',
      }),
  })

  const { mutate: toggleStatus } = useMutation({
    mutationFn: (id) => adminApi.toggleTeacher(id),
    onSuccess: () => {
      toast.success('Teacher status updated')
      qc.invalidateQueries({ queryKey: ['admin-teachers'] })
    },
    onError: () => toast.error('Failed to update status'),
  })

  const { mutate: deleteTeacher } = useMutation({
    mutationFn: (id) => adminApi.deleteTeacher(id),
    onSuccess: () => {
      toast.success('Teacher deleted successfully')
      qc.invalidateQueries({ queryKey: ['admin-teachers'] })
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete teacher'),
  })

  const { mutate: resetTeacherPassword, isPending: resetPending } = useMutation({
    mutationFn: () => adminApi.resetTeacherPassword(resetTeacher.id, { newPassword: resetPassword }),
    onSuccess: () => {
      toast.success('Teacher password updated')
      setResetTeacher(null)
      setResetPassword('')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update password'),
  })

  const handleDeleteTeacher = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      deleteTeacher(id)
    }
  }

  const teachers = data?.data?.data?.content || []
  const totalPages = data?.data?.data?.totalPages || 1
  const totalElements = data?.data?.data?.totalElements || 0

  const totalTeachers = totalElements
  const activeTeachers = teachers.filter((t) => t.active).length
  const inactiveTeachers = teachers.filter((t) => !t.active).length
  const showingResults = teachers.length

  const handleSearch = (value) => {
    setSearchInput(value)
    setPage(1)
  }

  const handleClearFilters = () => {
    setSearchInput('')
    setStatusFilter('')
    setPage(1)
  }

  const openCreate = () => {
    setEditTeacher(null)
    setDialogOpen(true)
  }

  const openEdit = (teacher) => {
    setEditTeacher(teacher)
    setDialogOpen(true)
  }

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
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: theme.primaryText,
              mb: 0.5,
            }}
          >
            Teachers
          </Typography>
          <Typography variant="body2" sx={{ color: theme.secondaryText }}>
            Manage teachers, shifts, center assignments and program allocations
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={openCreate}
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
          Add Teacher
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Teachers"
            value={totalTeachers}
            icon={<People fontSize="small" />}
            bgColor="#EEF2FF"
            iconColor="#4F46E5"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Teachers"
            value={activeTeachers}
            icon={<CheckCircle fontSize="small" />}
            bgColor="#E8F5E9"
            iconColor="#2E7D32"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Inactive Teachers"
            value={inactiveTeachers}
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
      </Grid>

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
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                placeholder="Search by name, email or phone..."
                value={searchInput}
                onChange={(e) => handleSearch(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: theme.secondaryText }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: 'white',
                    '& fieldset': {
                      border: `1px solid ${theme.borderColor}`,
                    },
                    '&:hover fieldset': {
                      border: `1px solid ${theme.primaryGreen}`,
                    },
                    '&.Mui-focused fieldset': {
                      border: `1px solid ${theme.primaryGreen}`,
                    },
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ color: theme.secondaryText }}>Filter by Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setPage(1)
                  }}
                  label="Filter by Status"
                  sx={{
                    borderRadius: 3,
                    backgroundColor: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: `1px solid ${theme.borderColor}`,
                    },
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {(searchInput || statusFilter) && (
              <Grid item xs={12}>
                <Button
                  size="small"
                  onClick={handleClearFilters}
                  sx={{
                    color: theme.secondaryText,
                    fontWeight: 600,
                    p: 0,
                    '&:hover': { color: theme.primaryGreen },
                  }}
                >
                  Clear Filters
                </Button>
              </Grid>
            )}
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
            Teacher Directory
          </Typography>
          <Typography variant="body2" color={theme.secondaryText}>
            Manage all teachers and assignments
          </Typography>
        </Box>

        <TableContainer
          sx={{
            height: 600,
            maxHeight: 600,
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
          <Table stickyHeader sx={{ minWidth: 1350 }}>
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
                <TableCell width={280}>Teacher</TableCell>
                <TableCell width={160}>Phone</TableCell>
                <TableCell width={180}>Shift</TableCell>
                <TableCell width={250}>Centers</TableCell>
                <TableCell width={250}>Programs</TableCell>
                <TableCell width={120}>Status</TableCell>
                <TableCell width={170} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {error && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Box sx={{ color: theme.redAccent }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        Error loading teachers
                      </Typography>
                      <Typography variant="caption">{error?.message || 'Unknown error'}</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}

              {isLoading && !error && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={28} sx={{ color: theme.primaryGreen }} />
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && !error && teachers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4, color: theme.secondaryText }}>
                    <Box>
                      <Typography sx={{ fontWeight: 600 }}>No teachers found.</Typography>
                      <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                        {data && `Total: ${totalElements} teachers in database`}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}

              {teachers.map((t, i) => (
                <TableRow
                  key={t.id}
                  hover
                  sx={{
                    backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                    '&:hover': {
                      backgroundColor: theme.lightGreenBackground,
                    },
                  }}
                >
                  <TableCell>{(page - 1) * 15 + i + 1}</TableCell>

                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          fontSize: 14,
                          bgcolor: theme.lightGreenBackground,
                          color: theme.primaryGreen,
                          fontWeight: 700,
                        }}
                      >
                        {t.fullName?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600} sx={{ color: theme.primaryText }}>
                          {t.fullName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.secondaryText }}>
                          {t.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell sx={{ color: theme.primaryText }}>{t.phoneNumber || '—'}</TableCell>

                  <TableCell>
                    {t.shift ? (
                      <Chip
                        label={`${t.shift.shiftName} (${t.shift.startTime?.slice(0, 5)}-${t.shift.endTime?.slice(0, 5)})`}
                        size="small"
                        sx={{
                          backgroundColor: '#FFF7ED',
                          color: '#C2410C',
                          fontWeight: 500,
                        }}
                      />
                    ) : (
                      <Typography variant="caption" sx={{ color: theme.secondaryText }}>
                        None
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell>
                    {t.centers?.length > 0 ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                        {t.centers.map((c) => (
                          <Chip
                            key={c.id}
                            label={c.centerName}
                            size="small"
                            sx={{
                              backgroundColor: theme.lightGreenBackground,
                              color: theme.primaryGreen,
                              fontWeight: 500,
                              '& .MuiChip-label': {
                                fontWeight: 500,
                              },
                            }}
                          />
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="caption" sx={{ color: theme.secondaryText }}>
                        None
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell>
                    {t.programs?.length > 0 ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                        {t.programs.map((p) => (
                          <Chip
                            key={p.id}
                            label={p.programName}
                            size="small"
                            sx={{
                              backgroundColor: theme.blueBackground,
                              color: theme.blueAccent,
                              fontWeight: 500,
                              '& .MuiChip-label': {
                                fontWeight: 500,
                              },
                            }}
                          />
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="caption" sx={{ color: theme.secondaryText }}>
                        None
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={t.active ? 'Active' : 'Inactive'}
                      size="small"
                      sx={{
                        backgroundColor: t.active ? theme.lightGreenBackground : theme.grayBackground,
                        color: t.active ? theme.primaryGreen : theme.secondaryText,
                        fontWeight: 600,
                        '& .MuiChip-label': {
                          fontWeight: 600,
                        },
                      }}
                    />
                  </TableCell>

                  <TableCell align="center">
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => openEdit(t)}
                        sx={{
                          color: theme.blueAccent,
                          '&:hover': {
                            backgroundColor: theme.blueBackground,
                          },
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title={t.active ? 'Deactivate' : 'Activate'}>
                      <IconButton
                        size="small"
                        onClick={() => toggleStatus(t.id)}
                        sx={{
                          color: t.active ? theme.primaryGreen : theme.redAccent,
                          '&:hover': {
                            backgroundColor: t.active ? theme.lightGreenBackground : '#FEF2F2',
                          },
                        }}
                      >
                        {t.active ? <ToggleOff fontSize="small" /> : <ToggleOn fontSize="small" />}
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Reset Password">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setResetTeacher(t)
                          setResetPassword('')
                        }}
                        sx={{
                          color: theme.primaryGreen,
                          '&:hover': {
                            backgroundColor: theme.lightGreenBackground,
                          },
                        }}
                      >
                        <LockReset fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteTeacher(t.id, t.fullName)}
                        sx={{
                          color: theme.redAccent,
                          '&:hover': {
                            backgroundColor: '#FEF2F2',
                          },
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
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

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 4,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: theme.primaryText }}>
          {editTeacher ? 'Edit Teacher' : 'Add New Teacher'}
        </DialogTitle>
        <TeacherForm
          teacher={editTeacher}
          onSuccess={() => {
            setDialogOpen(false)
            qc.invalidateQueries({ queryKey: ['admin-teachers'] })
          }}
          onCancel={() => setDialogOpen(false)}
        />
      </Dialog>

      <Dialog
        open={Boolean(resetTeacher)}
        onClose={() => {
          setResetTeacher(null)
          setResetPassword('')
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, color: theme.primaryText }}>
          Reset Teacher Password
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: theme.secondaryText, mb: 2 }}>
            Set a new password for {resetTeacher?.fullName}.
          </Typography>
          <TextField
            fullWidth
            label="New Password"
            type="password"
            value={resetPassword}
            onChange={(e) => setResetPassword(e.target.value)}
            helperText="Minimum 6 characters"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => {
              setResetTeacher(null)
              setResetPassword('')
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => resetTeacherPassword()}
            disabled={resetPending || resetPassword.length < 6}
            startIcon={resetPending ? <CircularProgress size={14} color="inherit" /> : <LockReset />}
          >
            Update Password
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
