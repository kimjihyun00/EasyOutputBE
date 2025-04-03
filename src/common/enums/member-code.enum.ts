export enum MemberStatus {
  Valid = "VALID",
  Withdraw = "WTD",
  Pending = "PND",
}

export enum MemberRole {
  User = "USER", // 일반 유저
  Admin = "ADMIN", // 관리자 회원
}

export type MemberRoleType = "USER" | "ADMIN";
