import jwt, { JwtPayload } from "jsonwebtoken";

interface TokenPayload {
  userId: string;
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "1d",
  });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(
    token,
    process.env.JWT_SECRET as string
  ) as TokenPayload;
};
