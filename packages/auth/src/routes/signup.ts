import { Router, Request, Response, NextFunction } from "express";
import { body } from "express-validator";
import { DatabaseConnectionError } from "../errors/database-connection-error";
import { User } from "../models/user";
import { GenericError } from "../errors/generic-error";
import { JWTService } from "../services/jwt";
import { validateRequest } from "../middlewares/validate-request";

const router = Router();

router.post(
  "/signup",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters"),
   validateRequest,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    // 1. check if user exits
    try {
      const existing = await User.findOne({ email });

      if (existing) {
        return next(new GenericError("Invalid email or password"));
      }
    } catch (error) {
      console.log(error);
      return next(new DatabaseConnectionError());
    }

    // 2. create user
    // TODO: how to manage admin role creation?
    try {
      const userDoc = await User.build({ email, password }).save();

      const token = JWTService.generateToken({
        id: userDoc.id,
        email: userDoc.email,
        role: userDoc.role,
      });

      req.session = {
        token,
      }

      return res.status(201).send(userDoc);
    } catch (error) {
      console.log(error);
      return next(new DatabaseConnectionError());
    }
  }
);

export { router as signupRouter };
