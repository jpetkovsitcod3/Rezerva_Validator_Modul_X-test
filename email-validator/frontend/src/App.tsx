import { useEffect } from "react";
import { ScrollProgress } from "./lib/ui";
import { AuthProvider, Guard, useRoute } from "./lib/auth";
import { ToastProvider } from "./app/ui";
import Sidebar from "./landing/Sidebar";
import MapHero from "./landing/MapHero";
import TrustBar from "./landing/TrustBar";
import PipelineScene from "./landing/PipelineScene";
import Architecture from "./landing/Architecture";
import PricingBand from "./landing/PricingBand";
import CTABand from "./landing/CTABand";
import FooterLanding from "./landing/FooterLanding";
import LandingPage from "./landing/LandingPage";
import Shell from "./app/Shell";
import { RouteTransition } from "./lib/route-transition";
import { LoginPage, SignupPage } from "./app/Auth";
import Overview from "./app/Overview";
import Validator from "./app/Validator";
import History from "./app/History";
import { ApiKeysPage, SettingsPage } from "./app/Account";
import {
  AdminBlocklistPage,
  AdminLogsPage,
  AdminOverviewPage,
  AdminSettingsPage,
  AdminUsersPage,
} from "./app/Admin";

function Landing() {
  return (
    <RouteTransition>
      <div className="lz-dots min-h-screen bg-[var(--color-bg-canvas)] text-[var(--color-text-primary)]">
        <div id="top" className="grid lg:grid-cols-[240px_1fr]">
          <Sidebar />
          <MapHero />
        </div>
        <TrustBar />
        <PipelineScene />
        <Architecture />
        <PricingBand />
        <CTABand />
        <FooterLanding />
      </div>
    </RouteTransition>
  );
}

function AppRoutes() {
  const route = useRoute();

  useEffect(() => {
    if (route !== "/") window.scrollTo(0, 0);
  }, [route]);

  if (route === "/login") return <LoginPage />;
  if (route === "/signup") return <SignupPage />;
  if (route === "/landing") return <LandingPage />;

  if (route.startsWith("/app")) {
    const page =
      route === "/app/validator" ? <Validator />
      : route === "/app/history" ? <History />
      : route === "/app/keys" ? <ApiKeysPage />
      : route === "/app/settings" ? <SettingsPage />
      : <Overview />;
    return (
      <Guard>
        <Shell area="user">{page}</Shell>
      </Guard>
    );
  }

  if (route.startsWith("/admin")) {
    const page =
      route === "/admin/users" ? <AdminUsersPage />
      : route === "/admin/logs" ? <AdminLogsPage />
      : route === "/admin/blocklist" ? <AdminBlocklistPage />
      : route === "/admin/settings" ? <AdminSettingsPage />
      : <AdminOverviewPage />;
    return (
      <Guard admin>
        <Shell area="admin">{page}</Shell>
      </Guard>
    );
  }

  return <Landing />;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ScrollProgress />
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  );
}
