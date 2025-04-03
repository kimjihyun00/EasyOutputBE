export const DIARY = {
  TITLE: {
    MAX_LENGTH: 100,
  },
  CONTENT: {
    MIN_LENGTH: 100,
    MAX_LENGTH: 1000,
  },
} as const;

export const CONNECTION_QUESTION = {
  MIN_LENGTH: 30,
  MAX_LENGTH: 100,
} as const;

export const CORRECTION_ANSWER = {
  MAX_COUNT: 3,
} as const;
