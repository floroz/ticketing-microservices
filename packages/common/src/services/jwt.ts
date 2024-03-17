import jwt from 'jsonwebtoken';
import { UserDoc } from '../models/user';

export type UserPayload = Pick<UserDoc, 'id' | 'email' | 'role'>

export class JWTService {

  constructor(private jwtSecret: string){}

   generateToken(userPayload: UserPayload): string {
    const token = jwt.sign(userPayload, this.jwtSecret, { expiresIn: '1h' })
    return token;
  }

   verify(token: string): UserPayload | null {
    try {
      const payload = jwt.verify(token, this.jwtSecret)

      if (!payload) {
        return null
      }

      return payload as UserPayload;
    } catch (error) {
      return null
    }
  }

   decodeToken(token: string): UserPayload {
    return jwt.decode(token) as UserPayload
  }
}