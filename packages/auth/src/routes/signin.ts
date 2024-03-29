import { Request, Response, Router, NextFunction } from "express";
import { body } from "express-validator";

import { PasswordService } from "floroz-ticketing-common";
import { User } from "floroz-ticketing-common";
import { validateRequestMiddleware } from "floroz-ticketing-common";
import { GenericError } from "floroz-ticketing-common";
import { jwtService } from "../services/jwt";

const router = Router();

router.post(
  "/signin",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters"),
    validateRequestMiddleware,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    // 1. check if user exits
    try {
      const existingUserDoc = await User.findOne({ email });

      if (!existingUserDoc) {
        return next(new GenericError("Invalid email or password"));
      }

      // 2. check if passwords match
      const isSamePassword = await PasswordService.compare(
        password,
        existingUserDoc.password
      );

      if (!isSamePassword) {
        return next(new GenericError("Invalid email or password"));
      }

      const token = jwtService.generateToken({
        id: existingUserDoc.id,
        email: existingUserDoc.email,
        role: existingUserDoc.role,
      });

      req.session = {
        token
      }
      return res.status(200).send(existingUserDoc);
    } catch (error) {
      return next(error);
    }
  }
);

export { router as signinRouter };
