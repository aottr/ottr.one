import express, { Router, Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";

const router: Router = Router();
router.use(express.json());
// set secret to empty if not present
const secret = process.env.ACCESS_TOKEN_SECRET ?? "";

router.get("/", (req: Request, res: Response) => {
  res.json({
    text: "Hello World!",
  });
});

router.get("/protected", authenticateToken, (req: Request, res: Response) => {
  res.json({
    status: "OK",
    user: res.locals.user,
    token: res.locals.token
  });
});

function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const bearerHeader = req.headers.authorization;
  const bearerToken = bearerHeader && bearerHeader.split(" ")[1];

  if (bearerToken === undefined) return res.sendStatus(401);

  verify(bearerToken, secret, function (err: any, data: any) {
    if (err) return res.sendStatus(403);
    res.locals.user = data.user;
    res.locals.token = { iat: data.iat, exp: data.exp };
    next();
  });
}

export default router;
