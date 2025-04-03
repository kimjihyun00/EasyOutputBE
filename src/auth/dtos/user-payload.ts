export class UserPayload {
  private _memberId: bigint;
  private _email: string;
  private _role: string;

  constructor(memberId: bigint, email: string, role: string) {
    this._memberId = memberId;
    this._email = email;
    this._role = role;
  }

  get memberId(): bigint {
    return this._memberId;
  }

  get email(): string {
    return this._email;
  }

  get role(): string {
    return this._role;
  }

  toJSON() {
    return {
      memberId: this._memberId,
      email: this._email,
      role: this._role,
    };
  }
}
