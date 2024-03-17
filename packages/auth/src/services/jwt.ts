import { JWTService } from '@ticketing/common';

const jwtService = new JWTService(process.env.JWT_SECRET!);

// Express doesn't have a DI mechanism in place, so we instantiate the singleton here and make it available through the app via module system
export { jwtService };