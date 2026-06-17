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

function ProgramDialog({
  program,
  open,
  onClose,
  onSuccess,
}) {
  const isEdit = Boolean(program)

  const [form, setForm] = useState({
    programName:
      program?.programName || '',
    description:
      program?.description || '',
  })

  useEffect(() => {
    setForm({
      programName:
        program?.programName || '',
      description:
        program?.description || '',
    })
  }, [program, open])

  const { mutate, isPending } =
    useMutation({
      mutationFn: () =>
        isEdit
          ? adminApi.updateProgram(
              program.id,
              form
            )
          : adminApi.createProgram(
              form
            ),

      onSuccess: () => {
        toast.success(
          isEdit
            ? 'Program updated successfully'
            : 'Program created successfully'
        )

        onSuccess()
        onClose()
      },

      onError: (err) =>
        toast.error(
          err.response?.data
            ?.message || 'Failed'
        ),
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
          ? 'Edit Program'
          : 'Add Program'}
      </DialogTitle>

      <DialogContent>
        <TextField
          fullWidth
          label="Program Name"
          value={form.programName}
          onChange={(e) =>
            setForm({
              ...form,
              programName:
                e.target.value,
            })
          }
          sx={{
            mt: 1,
            mb: 2,

            '& .MuiOutlinedInput-root':
              {
                borderRadius: 3,
              },
          }}
        />

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Description"
          value={form.description}
          onChange={(e) =>
            setForm({
              ...form,
              description:
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

export default function AdminPrograms() {
  const qc = useQueryClient()

  const [open, setOpen] =
    useState(false)

  const [edit, setEdit] =
    useState(null)

  const { data, isLoading } =
    useQuery({
      queryKey: ['admin-programs'],
      queryFn: () =>
        adminApi.getPrograms(),
    })

  const {
    mutate: toggleStatus,
  } = useMutation({
    mutationFn: (id) =>
      adminApi.toggleProgram(id),

    onSuccess: () => {
      toast.success(
        'Status updated'
      )

      qc.invalidateQueries({
        queryKey: [
          'admin-programs',
        ],
      })
    },

    onError: () =>
      toast.error(
        'Failed to update status'
      ),
  })

  const {
    mutate: deleteProgram,
  } = useMutation({
    mutationFn: (id) =>
      adminApi.deleteProgram(id),

    onSuccess: () => {
      toast.success(
        'Program deleted successfully'
      )

      qc.invalidateQueries({
        queryKey: [
          'admin-programs',
        ],
      })
    },

    onError: (err) =>
      toast.error(
        err.response?.data
          ?.message ||
          'Failed to delete program'
      ),
  })

  const programs =
    data?.data?.data || []

  const activePrograms =
    programs.filter(
      (p) => p.active
    ).length

  const inactivePrograms =
    programs.length -
    activePrograms

  const handleDeleteProgram = (
    id,
    name
  ) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${name}"? This action cannot be undone.`
      )
    ) {
      deleteProgram(id)
    }
  }

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={700}
            color="#1F2937"
          >
            Programs
          </Typography>

          <Typography
            sx={{
              color: '#6B7280',
              mt: 0.5,
            }}
          >
            Manage educational
            programs and curriculum
            categories
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setEdit(null)
            setOpen(true)
          }}
          sx={{
            bgcolor: '#2E7D32',
            borderRadius: 3,
            textTransform:
              'none',

            '&:hover': {
              bgcolor:
                '#1B5E20',
            },
          }}
        >
          Add Program
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
            label="Total Programs"
            value={programs.length}
            color="#1F2937"
          />
        </Grid>

        <Grid
          item
          xs={12}
          md={4}
        >
          <StatCard
            label="Active Programs"
            value={
              activePrograms
            }
            color="#2E7D32"
          />
        </Grid>

        <Grid
          item
          xs={12}
          md={4}
        >
          <StatCard
            label="Inactive Programs"
            value={
              inactivePrograms
            }
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
            overflow: 'auto',

            '&::-webkit-scrollbar':
              {
                width: 8,
              },

            '&::-webkit-scrollbar-thumb':
              {
                backgroundColor:
                  '#C8E6C9',
                borderRadius: 10,
              },
          }}
        >
          <Table stickyHeader>
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
                  Program Name
                </TableCell>

                <TableCell>
                  Description
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
                    colSpan={5}
                    align="center"
                    sx={{
                      py: 8,
                    }}
                  >
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              )}

              {programs.map(
                (p, i) => (
                  <TableRow
                    key={p.id}
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
                      <Typography
                        fontWeight={
                          600
                        }
                        color="#1F2937"
                      >
                        {
                          p.programName
                        }
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          maxWidth: 350,
                        }}
                      >
                        {p.description ||
                          '—'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={
                          p.active
                            ? 'Active'
                            : 'Inactive'
                        }
                        size="small"
                        sx={{
                          fontWeight: 600,

                          bgcolor:
                            p.active
                              ? '#E8F5E9'
                              : '#F3F4F6',

                          color:
                            p.active
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
                            setEdit(
                              p
                            )
                            setOpen(
                              true
                            )
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip
                        title={
                          p.active
                            ? 'Deactivate'
                            : 'Activate'
                        }
                      >
                        <IconButton
                          size="small"
                          sx={{
                            color:
                              p.active
                                ? '#DC2626'
                                : '#2E7D32',
                          }}
                          onClick={() =>
                            toggleStatus(
                              p.id
                            )
                          }
                        >
                          {p.active ? (
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
                            handleDeleteProgram(
                              p.id,
                              p.programName
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

      <ProgramDialog
        program={edit}
        open={open}
        onClose={() =>
          setOpen(false)
        }
        onSuccess={() =>
          qc.invalidateQueries({
            queryKey: [
              'admin-programs',
            ],
          })
        }
      />
    </Box>
  )
}