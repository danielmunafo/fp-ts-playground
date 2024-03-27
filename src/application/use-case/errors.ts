export class EmailInUseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailInUseError";
  }
}
