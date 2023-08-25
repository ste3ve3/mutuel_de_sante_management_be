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

  if (normalUser)
    return response.status(409).json({
      message: `A user with email "${request.body.email}" already exist in our system!`,
    });

  try {
    const salt = await bcrypt.genSalt();

    const hashedPassword = await bcrypt.hash(request.body.password, salt);

    const newUser = new User({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      email: request.body.email,
      password: hashedPassword,
      isVerified: false,
    });

    await newUser.save();

    sendEmail({
      to: newUser.email,
      subject: "Announcements Manager | Account created!",
      html: `
            <div style="padding: 10px 0;">
                <p style="font-size: 16px;"> Hello, ${newUser.firstName} ${newUser.lastName} welcome to the announcements manager admin portal! Your account was created successfully and is being reviewed for approval. You will get an email from us once your account is approved!  </p> 
            </div>
            `,
    });

    response.status(201).json({
      successMessage:
        "Account created successfully, We will reach out throught your email once this account is approved!",
    });
  } catch (error) {
    response.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};


const confirmUser = async (request, response) => {
  try {
    const userId = request.query.userId;
    const reviewedUser = await User.findOne({
      _id: userId,
    });

    if (reviewedUser) {
      reviewedUser.isVerified = request.body.isVerified;

      await reviewedUser.save();

      if(reviewedUser.isVerified) {
        sendEmail({
          to: reviewedUser.email,
          subject: "Announcements Manager | Account approved!",
          html: `
                <div style="padding: 10px 0;">
                    <p style="font-size: 16px;"> Hello again ${reviewedUser.firstName}, Your account was approved! You can now access the announcement manager admin portal.  </p> 
                </div>
                `,
        });
      }

      response.status(201).json({
        successMessage:
          "User approved successfully!",
        updatedUser: reviewedUser
      });
    }

    else {
      response.status(201).json({
        message:
          "User not found!",
      });
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
          message: "Account not approved!",
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
        data: getUser,
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
  confirmUser,
  loginUser,
  logoutUser,
  loggedInUser,
  getAllUsers,
  deleteUser
};