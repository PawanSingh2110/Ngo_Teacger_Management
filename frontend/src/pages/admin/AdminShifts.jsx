import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { Add, Delete, Edit, Save, Schedule } from '@mui/icons-material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { adminApi } from '../../services/apiServices'

export default function AdminShifts() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState(null)
  const [shiftForm, setShiftForm] = useState({
    shiftName: '',
    startTime: '',
    endTime: '',
  })

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-shifts'],
    queryFn: () => adminApi.getShifts(),
  })

  const shifts = data?.data?.data || []

  const resetForm = () => {
    setEditing(null)
    setShiftForm({ shiftName: '', startTime: '', endTime: '' })
  }

  const saveShift = useMutation({
    mutationFn: () => {
      const payload = {
        shiftName: shiftForm.shiftName,
        startTime: shiftForm.startTime,
        endTime: shiftForm.endTime,
        active: true,
      }
      return editing
        ? adminApi.updateShift(editing.id, payload)
        : adminApi.createShift(payload)
    },
    onSuccess: () => {
      toast.success(editing ? 'Shift updated' : 'Shift created')
      resetForm()
      qc.invalidateQueries({ queryKey: ['admin-shifts'] })
      qc.invalidateQueries({ queryKey: ['shifts-list'] })
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to save shift'),
  })

  const deleteShift = useMutation({
    mutationFn: (id) => adminApi.deleteShift(id),
    onSuccess: () => {
      toast.success('Shift deleted')
      qc.invalidateQueries({ queryKey: ['admin-shifts'] })
      qc.invalidateQueries({ queryKey: ['shifts-list'] })
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete shift'),
  })

  const handleEdit = (shift) => {
    setEditing(shift)
    setShiftForm({
      shiftName: shift.shiftName || '',
      startTime: shift.startTime?.slice(0, 5) || '',
      endTime: shift.endTime?.slice(0, 5) || '',
    })
  }

  const handleSave = () => {
    if (!shiftForm.shiftName || !shiftForm.startTime || !shiftForm.endTime) {
      toast.error('Shift name, start time and end time are required')
      return
    }
    saveShift.mutate()
  }

  return (
    <Box sx={{ maxWidth: 1100 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Shifts
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create and manage attendance shift timings.
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid #E8F5E9' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Schedule color="success" />
            <Typography variant="h6" fontWeight={700}>
              Shift Details
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr auto' }, gap: 2, mb: 3 }}>
            <TextField
              label="Shift Name"
              value={shiftForm.shiftName}
              onChange={(e) => setShiftForm((prev) => ({ ...prev, shiftName: e.target.value }))}
            />
            <TextField
              label="Start Time"
              type="time"
              value={shiftForm.startTime}
              onChange={(e) => setShiftForm((prev) => ({ ...prev, startTime: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Time"
              type="time"
              value={shiftForm.endTime}
              onChange={(e) => setShiftForm((prev) => ({ ...prev, endTime: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                color="success"
                startIcon={saveShift.isPending ? <CircularProgress size={14} color="inherit" /> : editing ? <Save /> : <Add />}
                onClick={handleSave}
                disabled={saveShift.isPending}
              >
                {editing ? 'Update' : 'Add'}
              </Button>
              {editing && (
                <Button onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </Box>
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Shift</TableCell>
                  <TableCell>Start</TableCell>
                  <TableCell>End</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                )}
                {isError && (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Alert severity="error">Failed to load shifts</Alert>
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && !isError && shifts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No shifts created.
                    </TableCell>
                  </TableRow>
                )}
                {shifts.map((shift) => (
                  <TableRow key={shift.id}>
                    <TableCell>{shift.shiftName}</TableCell>
                    <TableCell>{shift.startTime?.slice(0, 5)}</TableCell>
                    <TableCell>{shift.endTime?.slice(0, 5)}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleEdit(shift)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            if (window.confirm(`Delete shift "${shift.shiftName}"?`)) {
                              deleteShift.mutate(shift.id)
                            }
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
        </CardContent>
      </Card>
    </Box>
  )
}
