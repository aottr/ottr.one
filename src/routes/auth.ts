import express, { Router, Request, Response } from "express";
import { sign, verify } from "jsonwebtoken";

let refreshTokens: any = [];

const users = [
  {
    id: 1,
    name: "Alex",
    role: "admin",
  },
  {
    id: 2,
    name: "Robert",
    role: "admin",
  },
];

const router: Router = Router();
router.use(express.json());
// set secret to empty if not present
const secret: string = process.env.ACCESS_TOKEN_SECRET ?? "";
const refreshSecret: string = process.env.REFRESH_TOKEN_SECRET ?? "";

if (secret.length == 0 || refreshSecret.length == 0) {
  console.log("JWT Secrets should not be empty.");
  console.log("Stopping server...");
  process.exit(1);
}

router.post("/login", (req: Request, res: Response) => {
  // auth user
  const username: string = req.body.username;
  const user = users.find(u => u.name === username)
  if (user === undefined) return res.sendStatus(403);

  const accessToken = generateAccessToken(user);
  const refreshToken = sign({ user }, refreshSecret);
  refreshTokens.push(refreshToken);
  res.json({
    access: accessToken,
    refresh: refreshToken,
  });
});

router.post("/token", (req: Request, res: Response) => {
  const refreshToken = req.body.token;
  if (refreshToken === null) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
  verify(refreshToken, refreshSecret, (err: any, data: any) => {
    if (err) return res.sendStatus(403);

    const accessToken = generateAccessToken(data.user);
    res.json({ access: accessToken });
  });
});

router.delete("/logout", (req: Request, res: Response) => {
  refreshTokens = refreshTokens.filter(
    (token: string) => token !== req.body.token
  );
  res.sendStatus(204);
});

function generateAccessToken(user: any) {
  return sign({ user }, secret, { expiresIn: "15m" });
}

export default router;