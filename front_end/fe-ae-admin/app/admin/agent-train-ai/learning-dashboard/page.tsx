"use client";

import React, { useEffect } from "react";

import wsService from "@/services/agent-training.websocket";
import { ErrorBoundary } from "../../components/agent-training/ErrorBoundary";
import { LearningDashboard as LearningDashboardInner } from "../../components/agent-training/LearningDashboard";

const LearningDashboardPage: React.FC = () => {
  useEffect(() => {
    wsService.connect();
  }, []);

  return (
    <div className="space-y-4 p-5">
      <ErrorBoundary>
        <LearningDashboardInner />
      </ErrorBoundary>
    </div>
  );
};

export default LearningDashboardPage;
