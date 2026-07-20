import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
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
import { Add, Delete, Edit, Save } from '@mui/icons-material'
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
    <Box sx={{ width: '100%', overflowX: 'hidden' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="#1F2937">
            Shifts
          </Typography>
          <Typography sx={{ color: '#6B7280', mt: 0.5 }}>
            Manage attendance shift timings and schedule slots
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={editing ? <Save /> : <Add />}
          onClick={handleSave}
          disabled={saveShift.isPending}
          sx={{
            bgcolor: '#2E7D32',
            borderRadius: 3,
            textTransform: 'none',
            width: { xs: '100%', sm: 'auto' },
            '&:hover': { bgcolor: '#1B5E20' },
          }}
        >
          {saveShift.isPending ? <CircularProgress size={20} color="inherit" /> : editing ? 'Update Shift' : 'Add Shift'}
        </Button>
      </Box>

      <Card sx={{ borderRadius: 4, border: '1px solid #E8F5E9', overflow: 'hidden', boxShadow: 'none', mb: 3 }}>
        <Box sx={{ p: { xs: 2, sm: 3 }, borderBottom: '1px solid #E5E7EB' }}>
          <Typography variant="h6" fontWeight={700} color="#1F2937">
            {editing ? 'Edit Shift' : 'Create Shift'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Enter the shift name and timing window below.
          </Typography>
        </Box>

        <Box sx={{ p: { xs: 2, sm: 3 }, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
          <TextField
            label="Shift Name"
            value={shiftForm.shiftName}
            onChange={(e) => setShiftForm((prev) => ({ ...prev, shiftName: e.target.value }))}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />
          <TextField
            label="Start Time"
            type="time"
            value={shiftForm.startTime}
            onChange={(e) => setShiftForm((prev) => ({ ...prev, startTime: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />
          <TextField
            label="End Time"
            type="time"
            value={shiftForm.endTime}
            onChange={(e) => setShiftForm((prev) => ({ ...prev, endTime: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />
        </Box>

        {editing && (
          <Box sx={{ px: { xs: 2, sm: 3 }, pb: 2 }}>
            <Button onClick={resetForm} sx={{ textTransform: 'none' }}>
              Cancel Edit
            </Button>
          </Box>
        )}
      </Card>

      <Card sx={{ borderRadius: 4, border: '1px solid #E8F5E9', overflow: 'hidden', boxShadow: 'none' }}>
        <TableContainer sx={{ height: 500, maxHeight: { xs: '68vh', md: 500 }, overflow: 'auto', '&::-webkit-scrollbar': { width: 8, height: 8 }, '&::-webkit-scrollbar-thumb': { backgroundColor: '#C8E6C9', borderRadius: 10 } }}>
          <Table stickyHeader sx={{ minWidth: { xs: 640, md: 780 } }}>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: '#F1F8F4', color: '#1F2937' } }}>
                <TableCell>#</TableCell>
                <TableCell>Shift Name</TableCell>
                <TableCell>Time</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              )}
              {isError && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Alert severity="error">Failed to load shifts</Alert>
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && !isError && shifts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                    No shifts created.
                  </TableCell>
                </TableRow>
              )}
              {shifts.map((shift, index) => (
                <TableRow key={shift.id} hover sx={{ bgcolor: index % 2 === 0 ? '#FFFFFF' : '#FAFAFA', '& td': { py: 1.5 } }}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Typography fontWeight={600} color="#1F2937">
                      {shift.shiftName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {shift.startTime?.slice(0, 5)} - {shift.endTime?.slice(0, 5)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit">
                      <IconButton size="small" sx={{ color: '#2563EB' }} onClick={() => handleEdit(shift)}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        sx={{ color: '#DC2626' }}
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
      </Card>
    </Box>
  )
}
