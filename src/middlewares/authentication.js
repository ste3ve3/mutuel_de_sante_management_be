import Jwt from 'jsonwebtoken';
import { verifyAccessToken } from '../helpers/security.helper.js';

const authLogin = async (request, response, next) => {
  const token = request.cookies.accessTokenCookie;

  if (!token) {
    return response.status(401).json({
      message: 'Please Login to continue!',
    });
  } else {
    try {
      var decoded = verifyAccessToken(token);
      if (decoded) {
        request.user = decoded.data;
        request.token = token;
      } else {
        return response.status(401).json({
          message: 'Please Login to continue!',
        });
      }
    } catch (error) {
      return response.status(401).json({
        message: 'Please Login to continue!',
      });
    }
    next();
  }
};

const checkRole = async (request, response, next, role) => {
  try {
    const token = request.cookies.accessTokenCookie;
    if (!token) {
      return response.status(401).json({
        message: 'Please Login to continue!',
      });
    }
    const { data: user } = verifyAccessToken(token);
    if (!user) {
      return response.status(401).json({
        message: 'Please Login to continue!',
      });
    }

    if (
      !user.role.includes(role || 'none') &&
      user.role !== 'admin'
    ) {
      return response.status(403).json({
        message: `Unauthorized! You must be the ${role
          .split('_')
          .join(' ')} to perform this action`,
      });
    }
    request.user = user;
    request.token = token;
    next();
  } catch (error) {
    return response.status(401).json({
      message: error.message,
      message: 'Please Login to continue!',
    });
  }
};

const isAdmin = (req, res, next) =>
  checkRole(req, res, next, 'admin');

export default {
    authLogin,
    isAdmin
  };