import { useState } from "react";
import { AppProvider, useApp } from "./state/store";
import Onboarding from "./onboarding/Onboarding";
import BottomNav, { type TabId } from "./components/BottomNav";
import Home from "./screens/Home";
import Study from "./screens/Study";
import Goals from "./screens/Goals";
import Habits from "./screens/Habits";
import Profile from "./screens/Profile";
import Impact from "./screens/Impact";

function MainApp() {
  const [tab, setTab] = useState<TabId>("home");
  const [impactOpen, setImpactOpen] = useState(false);

  if (impactOpen) {
    return (
      <div className="app-shell">
        <Impact onBack={() => setImpactOpen(false)} />
      </div>
    );
  }

  return (
    <div className="app-shell">
      {tab === "home" && <Home />}
      {tab === "study" && <Study />}
      {tab === "goals" && <Goals />}
      {tab === "habits" && <Habits />}
      {tab === "profile" && <Profile onNavigate={setTab} onOpenImpact={() => setImpactOpen(true)} />}
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}

function Root() {
  const { state } = useApp();
  if (!state.profile.onboarded) return <Onboarding />;
  return <MainApp />;
}

export default function App() {
  return (
    <AppProvider>
      <Root />
    </AppProvider>
  );
}
