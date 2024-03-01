import { Router, Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { RequestValidationError } from "../errors/request-validation-errors";
import { DatabaseConnectionError } from "../errors/database-connection-error";
import { User } from "../models/user";
import { GenericError } from "../errors/generic-error";
import { JWTService } from "../services/jwt";

const router = Router();

router.post(
  "/signup",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters"),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return next(new RequestValidationError(errors.array()));
    }

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
      const user = await User.build({ email, password }).save();

      const token = JWTService.generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'test',
    });

      return res.status(201).send();
    } catch (error) {
      console.log(error);
      return next(new DatabaseConnectionError());
    }
  }
);

export { router as signupRouter };
