import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
  name: string;
  email: string;
  role: string;
}

export const authMiddleware = (
  req: Request & { user?: JwtPayload },
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as JwtPayload;

    req.user = decoded; // 🔥 attach user
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default authMiddleware;
