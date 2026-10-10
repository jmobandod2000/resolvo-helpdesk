interface JwtClaims {
  exp?: number;
}

const decodeClaims = (jwt: string): JwtClaims | null => {
  try {
    const [, payload] = jwt.split('.');
    if (!payload) return null;
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as JwtClaims;
  } catch {
    return null;
  }
};

export const isJwtExpired = (jwt: string) => {
  const claims = decodeClaims(jwt);
  if (!claims?.exp) return true;
  return claims.exp * 1000 <= Date.now();
};
