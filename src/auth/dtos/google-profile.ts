export class GoogleProfile {
  private readonly _email: string;
  private readonly _displayName: string;
  private readonly _provider: string;
  private readonly _externalId: string;
  private readonly _accessToken: string;
  private readonly _refreshToken: string;

  constructor(arg: {
    email: string;
    displayName: string;
    provider: string;
    externalId: string;
    accessToken: string;
    refreshToken: string;
  }) {
    this._email = arg.email;
    this._displayName = arg.displayName;
    this._provider = arg.provider;
    this._externalId = arg.externalId;
    this._accessToken = arg.accessToken;
    this._refreshToken = arg.refreshToken;
  }

  get email(): string {
    return this._email;
  }

  get displayName(): string {
    return this._displayName;
  }

  get provider(): string {
    return this._provider;
  }

  get externalId(): string {
    return this._externalId;
  }

  get accessToken(): string {
    return this._accessToken;
  }

  get refreshToken(): string {
    return this._refreshToken;
  }
}
