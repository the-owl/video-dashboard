import * as express from 'express';
import * as jwt from 'jsonwebtoken';

const AUTH_TOKEN_COOKIE = 'authtoken';

export function jwtAuthMiddleware(
  jwtSignKey: string,
  tokenExtractor: (req: express.Request) => string | null,
  redirect?: string
) {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    function reject() {
      if (typeof redirect === 'string') {
        res.redirect(redirect);
      } else {
        res.sendStatus(401);
      }
    }

    try {
      const authToken = tokenExtractor(req);
      if (authToken === null) {
        reject();
        return;
      }
      jwt.verify(authToken, jwtSignKey);
      next();
    } catch {
      reject();
    }
  };
}

export function authorizationHeaderTokenExtractor(req: express.Request): string | null {
  const authorization = req.header('authorization');

  if (authorization === undefined) {
    return null;
  }

  const [authType, authToken] = authorization.split(' ');

  if (authType !== 'Bearer' || typeof authToken !== 'string') {
    return null;
  }

  return authToken;
}

export function cookieTokenExtractor(req: express.Request): string | null {
  const authToken = req.cookies?.[AUTH_TOKEN_COOKIE] as string | undefined;

  return authToken ?? null;
}
