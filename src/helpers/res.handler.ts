import { Response } from "express";

export const responseHandler = (
  res: Response,
  message: string,
  data?: any,
  code?: number
) => {
  return res.status(code || 200).send({
    message,
    data,
  });
};
