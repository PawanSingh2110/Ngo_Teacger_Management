import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  Typography,
} from '@mui/material'
import { Lock, Save } from '@mui/icons-material'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { adminApi } from '../../services/apiServices'
import { useAuth } from '../../contexts/AuthContext'

export default function AdminSettings() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const { mutate: changePassword, isPending } = useMutation({
    mutationFn: () =>
      adminApi.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      }),
    onSuccess: () => {
      toast.success('Password changed successfully')
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Password update failed'),
  })

  const handleSubmit = () => {
    if (form.newPassword !== form.confirmPassword) {
      toast.error('New password and confirm password do not match')
      return
    }
    changePassword()
  }

  return (
    <Box sx={{ maxWidth: 980 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage admin account security for {user?.email || 'your account'}.
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid #E8F5E9' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Lock color="success" />
            <Typography variant="h6" fontWeight={700}>
              Change Password
            </Typography>
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            Enter your current password before setting a new admin password.
          </Alert>

          <Box sx={{ display: 'grid', gap: 2 }}>
            <TextField
              label="Current Password"
              type="password"
              value={form.currentPassword}
              onChange={(e) => setForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
            />
            <TextField
              label="New Password"
              type="password"
              value={form.newPassword}
              onChange={(e) => setForm((prev) => ({ ...prev, newPassword: e.target.value }))}
            />
            <TextField
              label="Confirm Password"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="contained"
              color="success"
              startIcon={isPending ? <CircularProgress size={14} color="inherit" /> : <Save />}
              onClick={handleSubmit}
              disabled={
                isPending || !form.currentPassword || !form.newPassword || !form.confirmPassword
              }
            >
              Update Password
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
