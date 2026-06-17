import { useState, useEffect } from 'react'
import {
  DialogContent, DialogActions, TextField, Button, Grid,
  FormControl, InputLabel, Select, MenuItem, Checkbox,
  ListItemText, OutlinedInput, CircularProgress, Alert, Box
} from '@mui/material'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { adminApi } from '../../services/apiServices'

export default function TeacherForm({ teacher, onSuccess, onCancel }) {
  const isEdit = Boolean(teacher)

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    centerIds: [],
    programIds: [],
  })

  useEffect(() => {
    if (teacher) {
      setForm({
        fullName: teacher.fullName || '',
        email: teacher.email || '',
        phoneNumber: teacher.phoneNumber || '',
        password: '',
        centerIds: teacher.centers?.map(c => c.id) || [],
        programIds: teacher.programs?.map(p => p.id) || [],
      })
    } else {
      setForm({
        fullName: '',
        email: '',
        phoneNumber: '',
        password: '',
        centerIds: [],
        programIds: [],
      })
    }
  }, [teacher])

  const { data: centersData, isLoading: centersLoading, isError: centersError } = useQuery({
    queryKey: ['centers-list'],
    queryFn: () => adminApi.getCenters(),
  })
  const { data: programsData, isLoading: programsLoading, isError: programsError } = useQuery({
    queryKey: ['programs-list'],
    queryFn: () => adminApi.getPrograms(),
  })

  const centers  = centersData?.data?.data || []
  const programs = programsData?.data?.data || []

  const { mutate, isPending } = useMutation({
    mutationFn: () => isEdit
      ? adminApi.updateTeacher(teacher.id, {
          fullName: form.fullName,
          phoneNumber: form.phoneNumber,
          centerIds: form.centerIds,
          programIds: form.programIds,
        })
      : adminApi.createTeacher(form),
    onSuccess: () => {
      toast.success(isEdit ? 'Teacher updated!' : 'Teacher created!')
      onSuccess()
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Operation failed')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    mutate()
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField fullWidth label="Full Name" required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Email" type="email" required
              value={form.email} disabled={isEdit}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Phone Number"
              value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
          </Grid>
          {!isEdit && (
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Password" type="password" required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </Grid>
          )}
          <Grid item xs={12}>
            {centersError && <Alert severity="error" sx={{ mb: 2 }}>Failed to load centers</Alert>}
            <FormControl fullWidth disabled={centersLoading}>
              <InputLabel>Assign Centers</InputLabel>
              <Select
                multiple
                value={form.centerIds}
                onChange={(e) => setForm({ ...form, centerIds: e.target.value })}
                input={<OutlinedInput label="Assign Centers" />}
                renderValue={(selected) =>
                  selected.length > 0
                    ? centers.filter(c => selected.includes(c.id)).map(c => c.centerName).join(', ')
                    : 'Select centers...'
                }
              >
                {centersLoading ? (
                  <MenuItem disabled>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} /> Loading...
                    </Box>
                  </MenuItem>
                ) : centers.length > 0 ? (
                  centers.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      <Checkbox checked={form.centerIds.includes(c.id)} />
                      <ListItemText primary={c.centerName} />
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No centers available</MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            {programsError && <Alert severity="error" sx={{ mb: 2 }}>Failed to load programs</Alert>}
            <FormControl fullWidth disabled={programsLoading}>
              <InputLabel>Assign Programs</InputLabel>
              <Select
                multiple
                value={form.programIds}
                onChange={(e) => setForm({ ...form, programIds: e.target.value })}
                input={<OutlinedInput label="Assign Programs" />}
                renderValue={(selected) =>
                  selected.length > 0
                    ? programs.filter(p => selected.includes(p.id)).map(p => p.programName).join(', ')
                    : 'Select programs...'
                }
              >
                {programsLoading ? (
                  <MenuItem disabled>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} /> Loading...
                    </Box>
                  </MenuItem>
                ) : programs.length > 0 ? (
                  programs.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      <Checkbox checked={form.programIds.includes(p.id)} />
                      <ListItemText primary={p.programName} />
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No programs available</MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={isPending}>
          {isPending ? <CircularProgress size={20} /> : isEdit ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </form>
  )
}
