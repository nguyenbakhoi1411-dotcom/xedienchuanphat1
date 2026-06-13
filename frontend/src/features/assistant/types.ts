export type AssistantStatus = {
  enabled: boolean;
  mode: string;
  message: string;
  quickQuestions: string[];
};

export type AssistantMetric = {
  label: string;
  value: number;
  unit: string;
};

export type AssistantLink = {
  label: string;
  href: string;
};

export type AssistantProposedAction = {
  actionType: string;
  title: string;
  description: string;
  payload: Record<string, unknown>;
  requiresConfirmation: boolean;
};

export type AssistantResponse = {
  enabled: boolean;
  intent: string;
  answer: string;
  metrics: AssistantMetric[];
  warnings: string[];
  links: AssistantLink[];
  suggestions: string[];
  proposedAction?: AssistantProposedAction | null;
};

export type AssistantMessage = {
  role: "user" | "assistant";
  text: string;
  response?: AssistantResponse;
};
