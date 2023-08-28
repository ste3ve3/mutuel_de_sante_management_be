import studentsModel from "../models/studentsModel.js";
import mongoose from "mongoose";
import studentValidationSchema from "../validations/studentValidation.js";
import { sendEmail } from "../helpers/nodemailer.js";
import studentLoginValidationSchema from "../validations/studentLoginValidation.js";


const createNewStudent = async (request, response) => {
  const { error } = studentValidationSchema.validate(request.body);

  if (error)
    return response.status(400).json({ message: error.details[0].message });

  const normalUser = await studentsModel.findOne({
    regNumber: request.body.regNumber
  });

  if (normalUser)
    return response.status(409).json({
      message: "A student with this registration number is already registered!",
    });

  try {
    const newUser = new studentsModel({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      regNumber: request.body.regNumber,
    });

    await newUser.save();

    if(request.body.studentEmail) {
        sendEmail({
            to: request.body.studentEmail,
            subject: "You have been registered!",
            html: `
                  <div style="padding: 10px 0;">
                      <p style="font-size: 16px;"> Hello ${newUser.firstName} ${newUser.lastName}, you have been registered to the Official Students Announcements App! You can now login into the app using your registration number as the username and password.  </p> 
                  </div>
                  `,
        });
    }

    response.status(201).json({
      successMessage:
      request.body.studentEmail ? "Student registered successfully and a notification email was sent to the registered student!" : "Student registered successfully!",
      addedStudent: newUser
    });
  } catch (error) {
    response.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

const loginStudent = async (request, response) => {
  const { error } = studentLoginValidationSchema.validate(request.body);
  if (error)
    return response.status(400).json({ message: error.details[0].message });
  
  try {
    const getUser = await studentsModel.findOne({ regNumber: request.body.regNumber });

    if (!getUser)
    return response.status(400).json({
    message: "Registration number not found in our system!",
    });

    if (request.body.regNumber !== request.body.password)
    return response.status(400).json({
    message: "Invalid login credentials!",
    });

    response.status(200).json({
      successMessage: "Logged In Successfully!",
      data: getUser
    });
    
  } catch (error) {
    response.status(500).json({
      status: "Fail",
      message: error.message,
    });
  }
};

const getAllStudents = async (request, response) => {
  try {
    const RegisterUsers = await studentsModel.find().sort({ createdAt: -1 })

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

const deleteStudent = async (req, res) => {
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
      await studentsModel.findByIdAndDelete(req.query.userId)
    if (!user) {
      throw new Error(
        "The student you're trying to delete does no longer exist",
      );
    }

    res.status(200).json({
      successMessage: 'Student deleted Successfully!',
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};


export default {
  createNewStudent,
  loginStudent,
  getAllStudents,
  deleteStudent
};