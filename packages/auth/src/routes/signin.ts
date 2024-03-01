import { Request, Response, Router, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { RequestValidationError } from "../errors/request-validation-errors";
import { PasswordService } from "../services/password";
import { User } from "../models/user";
import { JWTService } from "../services/jwt";

const router = Router();

router.post(
  "/signin",
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
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).send("Invalid email or password");
      }

      // 2. check if passwords matche
      const isSamePassword = await PasswordService.compare(
        password,
        user.password
      );

      if (!isSamePassword) {
        return res.status(400).send("Invalid email or password");
      }

      const token = JWTService.generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "test",
      });

      return res.status(200).send({ token });
    } catch (error) {
      return next(error);
    }
  }
);

export { router as signinRouter };
