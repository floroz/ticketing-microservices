import bcrypt from 'bcrypt';

export class PasswordService {
// TODO: move to env file - this is for dev/demo purposes only
  private static  saltRounds = 10;

  public static hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  public static compare(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}