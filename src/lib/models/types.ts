// --- Enum unions ---

export type StyleProfileStatus = "untrained" | "training" | "ready" | "failed";
export type StyleProfileSourceType = "url" | "paste";
export type CrawlAttemptStatus = "pending" | "success" | "failed";
export type WritingRequestStatus = "queued" | "generating" | "completed" | "failed";

// --- Model types ---

export type StyleProfile = {
  id: string;
  userId: string;
  sourceType: StyleProfileSourceType;
  sourceUrl: string | null;
  trainingText: string | null;
  styleSummary: string;
  status: StyleProfileStatus;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CrawlAttempt = {
  id: string;
  userId: string;
  url: string;
  status: CrawlAttemptStatus;
  httpStatus: number | null;
  extractedText: string | null;
  errorMessage: string | null;
  createdAt: string;
};

export type WritingRequest = {
  id: string;
  userId: string;
  topic: string;
  titleHint: string | null;
  keyPoints: string | null;
  constraints: string | null;
  status: WritingRequestStatus;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GeneratedDraft = {
  id: string;
  writingRequestId: string;
  userId: string;
  content: string;
  version: number;
  isLatest: boolean;
  createdAt: string;
};

// --- API response shapes ---

export type ApiError = {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
};
