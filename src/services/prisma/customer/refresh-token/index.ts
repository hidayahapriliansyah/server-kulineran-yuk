import { Customer } from '@prisma/client';
import { Request } from 'express';
import prisma from '../../../../db';
import { Unauthenticated } from '../../../../errors';
import { isRefreshTokenValid } from '../../../../utils/jwt';
import { TokenExpiredError } from 'jsonwebtoken';
import { PayloadDataRefreshToken } from '../../../../utils/createJwtPayloadData';

const validateRefreshToken = async (
  req: Request,
): Promise<Customer | Error> => {
  const {
    refreshTokenValidator,
    token,
  } = req.params;

  const isRequestRefreshTokenValid = await prisma.customerRefreshTokenValidation.findUnique({
    where: { id: refreshTokenValidator, hasUsed: false },
  });
  if (!isRequestRefreshTokenValid) {
    throw new Unauthenticated('Refresh token is not valid.');
  }

  try {
    const payloadRefreshToken = isRefreshTokenValid({
      token,
      userType: 'customer',
    }) as PayloadDataRefreshToken;
    const customer = await prisma.customer.findUnique({
      where: { id: payloadRefreshToken.id },
    });
    await prisma.customerRefreshTokenValidation.update({
      where: { id: isRequestRefreshTokenValid.id },
      data: { hasUsed: true },
    });
    return customer!;
  } catch (error: any) {
    if (error instanceof TokenExpiredError) {
      error.message = 'jwt expired |REFRESH_TOKEN';
    }
    throw error;
  }
};

export {
  validateRefreshToken,
};
