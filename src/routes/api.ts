import express, {Router, Request, Response, NextFunction} from 'express';
import { sign, verify } from 'jsonwebtoken';

declare global {
    namespace Express {
        export interface Request {
            user: any;
        }
    }
}

let refreshTokens: any = [];

const router: Router = Router();
router.use(express.json());
// set secret to empty if not present
const secret = process.env.ACCESS_TOKEN_SECRET ?? '';
const refreshSecret = process.env.REFRESH_TOKEN_SECRET ?? '';

router.get('/', (req: Request, res: Response) => {
    res.json({
        text: "Hello World!"
    });
});

router.post('/login', (req: Request, res: Response) => {
    // auth user
    const username: string = req.body.username;
    const user = { 
        id: 1,
        name: username,
        role: 'admin'
    };

    const accessToken = generateAccessToken(user);
    const refreshToken = sign({user}, refreshSecret);
    refreshTokens.push(refreshToken);
    res.json({
        access: accessToken,
        refresh: refreshToken
    })
});

router.post('/token', (req: Request, res: Response) => {

    const refreshToken = req.body.token;
    if(refreshToken === null) return res.sendStatus(401);
    if(!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
    verify(refreshToken, refreshSecret, (err: any, data: any) => {
        if(err) return res.sendStatus(403);

        const accessToken = generateAccessToken(data.user);
        res.json({ access: accessToken });
    });
});

router.get('/protected', authenticateToken, (req: Request, res: Response) => {

    res.json({
        status: "OK",
        user: req.user
    })
});

router.delete('/logout', (req: Request, res: Response) => {

    refreshTokens = refreshTokens.filter((token: string) => token !== req.body.token);
    res.sendStatus(204);
});

function generateAccessToken(user: any) {
    return sign({user}, secret, { expiresIn: '15m'});
};

function authenticateToken(req: Request , res: Response, next: NextFunction) {

    const bearerHeader = req.headers.authorization;
    const bearerToken = bearerHeader && bearerHeader.split(' ')[1];

    if(bearerToken === undefined) return res.sendStatus(401);

    verify(bearerToken, secret, function(err: any, data: any) {
        if(err) return res.sendStatus(403);
        req.user = data.user;
        next();
    });
};

export default router;