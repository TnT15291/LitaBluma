import { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { StoreProvider, useStore } from '@/lib/mock/store';
import { ParentalGate } from '@/features/parental-gate/ParentalGate';
import { ChildHome } from '@/routes/ChildHome';
import { ParentDashboard } from '@/routes/ParentDashboard';
import { ParentWeeklyReport } from '@/routes/ParentWeeklyReport';
import { ParentManage } from '@/routes/ParentManage';
import { ParentPrivacy } from '@/routes/ParentPrivacy';
import { ParentSituations } from '@/routes/ParentSituations';
import { Onboarding } from '@/routes/Onboarding';

export function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </StoreProvider>
  );
}

function AppRoutes() {
  const { onboarded } = useStore();

  // Parental gate state lives at the app root for this prototype. Unlocking
  // lasts for the session only; reload re-locks the parent surface.
  const [parentUnlocked, setParentUnlocked] = useState(false);

  if (!onboarded) {
    // Before consent + a child profile exist, the only destination is setup.
    return (
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<ChildHome />} />
      <Route
        path="/parent"
        element={
          <ParentalGate unlocked={parentUnlocked} onUnlock={() => setParentUnlocked(true)}>
            <ParentDashboard />
          </ParentalGate>
        }
      />
      <Route
        path="/parent/report"
        element={
          <ParentalGate unlocked={parentUnlocked} onUnlock={() => setParentUnlocked(true)}>
            <ParentWeeklyReport />
          </ParentalGate>
        }
      />
      <Route
        path="/parent/manage"
        element={
          <ParentalGate unlocked={parentUnlocked} onUnlock={() => setParentUnlocked(true)}>
            <ParentManage />
          </ParentalGate>
        }
      />
      <Route
        path="/parent/privacy"
        element={
          <ParentalGate unlocked={parentUnlocked} onUnlock={() => setParentUnlocked(true)}>
            <ParentPrivacy />
          </ParentalGate>
        }
      />
      <Route
        path="/parent/situations"
        element={
          <ParentalGate unlocked={parentUnlocked} onUnlock={() => setParentUnlocked(true)}>
            <ParentSituations />
          </ParentalGate>
        }
      />
      {/* Onboarding is done; send stragglers home. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
