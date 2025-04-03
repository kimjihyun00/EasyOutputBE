/**
 * {MODULE}_{ACTION}_{DETAIL}
 * 00000
 * - AUTH_*   [1____]: 인증 관련 에러
 * - AUTHZ_*  [2____]: 권한(Authorization) 관련 에러
 * - USER_*   [3____]: 사용자 관련 에러
 * - DIARY_*  [4____]: 일기 관련 에러
 * - OPENAI_* [5____]: openai 관련 에러 처리
 * - SYS_*    [0____]: 시스템 내부 에러
 */
export const ERROR_CODES = {
  SYS_ERROR: { code: "00000", message: "Internal server error." },
  /**
   *
   * AUTH_*   [1____]: 인증 관련 에러
   */
  AUTH_INVALID_TOKEN: {
    code: "10001",
    message: "Invalid authentication token.",
  },
  AUTH_UNAUTHORIZED: {
    code: "10002",
    message: "Unauthorized access. Please Login in first.",
  },
  AUTH_WRONG_PASSWORD: {
    code: "10003",
    message: "Wrong password",
  },
  /**
   *
   * AUTHZ_*  [2____]: 권한(Authorization) 관련 에러
   */
  AUTHZ_NOT_DIARY_OWNER: {
    code: "20001",
    message: "You are not the owner of this diary.",
  },
  /**
   *
   * USER_*   [3____]: 사용자 관련 에러
   */
  USER_NOT_FOUND: { code: "30001", message: "User not found." },
  USER_DUPLICATE: {
    code: "30002",
    message: "This email already exists.",
  },
  /**
   *
   * DIARY_*  [4____]: 일기 관련 에러
   */
  DIARY_NOT_FOUND: {
    code: "40001",
    message: "The diary does not exist.",
  },
  DIARY_REVISION_EXIST: {
    code: "40002",
    message: "A revision for this diary already exists.",
  },
  DIARY_REVISION_NOT_FOUND: {
    code: "40003",
    message: "The diary revision does not exist",
  },
  DIARY_QUESTION_INVALID_COUNT: {
    code: "40004",
    message: "The number of questions exceeds the allowed limit.",
  },
  /**
   *
   * OPENAI_* [5____]: openai 관련 에러 처리
   */
  OPENAI_UNKNOWN_ERROR: {
    code: "50001",
    message: "An unknown error occurred while processing the OpenAI request",
  },
  OPENAI_RESPONSE_PARSING_ERROR: {
    code: "50002",
    message: "Failed to parse the response from OpenAI.",
  },
} as const;
