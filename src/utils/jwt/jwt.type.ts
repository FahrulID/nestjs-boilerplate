export type RestOfPayload = { 
    iat: number;
    exp: number;
};

export type AccessTokenMainPayload = {
    uid: string;
    email: string;
    role: string;
};

export type AccessTokenPayload = AccessTokenMainPayload & RestOfPayload;

export type RefreshTokenMainPayload = {
    uid: string;
};

export type RefreshTokenPayload = RefreshTokenMainPayload & RestOfPayload;

export type MailVerificationTokenMainPayload = {
    email: string;
};

export type MailVerificationTokenPayload = MailVerificationTokenMainPayload & RestOfPayload;

export type AccessTokenAndRefreshToken = {
    accessToken: string;
    refreshToken: string;
};