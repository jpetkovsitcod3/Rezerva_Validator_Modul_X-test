import { useState } from "react";
import { ConfigProvider } from "antd";
import { MotionConfig } from "framer-motion";
import { darkThemeConfig } from "./theme/darkTheme";
import AppLayout from "./components/Layout/AppLayout";
import SingleValidator from "./components/Validator/SingleValidator";
import BulkValidator from "./components/Validator/BulkValidator";
import DomainInfo from "./components/Validator/DomainInfo";
import DashboardPage from "./components/Dashboard/DashboardPage";
import ParticleBackground from "./components/Common/ParticleBackground";
import "./styles/global.css";

export default function App() {
  const [page, setPage] = useState("dashboard");

  const pages = {
    dashboard: <DashboardPage />,
    single: <SingleValidator />,
    bulk: <BulkValidator />,
    domain: <DomainInfo />,
  };

  return (
    <ConfigProvider theme={darkThemeConfig}>
      <MotionConfig reducedMotion="user">
        <ParticleBackground />
        <AppLayout activePage={page} setActivePage={setPage}>
          <div style={{ position: "relative", zIndex: 1 }}>
            {pages[page]}
          </div>
        </AppLayout>
      </MotionConfig>
    </ConfigProvider>
  );
}
