import React, { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { NurseDashboard } from "./components/Dashboard/NurseDashboard";
import { CalibrationPage } from "./pages/Calibration/CalibrationPage";
import { PatientSetupPage } from "./pages/PatientSetup/PatientSetupPage";
import { LoginPage } from "./pages/Login/LoginPage";
import { BedsidePage } from "./pages/Bedside/BedsidePage";
import { PatientsPage } from "./pages/Patients/PatientsPage";
import { AddPatientPage } from "./pages/AddPatient/AddPatientPage";
import { DetectionsPage } from "./pages/Detections/DetectionsPage";
import { AlertsPage } from "./pages/Alerts/AlertsPage";
import { AnalyticsPage } from "./pages/Analytics/AnalyticsPage";
import { SettingsPage } from "./pages/Settings/SettingsPage";
import { MonitoringPage } from "./pages/Monitoring/MonitoringPage";
import { AppShell } from "./components/Layout/AppShell";
import { authApi } from "./services/api";

function RequireAuth({ children }: { children: React.ReactElement }) {
  const token = localStorage.getItem("vc_access_token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  const [wardId, setWardId] = useState(
    localStorage.getItem("vc_ward_id") ?? "ICU-1"
  );
  const [nurseId, setNurseId] = useState(
    localStorage.getItem("vc_nurse_id") ?? "nurse-1"
  );
  const [nurseName, setNurseName] = useState(
    localStorage.getItem("vc_nurse_name") ?? "Nurse"
  );

  // Refresh nurse profile from the token whenever the app loads
  useEffect(() => {
    const token = localStorage.getItem("vc_access_token");
    if (!token) return;
    authApi.me().then((res) => {
      const user = res.data;
      if (user.ward_id) {
        setWardId(user.ward_id);
        localStorage.setItem("vc_ward_id", user.ward_id);
      }
      if (user.id) {
        setNurseId(user.id);
        localStorage.setItem("vc_nurse_id", user.id);
      }
      if (user.name) {
        setNurseName(user.name);
        localStorage.setItem("vc_nurse_name", user.name);
      }
    }).catch(() => {
      // Token expired or invalid — clear and redirect to login
      localStorage.removeItem("vc_access_token");
    });
  }, []);

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Auth required routes wrapped in premium AppShell */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <AppShell nurseName={nurseName} wardId={wardId}>
                <NurseDashboard
                  wardId={wardId}
                  nurseId={nurseId}
                  nurseName={nurseName}
                />
              </AppShell>
            </RequireAuth>
          }
        />

        <Route
          path="/monitoring"
          element={
            <RequireAuth>
              <AppShell nurseName={nurseName} wardId={wardId}>
                <MonitoringPage />
              </AppShell>
            </RequireAuth>
          }
        />

        <Route
          path="/patients"
          element={
            <RequireAuth>
              <AppShell nurseName={nurseName} wardId={wardId}>
                <PatientsPage />
              </AppShell>
            </RequireAuth>
          }
        />

        <Route
          path="/add-patient"
          element={
            <RequireAuth>
              <AppShell nurseName={nurseName} wardId={wardId}>
                <AddPatientPage />
              </AppShell>
            </RequireAuth>
          }
        />

        <Route
          path="/detections"
          element={
            <RequireAuth>
              <AppShell nurseName={nurseName} wardId={wardId}>
                <DetectionsPage />
              </AppShell>
            </RequireAuth>
          }
        />

        <Route
          path="/alerts"
          element={
            <RequireAuth>
              <AppShell nurseName={nurseName} wardId={wardId}>
                <AlertsPage />
              </AppShell>
            </RequireAuth>
          }
        />

        <Route
          path="/analytics"
          element={
            <RequireAuth>
              <AppShell nurseName={nurseName} wardId={wardId}>
                <AnalyticsPage />
              </AppShell>
            </RequireAuth>
          }
        />

        <Route
          path="/settings"
          element={
            <RequireAuth>
              <AppShell nurseName={nurseName} wardId={wardId}>
                <SettingsPage />
              </AppShell>
            </RequireAuth>
          }
        />

        {/* Bedside monitoring (no Shell wrapping) */}
        <Route
          path="/patients/:patientId/monitor"
          element={
            <RequireAuth>
              <BedsidePage />
            </RequireAuth>
          }
        />

        <Route
          path="/patients/:patientId/calibration"
          element={
            <RequireAuth>
              <CalibrationPage />
            </RequireAuth>
          }
        />

        <Route
          path="/patients/:patientId/setup-mappings"
          element={
            <RequireAuth>
              <PatientSetupPage />
            </RequireAuth>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
