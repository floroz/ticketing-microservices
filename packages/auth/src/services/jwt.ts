import jwt from 'jsonwebtoken';
import { UserDoc } from '../models/user';

type TokenMetadata = Pick<UserDoc, 'id' | 'email' | 'role'>

export class JWTService {

  static generateToken(metadata: TokenMetadata): string {
    const token = jwt.sign(metadata, process.env.JWT_SECRET!, { expiresIn: '1h' })
    return token;
  }

  static verifyToken(token: string): boolean {
    try {
      jwt.verify(token, process.env.JWT_SECRET!)
      return true
    } catch (error) {
      return false
    }
  }

  static decodeToken(token: string): TokenMetadata {
    if (!this.verifyToken(token)) {
      throw new Error('Invalid token')
    }

    return jwt.decode(token) as TokenMetadata
  }
}