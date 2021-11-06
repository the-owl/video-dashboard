import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { catchErrors } from './catchErrors';

export function login(correctPasswordHash: string, jwtSignKey: string, jwtLifetime: string) {
  return catchErrors(async (req: express.Request, res: express.Response) => {
    const password = req.body.password;
    const matches = await bcrypt.compare(password, correctPasswordHash);

    if (matches) {
      const token = jwt.sign({
        issuedAt: String(Date.now()),
      }, jwtSignKey, {
        expiresIn: jwtLifetime,
      });
      res.status(200).json({
        token,
      });
    } else {
      res.status(400).json({
        error: 'Invalid password',
      });
    }
  });
}
