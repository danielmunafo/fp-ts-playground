export class EmailInUseError extends Error {
  public static readonly DEFAULT_MESSAGE = "Email is already in use";
  public static readonly DEFAULT_NAME = "EmailInUseError";

  constructor(message: string = EmailInUseError.DEFAULT_MESSAGE) {
    super(message);
    this.name = EmailInUseError.DEFAULT_NAME;
  }
}
