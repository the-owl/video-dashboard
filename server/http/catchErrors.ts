import * as express from 'express';


export function catchErrors(handler: (req: express.Request, res: express.Response) => Promise<any>) {
  return async (req: express.Request, res: express.Response) => {
    try {
      await handler(req, res);
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  };
}
