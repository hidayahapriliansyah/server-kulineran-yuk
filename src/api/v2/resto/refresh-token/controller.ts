import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { SuccessAPIResponse } from '../../../../global/types';
import * as refreshTokenService from '../../../../services/prisma/resto/refresh-token';
import { Restaurant } from '@prisma/client';
import { createCookieRestoAccessToken } from '../../../../utils/createCookie';
import { createIDToken, createJWTPayloadDataRestoIDToken } from '../../../../utils';

const validateRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await refreshTokenService.validateRefreshToken(req) as Restaurant;
    createCookieRestoAccessToken(res, result);

    const restoIdToken = createIDToken({
      payload: createJWTPayloadDataRestoIDToken(result),
      userType: 'resto',
    });

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Refresh token is valid', {
        userId: restoIdToken,
      }));
  } catch (error: any) {
    next(error);
  }
};

export {
  validateRefreshToken,
};


// cara bikin taktik refresh token
/**
 * ketika sigin berhasil, maka server membuat 3 token
 * 1. access token
 * 2. id token
 * 3. refresh token
 * 
 * access token
 * fungsi: sebagai identitas utama pengguna yang penting untuk query backedn 
 * payload: id, email
 * tempat disimpan: cookie
 * 
 * id token
 * fungsi: sebagai id konten di client (front-end) 
 * payload: username, avatar, name, email
 * tempat disimpan: localStorage
 * 
 * refresh token
 * fungsi: sebagai refresh mendapatkan access token lagi jika access token expired, agar user tidak perlu login
 * payload: id
 * tempat disimpan: localStorage
 * 
 * TAKTIK
 * 1. Ketika signin berhasil:
 * maka server akan melakukan
 * - membuat cookie access token
 * - mengirim refresh token dan id token melalui response json
 * 
 * aturannya
 * kalau id token kita juga simpan secret jwt nya di kode client
 * sehingga kode bisa dibuka payloadnya dan diconsume datanya
 * 
 * untuk access token dan refresh token secretnya tetep di server
 * NAH SKENARIO BIAR REFRESH TOKEN GG
 * ketika error jwt TokenExpiredError, (bukan JsonWebTokenError)
 * si server nge create kode unique yang nanti disimpan di db dan dikirim sebagai response json
 * nah si kode unique itu di record tablenya punya isUsed yang nandain udah dipakai atau belom
 * nah ketika diterima dan client tahu itu token isexpired
 * si client langsung ngirimin si refresh token + kode unique itu
 * kode unique itu jadi pertanda kalau requestnya valid
 * kode unique diterima di server, dicocokan di database
 * kalau cocok terusin cek refresh tokennya
 * kalau gak cocok unique string nya ya unauthenticated eror
 * terus cek refresh token, cocok, create access token baru, dengan refresh token
 * yang sama hehehe.
 * 
 * KALAU IDTOKEN BERISI AVATAR, EMAIL, USERNAME, DAN NAME,
 * ITU ARTINYA SETIAP KALI UPDATE PROFILE HARUS ADA PERUBAHAN ID TOKEN DI LOCAL STORAGE
 * BAIKLAH.
 */