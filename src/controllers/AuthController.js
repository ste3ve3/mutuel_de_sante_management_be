import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import userValidationSchema from "../validations/userValidation.js";
import crypto from "crypto";
import {
  generateAccessToken,
  clearCookie,
} from "../helpers/security.helper.js";
import { sendEmail } from "../helpers/nodemailer.js";


const createNewUser = async (request, response) => {
  const { error } = userValidationSchema.validate(request.body);

  if (error)
    return response.status(400).json({ message: error.details[0].message });

  const normalUser = await User.findOne({
    email: request.body.email,
    accountType: "Email",
  });

  const googleUser = await User.findOne({
    email: request.body.email,
    accountType: "Google",
  });

  if (normalUser)
    return response.status(409).json({
      message: `A user with email "${request.body.email}" already exist in our system!`,
    });

  if (googleUser)
    return response.status(409).json({
      message: `This email is already registered with google, try signing in with google!`,
    });

  try {
    const salt = await bcrypt.genSalt();

    const hashedPassword = await bcrypt.hash(request.body.password, salt);

    const hashedRepeatPassword = await bcrypt.hash(
      request.body.repeatPassword,
      salt
    );

    const newUser = new User({
      names: request.body.names,
      nationalId: request.body.nationalId,
      email: request.body.email,
      password: hashedPassword,
      repeatPassword: hashedRepeatPassword,
      emailToken: crypto.randomBytes(64).toString("hex"),
      isVerified: false,
    });

    await newUser.save();

    sendEmail({
      to: newUser.email,
      subject: "Magerwa VCC | Verify your email",
      html: `
            <div style="padding: 10px 0;">
                <p style="font-size: 16px;"> ${newUser.names} welcome to Magerwa VCC! We recieved an offer from someone (hopefully you!) to create an account with us.  </p> 
                <h4> Click the button below to verify your email... </h4>
                <a style="border-radius: 5px; margin-bottom: 10px; text-decoration: none; color: white; padding: 10px; cursor: pointer; background: #00B4D0;" 
                href="http://${request.headers.host}/auth/verifyEmail?token=${newUser.emailToken}"> 
                Verify Email </a>
            </div>
            `,
    });

    response.status(201).json({
      successMessage:
        "Account created successfully, Check your email to verify this account!",
    });
  } catch (error) {
    response.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};


const verifyEmail = async (request, response) => {
  try {
    const token = request.query.token;
    const emailUser = await User.findOne({
      emailToken: token,
    });

    if (emailUser) {
      emailUser.emailToken = null;
      emailUser.isVerified = true;

      await emailUser.save();

      response.redirect(process.env.EMAILVERIFIED_REDIRECT_URL);
    } else {
      response.send("This email is already verified!");
    }
  } catch (error) {
    response.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};


const loginUser = async (request, response) => {
  try {
    const getUser = await User.findOne({ email: request.body.email });

    if (!getUser)
      return response.status(400).json({
        message: "Invalid email or password, Please try again!",
      });

    if (!getUser.isVerified)
      return response.status(400).json({
        message: "Please check your email to verify this account!",
      });

    const userPassword = await bcrypt.compare(
      request.body.password,
      getUser.password
    );

    if (!userPassword)
      return response.status(400).json({
        message: "Invalid email or password, Please try again!",
      });

    const token = generateAccessToken(getUser, response);

    response.status(200).json({
      successMessage: "Logged In Successfully!",
      result: getUser,
      Access_Token: token,
    });
  } catch (error) {
    response.status(500).json({
      status: "Fail",
      message: error.message,
    });
  }
};

const logoutUser = async (request, response) => {
  try {
    clearCookie(response);

    response.status(200).json({
      successMessage: "Logged Out Successfully!",
    });
  } catch (error) {
    response.status(500).json({
      status: "Fail",
      message: error.message,
    });
  }
};

const loggedInUser = async (request, response) => {
  try {
    const { user } = request;

    if (!user) {
      return response.status(401).json({
        message: "User not logged In",
      });
    }
    return response.status(200).json({
      successMessage: "LoggedIn User Fetched Successfully!",
      loggedInUser: user,
    });
  } catch (error) {
    response.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};


const getAllUsers = async (request, response) => {
  try {
    const RegisterUsers = await User.find().sort({ createdAt: -1 })

    response.status(200).json({
      registeredUsers: RegisterUsers,
    });
  } catch (error) {
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const assignUserRole = async (request, response) => {
  try {
    const id = request.query.userId;
    const { role } = request.body;
    if (!role) {
      throw new HttpException(
        400,
        'Role is required!'
      );
    }
    const user =
      await User.findById(id);
    if (!user) {
      throw new HttpException(
        400,
        'User not found!'
      );
    }

    user.role = role;

    const updated = await user.save();

    if(role === "admin") {
      sendEmail({
        to: updated.email,
        subject: "Magerwa VCC | Role Updated!",
        html: `
              <div style="padding: 10px 0;">
                  <p style="font-size: 16px;"> Hello ${updated.names}, we would like to let you know that you have been made an admin on our platform which will give you access to our dashboard where you can customize out site settings.  </p> 
              </div>
              `,
      });
    }

    response.status(200).json({
      successMessage: `Role updated successfully!`,
      updatedUser: updated,
    });
  } catch (error) {
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (
      !req.query.userId ||
      !mongoose.Types.ObjectId.isValid(req.query.userId)
    ) {
      throw new Error(
        !req.query.userId
          ? 'User id required'
          : 'Invalid user id format',
      );
    }
    const user =
      await User.findByIdAndDelete(req.query.userId)
    if (!user) {
      throw new Error(
        "User you're trying to delete does no longer exist",
      );
    }

    res.status(200).json({
      successMessage: 'User deleted Successfully!',
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};


export default {
  createNewUser,
  verifyEmail,
  loginUser,
  logoutUser,
  loggedInUser,
  getAllUsers,
  assignUserRole,
  deleteUser
};