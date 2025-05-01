import jwt, { SignOptions } from "jsonwebtoken";
import { IUser } from "../domain/User";
import UserRepository from "../infrastructure/repositories/userRepository";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in .env");
}

const tokenService = {
  generateToken: (user: IUser, expiresIn: string | number) => {
    if (typeof expiresIn !== "string" && typeof expiresIn !== "number") {
      throw new Error("expiresIn must be a valid string or number");
    }

    const options: SignOptions = {
      expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
    };

    return jwt.sign(
      { id: user._id, email: user.email, role: user.role, status : user.userStatus },
      JWT_SECRET,
      options
    );
  },
  async refreshToken(token: string) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
      if (!payload.id) throw new Error("Invalid token");
      const user = await UserRepository.findById(payload.id);
      if (!user) throw new Error("User not found");

      const userData = user as IUser;

      const newAccessToken = this.generateToken(userData, "15m");

      return { accessToken: newAccessToken };
    } catch (error) {
      throw new Error("Invalid or expired refresh token");
    }
  },
};

export default tokenService;
