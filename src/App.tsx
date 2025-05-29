import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { DataProvider } from "@/context/DataContext";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import Login from "@/pages/Login";
import StudentDashboard from "@/pages/student/Dashboard";
import AbsenceHistory from "@/pages/student/AbsenceHistory";
import ClaimAbsence from "@/pages/student/ClaimAbsence";
import Timetable from "@/pages/student/Timetable";
import Profile from "@/pages/student/Profile";
import SupervisorDashboard from "@/pages/supervisor/Dashboard";
import TrackAbsences from "@/pages/supervisor/TrackAbsences";
import StudentManagement from "@/pages/supervisor/StudentManagement";
import StudentDetails from "@/pages/supervisor/StudentDetails";
import ClassesTimetable from "@/pages/supervisor/ClassesTimetable";
import SupervisorProfile from "@/pages/supervisor/Profile";
import Unauthorized from "@/pages/Unauthorized";
import NotFoundCustom from "@/pages/NotFoundCustom";

const App = () => (
  <AuthProvider>
    <ThemeProvider>
      <DataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              {/* App Routes */}
              <Route path="/" element={<Layout />}>
                {/* Redirect from root to dashboard or login */}
                <Route index element={<Navigate to="/dashboard" replace />} />
                
                {/* Student Routes */}
                <Route
                  path="dashboard"
                  element={
                    <ProtectedRoute>
                      {(params) => {
                        const { user } = params;
                        return user?.role === "supervisor" ? <SupervisorDashboard /> : <StudentDashboard />;
                      }}
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="absence-history"
                  element={
                    <ProtectedRoute requiredRole="student">
                      <AbsenceHistory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="claim"
                  element={
                    <ProtectedRoute requiredRole="student">
                      <ClaimAbsence />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="timetable"
                  element={
                    <ProtectedRoute requiredRole="student">
                      <Timetable />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="profile"
                  element={
                    <ProtectedRoute>
                      {(params) => {
                        const { user } = params;
                        return user?.role === "supervisor" ? <SupervisorProfile /> : <Profile />;
                      }}
                    </ProtectedRoute>
                  }
                />
                
                {/* Supervisor Routes */}
                <Route
                  path="track-absences"
                  element={
                    <ProtectedRoute requiredRole="supervisor">
                      <TrackAbsences />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="student-management"
                  element={
                    <ProtectedRoute requiredRole="supervisor">
                      <StudentManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="student-details/:id"
                  element={
                    <ProtectedRoute requiredRole="supervisor">
                      <StudentDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="classes-timetable"
                  element={
                    <ProtectedRoute requiredRole="supervisor">
                      <ClassesTimetable />
                    </ProtectedRoute>
                  }
                />
              </Route>
              
              {/* Catch-all for 404s */}
              <Route path="*" element={<NotFoundCustom />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DataProvider>
    </ThemeProvider>
  </AuthProvider>
);

export default App;
