import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material'
import { Edit, Save, Cancel, Person, Lock } from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { teacherApi } from '../../services/apiServices'

export default function TeacherProfile() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState('')
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['teacher-profile'],
    queryFn: () => teacherApi.getProfile(),
  })

  const profile = data?.data?.data

  useEffect(() => {
    if (profile) setFullName(profile.fullName)
  }, [profile])

  const { mutate: updateName, isPending } = useMutation({
    mutationFn: () => teacherApi.updateProfile({ fullName }),
    onSuccess: () => {
      toast.success('Name updated successfully!')
      setEditing(false)
      qc.invalidateQueries({ queryKey: ['teacher-profile'] })
    },
    onError: () => toast.error('Update failed'),
  })

  const { mutate: changePassword, isPending: passwordPending } = useMutation({
    mutationFn: () =>
      teacherApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }),
    onSuccess: () => {
      toast.success('Password changed successfully!')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Password update failed'),
  })

  const handlePasswordChange = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New password and confirm password do not match')
      return
    }
    changePassword()
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    )
  }

  const firstLetter = profile?.fullName?.[0]?.toUpperCase() || ''

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          My Profile
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Clean single‑line view of your teacher details.
        </Typography>
      </Box>

      <Card
        sx={{
          borderRadius: 3,
          boxShadow: 'none',
          border: '1px solid #E5E7EB',
          bgcolor: '#F9FAFB',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 3,
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  fontSize: 26,
                  bgcolor: 'success.main',
                  color: 'white',
                }}
              >
                {firstLetter || <Person />}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {profile?.fullName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {profile?.email}
                </Typography>
              </Box>
            </Box>

            {!editing && (
              <Button
                startIcon={<Edit />}
                onClick={() => setEditing(true)}
                variant="outlined"
                size="small"
              >
                Edit Name
              </Button>
            )}
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            Only your <strong>Full Name</strong> can be updated here.
          </Alert>

          {/* Single-line info block */}
          <Box
            sx={{
              borderRadius: 2,
              bgcolor: 'white',
              border: '1px solid #E5E7EB',
              overflow: 'hidden',
            }}
          >
            <SingleLineRow label="Full Name">
              {editing ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    size="small"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    startIcon={
                      isPending ? (
                        <CircularProgress size={14} color="inherit" />
                      ) : (
                        <Save fontSize="small" />
                      )
                    }
                    onClick={() => updateName()}
                    disabled={isPending || !fullName?.trim()}
                  >
                    Save
                  </Button>
                  <Button
                    variant="text"
                    size="small"
                    startIcon={<Cancel fontSize="small" />}
                    onClick={() => {
                      setEditing(false)
                      setFullName(profile?.fullName || '')
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              ) : (
                <Typography variant="body2">{profile?.fullName || '—'}</Typography>
              )}
            </SingleLineRow>

            <SingleLineRow label="Email" readOnly>
              <Typography variant="body2">{profile?.email || '—'}</Typography>
            </SingleLineRow>

            <SingleLineRow label="Phone" readOnly>
              <Typography variant="body2">
                {profile?.phoneNumber || 'Not provided'}
              </Typography>
            </SingleLineRow>

            <SingleLineRow label="Role" readOnly>
              <Chip label="Teacher" size="small" color="success" />
            </SingleLineRow>

            <SingleLineRow label="Centers" readOnly>
              {profile?.centers?.length > 0 ? (
                profile.centers.map((c) => (
                  <Chip
                    key={c.id}
                    label={c.centerName}
                    size="small"
                    sx={{ mr: 0.5 }}
                    color="primary"
                    variant="outlined"
                  />
                ))
              ) : (
                <Typography variant="body2">No centers assigned.</Typography>
              )}
            </SingleLineRow>

            <SingleLineRow label="Programs" readOnly last>
              {profile?.programs?.length > 0 ? (
                profile.programs.map((p) => (
                  <Chip
                    key={p.id}
                    label={p.programName}
                    size="small"
                    sx={{ mr: 0.5 }}
                    color="secondary"
                    variant="outlined"
                  />
                ))
              ) : (
                <Typography variant="body2">No programs assigned.</Typography>
              )}
            </SingleLineRow>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box
            sx={{
              borderRadius: 2,
              bgcolor: 'white',
              border: '1px solid #E5E7EB',
              p: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Lock fontSize="small" color="success" />
              <Typography variant="subtitle1" fontWeight={700}>
                Change Password
              </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
              <TextField
                label="Current Password"
                type="password"
                size="small"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                }
              />
              <TextField
                label="New Password"
                type="password"
                size="small"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                }
              />
              <TextField
                label="Confirm Password"
                type="password"
                size="small"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                }
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="contained"
                color="success"
                startIcon={
                  passwordPending ? <CircularProgress size={14} color="inherit" /> : <Save fontSize="small" />
                }
                onClick={handlePasswordChange}
                disabled={
                  passwordPending ||
                  !passwordForm.currentPassword ||
                  !passwordForm.newPassword ||
                  !passwordForm.confirmPassword
                }
              >
                Update Password
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

function SingleLineRow({ label, children, readOnly, last }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        justifyContent: 'space-between',
        px: 2,
        py: 1.25,
        borderBottom: last ? 'none' : '1px solid #F3F4F6',
        '&:hover': { bgcolor: '#F9FAFB' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 130 }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, color: 'text.secondary', whiteSpace: 'nowrap' }}
        >
          {label}
        </Typography>
        {readOnly && (
          <Chip
            label="Read-only"
            size="small"
            sx={{ fontSize: 10, height: 18, bgcolor: '#F3F4F6' }}
          />
        )}
      </Box>
      <Box sx={{ flex: 1, textAlign: 'right' }}>{children}</Box>
    </Box>
  )
}
