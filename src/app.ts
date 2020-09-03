import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';

// init config
dotenv.config();

let port = process.env.SERVER_PORT;
const app: Application = express();

import apiRoutes from './routes/api';
app.use('/api', apiRoutes);

// configure express for ejs
app.set('views', path.join( __dirname, 'views' ));
app.set('view engine', 'ejs');

app.get('/', (req: Request, res: Response) => {
    res.render('index');
}); 

// start express server
app.listen(port, () => {
    console.log(`server startet at http://localhost:${ port }`)
});