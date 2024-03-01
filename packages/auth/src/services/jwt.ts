import jwt from 'jsonwebtoken';
import { UserDoc } from '../models/user';

export type UserPayload = Pick<UserDoc, 'id' | 'email' | 'role'>

export class JWTService {

  static generateToken(userPayload: UserPayload): string {
    const token = jwt.sign(userPayload, process.env.JWT_SECRET!, { expiresIn: '1h' })
    return token;
  }

  static verify(token: string): UserPayload | null {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!)

      if (!payload) {
        return null
      }

      return payload as UserPayload;
    } catch (error) {
      return null
    }
  }

  static decodeToken(token: string): UserPayload {
    return jwt.decode(token) as UserPayload
  }
}