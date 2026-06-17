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
  useTheme,
  useMediaQuery,
  Button,
} from '@mui/material'
import {
  Dashboard,
  EventNote,
  Person,
  Menu as MenuIcon,
  Logout,
  LocationOn,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const DRAWER_WIDTH = 280

const navItems = [
  {
    label: 'Dashboard',
    path: '/teacher/dashboard',
    icon: <Dashboard />,
  },
  {
    label: 'Mark Attendance',
    path: '/teacher/attendance',
    icon: <LocationOn />,
  },
  {
    label: 'History',
    path: '/teacher/history',
    icon: <EventNote />,
  },
  {
    label: 'Profile',
    path: '/teacher/profile',
    icon: <Person />,
  },
]

export default function TeacherLayout() {
  const { user, logout } = useAuth()

  const navigate = useNavigate()
  const location = useLocation()

  const theme = useTheme()
  const isMobile = useMediaQuery(
    theme.breakpoints.down('md')
  )

  const [mobileOpen, setMobileOpen] =
    useState(false)

  const currentPage =
    navItems.find(
      (item) =>
        item.path ===
        location.pathname
    )?.label ||
    'Teacher Dashboard'

  const handleLogout = () => {
    logout()
    toast.success(
      'Logged out successfully'
    )
    navigate('/login')
    window.location.reload()

  }

  const drawer = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: '#FFFFFF',
      }}
    >
      {/* Profile Section */}
      <Box
        sx={{
          p: 3,
          borderBottom:
            '1px solid #E8F5E9',
          bgcolor: '#F8FAF8',
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
              width: 52,
              height: 52,
              bgcolor: '#E8F5E9',
              color: '#2E7D32',
              fontWeight: 700,
              fontSize: 20,
            }}
          >
            {user?.fullName?.[0]?.toUpperCase() ||
              'T'}
          </Avatar>

          <Box
            sx={{
              overflow: 'hidden',
              flex: 1,
            }}
          >
            <Typography
              fontWeight={700}
              noWrap
              sx={{
                color: '#1F2937',
              }}
            >
              {user?.fullName ||
                'Teacher'}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
            >
              {user?.email ||
                'teacher@example.com'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation */}
      <List
        sx={{
          flex: 1,
          py: 2,
          px: 1,
        }}
      >
        {navItems.map((item) => {
          const active =
            location.pathname ===
            item.path

          return (
            <ListItemButton
              key={item.path}
              onClick={() => {
                navigate(item.path)

                if (isMobile) {
                  setMobileOpen(
                    false
                  )
                }
              }}
              selected={active}
              sx={{
                mx: 1,
                my: 0.5,
                borderRadius: 3,
                minHeight: 48,

                '&:hover': {
                  bgcolor:
                    '#F8FAF8',
                },

                '&.Mui-selected': {
                  bgcolor:
                    '#E8F5E9',
                  color: '#2E7D32',

                  '& .MuiListItemIcon-root':
                    {
                      color:
                        '#2E7D32',
                    },

                  '&:hover': {
                    bgcolor:
                      '#E8F5E9',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: active
                    ? '#2E7D32'
                    : '#6B7280',
                }}
              >
                {item.icon}
              </ListItemIcon>

              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: active
                    ? 700
                    : 500,
                }}
              />
            </ListItemButton>
          )
        })}
      </List>

      {/* Logout */}
      <Box
        sx={{
          p: 3,
          borderTop:
            '1px solid #E8F5E9',
          mt: 'auto',
        }}
      >
        <Button
          variant="contained"
          fullWidth
          startIcon={<Logout />}
          onClick={handleLogout}
          sx={{
            bgcolor: '#DC2626',
            borderRadius: 3,
            textTransform:
              'none',
            py: 1.2,
            fontWeight: 600,

            '&:hover': {
              bgcolor:
                '#B91C1C',
            },
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  )

  return (
    <Box
      sx={{
        display: 'flex',
      }}
    >
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
            '& .MuiDrawer-paper':
              {
                width:
                  DRAWER_WIDTH,
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

            '& .MuiDrawer-paper':
              {
                width:
                  DRAWER_WIDTH,
                boxSizing:
                  'border-box',
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
          bgcolor: '#F9FAFB',
        }}
      >
        {/* Mobile Header */}
        <Box
          sx={{
            display: {
              md: 'none',
            },
            p: 2,
            bgcolor: 'white',
            borderBottom:
              '1px solid #E8F5E9',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent:
                'space-between',
              alignItems:
                'center',
            }}
          >
            <Typography
              variant="h6"
              fontWeight={700}
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