import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./pages/ProtectedRoute";
import { Dashboard } from "./pages/Dashboard";

import { Bookmarks } from "./pages/jobs/Bookmarks";
import { Jobs } from "./pages/jobs/Jobs";
import { ViewJobs } from "./pages/jobs/ViewJobs";
import { JobApply } from "./pages/jobs/JobApply";
import AddJobs from "./pages/jobs/AddJobs";

import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { JobApproval } from "./pages/admin/JobApproval";

import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import EmployerRegister from "./pages/auth/EmployerRegister";
import UsersList from "./pages/admin/UsersList";
import UserProfile from "./pages/admin/UserProfile";
import UpdateProfile from "./pages/UpdateProfile";
import Profile from "./pages/Profile";
import ApplicationList from "./pages/jobs/job_application/ApplicationList";
import { ApplicationView } from "./pages/jobs/job_application/ApplicationView";
import ChatPage from "./pages/chat/ChatPage";
import Connections from "./pages/Connections";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AllNotifications } from "./pages/admin/AllNotifications";

import AnimatedLayout from "./layouts/AnimatedLayout";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<AnimatedLayout />}>
            <Route path="/login" element={<AuthLayout> <Login /></AuthLayout>} />
            <Route path="/register" element={<AuthLayout> <Register /></AuthLayout>} />
            <Route path="/employerRegister" element={<AuthLayout> <EmployerRegister /></AuthLayout>} />

            <Route path="/bookmarks" element={<ProtectedRoute> <MainLayout><Bookmarks /> </MainLayout></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute> <MainLayout> <Dashboard /> </MainLayout></ProtectedRoute>} />
            <Route path="/jobs" element={<ProtectedRoute> <MainLayout> <Jobs /></MainLayout> </ProtectedRoute>} />
            <Route path="/jobs/store" element={<ProtectedRoute> <MainLayout> <AddJobs /></MainLayout> </ProtectedRoute>} />

            <Route path="/admin/dashboard" element={<ProtectedRoute> <MainLayout> <AdminDashboard /></MainLayout> </ProtectedRoute>} />
            <Route path="/admin/job-approval" element={<ProtectedRoute><MainLayout> <JobApproval /></MainLayout> </ProtectedRoute>} />
            <Route path="/view-job/:id" element={<ProtectedRoute><MainLayout> <ViewJobs /></MainLayout> </ProtectedRoute>} />
            <Route path="/view-job/approval/:id" element={<ProtectedRoute><MainLayout> <ViewJobs approvalMode={true} /></MainLayout> </ProtectedRoute>} />
            <Route path="/apply-job/:id" element={<ProtectedRoute><MainLayout> <JobApply /></MainLayout> </ProtectedRoute>} />
            <Route path="/application/list" element={<ProtectedRoute><MainLayout> <ApplicationList /></MainLayout> </ProtectedRoute>} />
            <Route path="/application/view/:id" element={<ProtectedRoute><MainLayout> <ApplicationView /></MainLayout> </ProtectedRoute>} />

            <Route path="/users/list" element={<ProtectedRoute><MainLayout> <UsersList /></MainLayout> </ProtectedRoute>} />
            <Route path="/users/view/:id" element={<ProtectedRoute><MainLayout> <UserProfile /></MainLayout> </ProtectedRoute>} />
            <Route path="/users/profile" element={<ProtectedRoute><MainLayout> <Profile /></MainLayout> </ProtectedRoute>} />
            <Route path="/users/editProfile/:id" element={<ProtectedRoute><MainLayout> <UpdateProfile /></MainLayout> </ProtectedRoute>} />

            <Route path="/chats" element={<ProtectedRoute><MainLayout> <ChatPage /></MainLayout> </ProtectedRoute>} />
            <Route path="/connections" element={<ProtectedRoute><MainLayout> <Connections /></MainLayout> </ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><MainLayout> <AllNotifications /></MainLayout> </ProtectedRoute>} />

            {/* Redirect all unknown routes to login */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Route>
        </Routes>

        <ToastContainer
          position="bottom-right"
          autoClose={1000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          pauseOnFocusLoss={false}
          draggable
          pauseOnHover
          theme="colored"
          style={{ fontSize: "14px", borderRadius: "10px" }}
        />

      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
