import jwt from 'jsonwebtoken';
import { UserDoc } from '../models/user';

type TokenMetadata = Pick<UserDoc, 'id' | 'email' | 'role'>


export class JWTService {
  // TODO: this would live in a .env file
  // ?? nullish coalesence used for local dev env
  private static PRIVATE_KEY = process.env.JWT_SECRET ?? 'secret_key'

  public static generateToken(metadata: TokenMetadata): string {
    return jwt.sign(metadata, this.PRIVATE_KEY, { expiresIn: '1h'})
  }

  public static verifyToken(token: string): boolean {
    try {
      jwt.verify(token, this.PRIVATE_KEY)
      return true
    } catch (error) {
      return false
    }
  }

  public static decodeToken(token: string): TokenMetadata {
    if (!this.verifyToken(token)) {
      throw new Error('Invalid token')
    }

    return jwt.decode(token) as TokenMetadata
  }
}