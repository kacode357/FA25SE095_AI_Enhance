"use client";

import React from "react";

import { AgentTrainingHubProvider } from "@/contexts/agent-training-hub-context";

export const AgentTrainingLayoutShell: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <AgentTrainingHubProvider>
    <div className="p-5">{children}</div>
  </AgentTrainingHubProvider>
);
