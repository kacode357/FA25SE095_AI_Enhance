import React from "react";

import { AgentTrainingLayoutShell } from "@/app/admin/agent-train-ai/components/agent-training/AgentTrainingLayoutShell";

const AgentTrainingLayout = ({ children }: { children: React.ReactNode }) => {
  return <AgentTrainingLayoutShell>{children}</AgentTrainingLayoutShell>;
};

export default AgentTrainingLayout;
