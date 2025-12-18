import { useMemo } from "react";

import { trainingApi } from "@/services/agent-training.service";
import type { TrainingApi } from "@/services/agent-training.service";

/**
 * Provides a stable reference to the training API service so React hooks
 * depending on these methods do not re-initialize on every render.
 */
export const useTrainingApi = () => {
  return useMemo<TrainingApi>(() => trainingApi, []);
};
