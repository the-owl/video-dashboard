import * as express from 'express';
import * as jwt from 'jsonwebtoken';

export function authMiddleware(jwtSignKey: string) {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authorization = req.header('authorization');

    if (authorization === undefined) {
      res.sendStatus(401);
      return;
    }

    const [authType, authToken] = authorization.split(' ');

    if (authType !== 'Bearer' || typeof authToken !== 'string') {
      res.sendStatus(401);
      return;
    }

    try {
      jwt.verify(authToken, jwtSignKey);
      next();
    } catch {
      res.sendStatus(401);
    }
  };
}
