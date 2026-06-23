import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Chip,
  Avatar,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
} from "@mui/material";
import {
  People,
  LocationCity,
  School,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../services/apiServices";
import dayjs from "dayjs";

function StatCard({ icon, label, value, color }) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        border: "1px solid #E8F5E9",
        boxShadow: "none",
        transition: "all 0.2s ease",

        "&:hover": {
          transform: "translateY(-2px)",
          borderColor: "#C8E6C9",
        },
      }}
    >
      <CardContent
        sx={{
          p: 2.5,
          "&:last-child": {
            pb: 2.5,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Avatar
            sx={{
              bgcolor: `${color}.light`,
              color: `${color}.main`,
              width: 42,
              height: 42,
            }}
          >
            {icon}
          </Avatar>

          <Box>
            <Typography
              sx={{
                fontSize: "2rem",
                fontWeight: 700,
                color: "#1F2937",
                lineHeight: 1,
              }}
            >
              {value ?? "—"}
            </Typography>

            <Typography
              sx={{
                color: "#6B7280",
                fontSize: "0.95rem",
                mt: 0.5,
              }}
            >
              {label}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => adminApi.getDashboard(),
    refetchInterval: 60000,
  });

  const stats = data?.data?.data;

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <CircularProgress sx={{ color: "#2E7D32" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 1400,
        mx: "auto",
        width: "100%",
        overflowX: "hidden",
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{
            color: "#1F2937",
            mb: 0.5,
            fontSize: { xs: "1.75rem", sm: "2.125rem" },
          }}
        >
          Dashboard
        </Typography>

        <Typography
          sx={{
            color: "#6B7280",
          }}
        >
          {dayjs().format("dddd, MMMM D, YYYY")}
        </Typography>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <StatCard
            icon={<People />}
            label="Total Teachers"
            value={stats?.totalTeachers}
            color="success"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <StatCard
            icon={<LocationCity />}
            label="Total Centers"
            value={stats?.totalCenters}
            color="info"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <StatCard
            icon={<School />}
            label="Total Programs"
            value={stats?.totalPrograms}
            color="warning"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <StatCard
            icon={<CheckCircle />}
            label="Present Today"
            value={stats?.presentToday}
            color="success"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <StatCard
            icon={<Cancel />}
            label="Absent Today"
            value={stats?.absentToday}
            color="error"
          />
        </Grid>
      </Grid>

      {/* Attendance Table */}
      <Card
        sx={{
          borderRadius: 4,
          border: "1px solid #E8F5E9",
          overflow: "hidden",
          boxShadow: "none",
        }}
      >
        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: "1px solid #E8F5E9",
            bgcolor: "#F8FAF8",
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
            flexDirection: { xs: "column", sm: "row" },
            gap: 1.5,
          }}
        >
          <Typography variant="h6" fontWeight={600} color="#1F2937">
            Today's Attendance
          </Typography>

          <Chip
            label={`${stats?.todayAttendanceOverview?.length || 0} Records`}
            size="small"
            sx={{
              bgcolor: "#E8F5E9",
              color: "#2E7D32",
              fontWeight: 600,
            }}
          />
        </Box>

        <TableContainer
          sx={{
            height: 350,
            maxHeight: { xs: "62vh", md: 350 },
            overflow: "auto",

            "&::-webkit-scrollbar": {
              width: 8,
              height: 8,
            },

            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#C8E6C9",
              borderRadius: 10,
            },
          }}
        >
          <Table stickyHeader size="small" sx={{ minWidth: { xs: 680, md: 850 } }}>
            <TableHead>
              <TableRow
                sx={{
                  "& th": {
                    fontWeight: 700,
                    bgcolor: "#F1F8F4",
                    color: "#1F2937",
                  },
                }}
              >
                <TableCell width={60}>#</TableCell>
                <TableCell>Teacher</TableCell>
                <TableCell>Center</TableCell>
                <TableCell>Login Time</TableCell>
                <TableCell align="center">Status</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {!stats?.todayAttendanceOverview?.length ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Box
                      sx={{
                        py: 10,
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          color: "#6B7280",
                        }}
                      >
                        No attendance recorded today
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                stats.todayAttendanceOverview.map((row, index) => (
                  <TableRow
                    key={row.id}
                    hover
                    sx={{
                      bgcolor: index % 2 === 0 ? "#FFFFFF" : "#FAFAFA",

                      "& td": {
                        py: 1.5,
                      },

                      "&:hover": {
                        bgcolor: "#F5FDF7",
                      },
                    }}
                  >
                    <TableCell>{index + 1}</TableCell>

                    <TableCell>
                      <Typography
                        fontWeight={600}
                        fontSize="0.95rem"
                        color="#1F2937"
                      >
                        {row.teacherName}
                      </Typography>
                    </TableCell>

                    <TableCell>{row.centerName || "—"}</TableCell>

                    <TableCell>
                      {row.loginTime
                        ? dayjs(row.loginTime).format("hh:mm A")
                        : "—"}
                    </TableCell>

                    <TableCell align="center">
                      <Chip
                        label={row.status === "PRESENT" ? "Present" : "Absent"}
                        size="small"
                        sx={{
                          height: 28,
                          minWidth: 80,
                          borderRadius: 2,
                          fontWeight: 600,

                          bgcolor:
                            row.status === "PRESENT" ? "#E8F5E9" : "#FEE2E2",

                          color:
                            row.status === "PRESENT" ? "#2E7D32" : "#DC2626",
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
