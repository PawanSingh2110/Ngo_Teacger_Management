import { useEffect, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Tooltip,
} from '@mui/material'
import {
  Add,
  Edit,
  ToggleOn,
  ToggleOff,
  LocationOn,
  Delete,
} from '@mui/icons-material'
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { adminApi } from '../../services/apiServices'

function StatCard({
  label,
  value,
  color,
}) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        border: '1px solid #E8F5E9',
        boxShadow: 'none',
      }}
    >
      <CardContent>
        <Typography
          variant="body2"
          color="text.secondary"
        >
          {label}
        </Typography>

        <Typography
          variant="h4"
          fontWeight={700}
          sx={{
            color,
            mt: 1,
          }}
        >
          {value}
        </Typography>
      </CardContent>
    </Card>
  )
}

function CenterDialog({
  center,
  open,
  onClose,
  onSuccess,
}) {
  const isEdit = Boolean(center)

  const [form, setForm] = useState({
    centerName:
      center?.centerName || '',
    address:
      center?.address || '',
    latitude:
      center?.latitude || '',
    longitude:
      center?.longitude || '',
    radiusInMeters:
      center?.radiusInMeters || 300,
  })

  useEffect(() => {
    setForm({
      centerName:
        center?.centerName || '',
      address:
        center?.address || '',
      latitude:
        center?.latitude || '',
      longitude:
        center?.longitude || '',
      radiusInMeters:
        center?.radiusInMeters || 300,
    })
  }, [center, open])

  const { mutate, isPending } =
    useMutation({
      mutationFn: () =>
        isEdit
          ? adminApi.updateCenter(
              center.id,
              form
            )
          : adminApi.createCenter(
              form
            ),

      onSuccess: () => {
        toast.success(
          isEdit
            ? 'Center updated successfully'
            : 'Center created successfully'
        )

        onSuccess()
        onClose()
      },

      onError: (err) => {
        toast.error(
          err.response?.data
            ?.message || 'Failed'
        )
      },
    })

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
        },
      }}
    >
      <DialogTitle>
        {isEdit
          ? 'Edit Center'
          : 'Add New Center'}
      </DialogTitle>

      <DialogContent>
        <Grid
          container
          spacing={2}
          sx={{ mt: 0.5 }}
        >
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Center Name"
              value={form.centerName}
              onChange={(e) =>
                setForm({
                  ...form,
                  centerName:
                    e.target.value,
                })
              }
              sx={{
                '& .MuiOutlinedInput-root':
                  {
                    borderRadius: 3,
                  },
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Address"
              value={form.address}
              onChange={(e) =>
                setForm({
                  ...form,
                  address:
                    e.target.value,
                })
              }
              sx={{
                '& .MuiOutlinedInput-root':
                  {
                    borderRadius: 3,
                  },
              }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              type="number"
              label="Latitude"
              value={form.latitude}
              onChange={(e) =>
                setForm({
                  ...form,
                  latitude:
                    e.target.value,
                })
              }
              sx={{
                '& .MuiOutlinedInput-root':
                  {
                    borderRadius: 3,
                  },
              }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              type="number"
              label="Longitude"
              value={form.longitude}
              onChange={(e) =>
                setForm({
                  ...form,
                  longitude:
                    e.target.value,
                })
              }
              sx={{
                '& .MuiOutlinedInput-root':
                  {
                    borderRadius: 3,
                  },
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              type="number"
              label="Radius (meters)"
              value={
                form.radiusInMeters
              }
              helperText="Minimum 50m, Maximum 5000m"
              onChange={(e) =>
                setForm({
                  ...form,
                  radiusInMeters:
                    parseInt(
                      e.target.value
                    ) || 0,
                })
              }
              sx={{
                '& .MuiOutlinedInput-root':
                  {
                    borderRadius: 3,
                  },
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            textTransform:
              'none',
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          disabled={isPending}
          onClick={() => mutate()}
          sx={{
            bgcolor: '#2E7D32',
            borderRadius: 3,
            textTransform:
              'none',

            '&:hover': {
              bgcolor: '#1B5E20',
            },
          }}
        >
          {isPending ? (
            <CircularProgress
              size={20}
              color="inherit"
            />
          ) : isEdit ? (
            'Update'
          ) : (
            'Create'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default function AdminCenters() {
  const qc = useQueryClient()

  const [dialogOpen, setDialogOpen] =
    useState(false)

  const [editCenter, setEditCenter] =
    useState(null)

  const { data, isLoading } =
    useQuery({
      queryKey: ['admin-centers'],
      queryFn: () =>
        adminApi.getCenters(),
    })

  const {
    mutate: toggleStatus,
  } = useMutation({
    mutationFn: (id) =>
      adminApi.toggleCenter(id),

    onSuccess: () => {
      toast.success(
        'Center status updated'
      )

      qc.invalidateQueries({
        queryKey: [
          'admin-centers',
        ],
      })
    },

    onError: () => {
      toast.error(
        'Failed to update status'
      )
    },
  })

  const {
    mutate: deleteCenter,
  } = useMutation({
    mutationFn: (id) =>
      adminApi.deleteCenter(id),

    onSuccess: () => {
      toast.success(
        'Center deleted successfully'
      )

      qc.invalidateQueries({
        queryKey: [
          'admin-centers',
        ],
      })
    },

    onError: (err) => {
      toast.error(
        err.response?.data
          ?.message ||
          'Failed to delete center'
      )
    },
  })

  const centers =
    data?.data?.data || []

  const activeCenters =
    centers.filter(
      (c) => c.active
    ).length

  const inactiveCenters =
    centers.length -
    activeCenters

  const handleDeleteCenter = (
    id,
    name
  ) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${name}"?`
      )
    ) {
      deleteCenter(id)
    }
  }

  return (
    <Box sx={{ width: '100%', overflowX: 'hidden' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems: {
            xs: 'stretch',
            sm: 'center',
          },
          flexDirection: {
            xs: 'column',
            sm: 'row',
          },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={700}
            color="#1F2937"
          >
            Teaching Centers
          </Typography>

          <Typography
            sx={{
              color: '#6B7280',
              mt: 0.5,
            }}
          >
            Manage teaching center
            locations and attendance
            zones
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setEditCenter(null)
            setDialogOpen(true)
          }}
          sx={{
            bgcolor: '#2E7D32',
            borderRadius: 3,
            textTransform: 'none',
            width: {
              xs: '100%',
              sm: 'auto',
            },

            '&:hover': {
              bgcolor:
                '#1B5E20',
            },
          }}
        >
          Add Center
        </Button>
      </Box>

      {/* Stats */}
      <Grid
        container
        spacing={3}
        sx={{ mb: 4 }}
      >
        <Grid
          item
          xs={12}
          md={4}
        >
          <StatCard
            label="Total Centers"
            value={centers.length}
            color="#1F2937"
          />
        </Grid>

        <Grid
          item
          xs={12}
          md={4}
        >
          <StatCard
            label="Active Centers"
            value={activeCenters}
            color="#2E7D32"
          />
        </Grid>

        <Grid
          item
          xs={12}
          md={4}
        >
          <StatCard
            label="Inactive Centers"
            value={inactiveCenters}
            color="#DC2626"
          />
        </Grid>
      </Grid>

      {/* Table */}
      <Card
        sx={{
          borderRadius: 4,
          border:
            '1px solid #E8F5E9',
          overflow: 'hidden',
          boxShadow: 'none',
        }}
      >
        <TableContainer
          sx={{
            height: 500,
            maxHeight: {
              xs: '68vh',
              md: 500,
            },
            overflow: 'auto',

            '&::-webkit-scrollbar':
              {
              width: 8,
              height: 8,
              },

            '&::-webkit-scrollbar-thumb':
              {
                backgroundColor:
                  '#C8E6C9',
                borderRadius: 10,
              },
          }}
        >
          <Table stickyHeader sx={{ minWidth: { xs: 820, md: 980 } }}>
            <TableHead>
              <TableRow
                sx={{
                  '& th': {
                    fontWeight: 700,
                    bgcolor:
                      '#F1F8F4',
                    color:
                      '#1F2937',
                  },
                }}
              >
                <TableCell>
                  #
                </TableCell>
                <TableCell>
                  Center Name
                </TableCell>
                <TableCell>
                  Address
                </TableCell>
                <TableCell>
                  Coordinates
                </TableCell>
                <TableCell>
                  Radius
                </TableCell>
                <TableCell>
                  Status
                </TableCell>
                <TableCell align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    align="center"
                    sx={{
                      py: 8,
                    }}
                  >
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              )}

              {centers.map(
                (c, i) => (
                  <TableRow
                    key={c.id}
                    hover
                    sx={{
                      bgcolor:
                        i % 2 ===
                        0
                          ? '#FFFFFF'
                          : '#FAFAFA',

                      '& td': {
                        py: 1.5,
                      },
                    }}
                  >
                    <TableCell>
                      {i + 1}
                    </TableCell>

                    <TableCell>
                      <Box
                        sx={{
                          display:
                            'flex',
                          alignItems:
                            'center',
                          gap: 1,
                        }}
                      >
                        <LocationOn
                          sx={{
                            color:
                              '#2E7D32',
                          }}
                          fontSize="small"
                        />

                        <Typography
                          fontWeight={
                            600
                          }
                          color="#1F2937"
                        >
                          {
                            c.centerName
                          }
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell
                      sx={{
                        maxWidth: 250,
                      }}
                    >
                      <Typography
                        noWrap
                        variant="body2"
                      >
                        {c.address ||
                          '—'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="caption">
                        {Number(
                          c.latitude
                        ).toFixed(
                          4
                        )}
                        ,
                        {' '}
                        {Number(
                          c.longitude
                        ).toFixed(
                          4
                        )}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={`${c.radiusInMeters}m`}
                        size="small"
                        sx={{
                          bgcolor:
                            '#E8F5E9',
                          color:
                            '#2E7D32',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={
                          c.active
                            ? 'Active'
                            : 'Inactive'
                        }
                        size="small"
                        sx={{
                          fontWeight: 600,

                          bgcolor:
                            c.active
                              ? '#E8F5E9'
                              : '#F3F4F6',

                          color:
                            c.active
                              ? '#2E7D32'
                              : '#6B7280',
                        }}
                      />
                    </TableCell>

                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          sx={{
                            color:
                              '#2563EB',
                          }}
                          onClick={() => {
                            setEditCenter(
                              c
                            )
                            setDialogOpen(
                              true
                            )
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip
                        title={
                          c.active
                            ? 'Deactivate'
                            : 'Activate'
                        }
                      >
                        <IconButton
                          size="small"
                          sx={{
                            color:
                              c.active
                                ? '#DC2626'
                                : '#2E7D32',
                          }}
                          onClick={() =>
                            toggleStatus(
                              c.id
                            )
                          }
                        >
                          {c.active ? (
                            <ToggleOff fontSize="small" />
                          ) : (
                            <ToggleOn fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          sx={{
                            color:
                              '#DC2626',
                          }}
                          onClick={() =>
                            handleDeleteCenter(
                              c.id,
                              c.centerName
                            )
                          }
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <CenterDialog
        center={editCenter}
        open={dialogOpen}
        onClose={() =>
          setDialogOpen(false)
        }
        onSuccess={() =>
          qc.invalidateQueries({
            queryKey: [
              'admin-centers',
            ],
          })
        }
      />
    </Box>
  )
}
