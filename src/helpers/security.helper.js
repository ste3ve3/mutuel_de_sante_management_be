import Jwt from 'jsonwebtoken';

export const generateAccessToken = (user, res) => {
  clearCookie(res);

  let token = Jwt.sign(
    { data: user },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: '5 days',
    },
  );
  
  //Generating cookie
  res.cookie('accessTokenCookie', token, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });
  return token;
};

/// Returns user data from token
export const verifyAccessToken = token => {
  return Jwt.verify(String(token), process.env.ACCESS_TOKEN_SECRET);
};

export const clearCookie = res => {
  res.clearCookie('accessTokenCookie', {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  }); 
};