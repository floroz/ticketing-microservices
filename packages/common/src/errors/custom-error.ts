export abstract class CustomError extends Error {
    constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, new.target.prototype);
    }
  
  abstract get normalizedResponse(): { errors: { message: string }[] };
  abstract statusCode: number;
}