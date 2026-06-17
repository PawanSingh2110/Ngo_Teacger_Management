import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Drawer,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  Dashboard,
  People,
  LocationCity,
  School,
  EventNote,
  Menu as MenuIcon,
  Logout,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const DRAWER_WIDTH = 300

const navItems = [
  {
    label: 'Dashboard',
    path: '/admin/dashboard',
    icon: <Dashboard />,
  },
  {
    label: 'Teachers',
    path: '/admin/teachers',
    icon: <People />,
  },
  {
    label: 'Centers',
    path: '/admin/centers',
    icon: <LocationCity />,
  },
  {
    label: 'Programs',
    path: '/admin/programs',
    icon: <School />,
  },
  {
    label: 'Attendance',
    path: '/admin/attendance',
    icon: <EventNote />,
  },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()

  const navigate = useNavigate()
  const location = useLocation()

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [mobileOpen, setMobileOpen] = useState(false)

  const currentPage =
    navItems.find(
      (item) => item.path === location.pathname
    )?.label || 'Admin Dashboard'

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const drawer = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: '#FFFFFF',
        fontFamily: 'Poppins, sans-serif',
      }}
    >
      {/* User Profile */}
      <Box
        sx={{
          p: 3,
          borderBottom: '1px solid #E8F5E9',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Avatar
            sx={{
              width: 54,
              height: 54,
              bgcolor: '#2E7D32',
              fontWeight: 700,
              fontSize: '1.2rem',
            }}
          >
            {user?.fullName?.[0]?.toUpperCase() || 'A'}
          </Avatar>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 600,
                color: '#1F2937',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.fullName || 'Admin User'}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: '#6B7280',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.email || 'admin@example.com'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation Label */}
      <Typography
        sx={{
          px: 3,
          pt: 3,
          pb: 1,
          fontSize: '0.75rem',
          fontWeight: 600,
          color: '#9CA3AF',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        Navigation
      </Typography>

      {/* Navigation Items */}
      <List
        sx={{
          px: 1,
          flexGrow: 1,
        }}
      >
        {navItems.map((item) => {
          const active =
            location.pathname === item.path

          return (
            <ListItemButton
              key={item.path}
              selected={active}
              onClick={() => {
                navigate(item.path)

                if (isMobile) {
                  setMobileOpen(false)
                }
              }}
              sx={{
                mx: 1,
                my: 0.5,
                borderRadius: 3,
                minHeight: 50,

                '& .MuiListItemIcon-root': {
                  color: active
                    ? '#FFFFFF'
                    : '#6B7280',
                  minWidth: 42,
                },

                '&.Mui-selected': {
                  color: '#FFFFFF',
                  background:
                    'linear-gradient(135deg, #2E7D32 0%, #26A69A 100%)',

                  '& .MuiListItemIcon-root': {
                    color: '#FFFFFF',
                  },

                  '&:hover': {
                    background:
                      'linear-gradient(135deg, #2E7D32 0%, #26A69A 100%)',
                  },
                },

                '&:hover': {
                  backgroundColor: '#F1F8F4',
                },
              }}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>

              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: active ? 600 : 500,
                }}
              />
            </ListItemButton>
          )
        })}
      </List>

      {/* Logout */}
      <Box
        sx={{
          mt: 'auto',
          p: 3,
          borderTop: '1px solid #E8F5E9',
        }}
      >
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Logout />}
          onClick={handleLogout}
          sx={{
            borderColor: '#2E7D32',
            color: '#2E7D32',
            borderRadius: 3,
            py: 1.2,
            textTransform: 'none',
            fontWeight: 600,

            '&:hover': {
              borderColor: '#1B5E20',
              backgroundColor: '#F1F8F4',
            },
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() =>
            setMobileOpen(false)
          }
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              backgroundColor: '#FFFFFF',
              borderRight:
                '1px solid #E8F5E9',
            },
          }}
        >
          {drawer}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          open
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,

            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              backgroundColor: '#FFFFFF',
              borderRight:
                '1px solid #E8F5E9',
            },
          }}
        >
          {drawer}
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          bgcolor: '#F8FAF8',
        }}
      >
        {/* Mobile Header */}
        <Box
          sx={{
            display: { md: 'none' },
            p: 2,
            borderBottom:
              '1px solid #E8F5E9',
            bgcolor: '#FFFFFF',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent:
                'space-between',
              alignItems: 'center',
            }}
          >
            <Typography
              variant="h6"
              fontWeight={700}
              color="#1F2937"
            >
              {currentPage}
            </Typography>

            <IconButton
              onClick={() =>
                setMobileOpen(true)
              }
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Box>

        <Box
          sx={{
            p: {
              xs: 2,
              md: 3,
            },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}