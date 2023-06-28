import mongoose from "mongoose";
import carRegistrationModel from "../models/carRegistrationModel.js";
import userModel from "../models/userModel.js";
import registeredCarValidationSchema from "../validations/registeredCarValidation.js";
import { uploadToCloudinary } from "../helpers/upload.js";
import { generateAccessToken } from "../helpers/security.helper.js";
import { Types } from "mongoose";

// Register your car
const registerCar = async (request, response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(request.user?._id)) {
        return response.status(400).json({
          message:
            'Something went wrong, refresh your page and try again!',
        });
      }
      //Validation
      const { error } = registeredCarValidationSchema.validate(request.body);
  
      if (error)
        return response
          .status(400)
          .json({ message: error.details[0].message });
  
       const carImageResult = await uploadToCloudinary(request.body.carImage);
  
      const newRegisteredCar = new carRegistrationModel({
        ...request.body,
        carOwner: request.user?._id,
        carImage: carImageResult.secure_url,
        isPublic: true 
       });
  
      const registeredCar = await newRegisteredCar.save();
      const populatedCar = await registeredCar.populate('carOwner');

      const registeringUser = await userModel.findOne({_id : request.user?._id})
      if(!registeringUser.hasRegisteredCar) {
        registeringUser.hasRegisteredCar = true;
        await registeringUser.save();
        generateAccessToken(registeringUser, response);
      }
  
      response.status(200).json({
        successMessage: `Your ${newRegisteredCar.carName} Car was registered successfully!`,
        carContent: populatedCar,
      });
    } catch (error) {
        response.status(500).json({
          status: 'fail',
          message: error.message,
        });
    }
};


// Get all registered cars
const getRegisteredCars = async (request, response) => {
  try {
    // Populate car owner details
    let query = [
      {
        $lookup: {
          from: "users",
          localField: "carOwner",
          foreignField: "_id",
          as: "ownedBy",
        },
      },
      { $unwind: "$ownedBy" },
    ];

    // Search functionality
    if (request.query.keyword && request.query.keyword != "") {
      query.push({
        $match: {
          $or: [
            {
              carName: { $regex: request.query.keyword, $options: "i" },
            },
            {
              brand: { $regex: request.query.keyword, $options: "i" },
            },
            {
              model: { $regex: request.query.keyword, $options: "i" },
            },
            {
              year: { $regex: request.query.keyword, $options: "i" },
            },
            {
              bodyType: { $regex: request.query.keyword, $options: "i" },
            },
            {
              carPrice: { $regex: request.query.keyword, $options: "i" },
            }, 
          ],
        },
      });
    }

    // Filter cars by year
    if (request.query.year && request.query.year !== "All") {
      query.push({
        $match: {
          year: request.query.year,
        },
      });
    }

    // Filter cars by brand
    if (request.query.brand && request.query.brand !== "All") {
      query.push({
        $match: {
          brand: request.query.brand,
        },
      });
    }

    // Show only public cars
    if (request.query.all !== "admin") {
      query.push({
        $match: {
          isPublic: true,
        },
      });
    }

    // Sort functionality
    if (request.query.sortBy && request.query.sortOrder) {
      var sort = {};
      sort[request.query.sortBy] = request.query.sortOrder == "asc" ? 1 : -1;
      query.push({
        $sort: sort,
      });
    } else {
      query.push({
        $sort: { createdAt: -1 },
      });
    }

    // Pagination functionality
    let total = await carRegistrationModel.countDocuments(query);
    let page = request.query.page ? parseInt(request.query.page) : 1;
    let perPage = request.query.perPage ? parseInt(request.query.perPage) : 4;  
    let skip = (page - 1) * perPage;
    query.push({
      $skip: skip,
    });
    query.push({
      $limit: perPage,
    });

    const allCars = await carRegistrationModel.aggregate(query);
    
    if (allCars) {
      response.status(200).json({
        data: allCars.map((doc) => carRegistrationModel.hydrate(doc)),
        paginationDetails: {
          total: total,
          availableData: allCars.length,
          currentPage: page,
          perPage: perPage,
          totalPages: Math.ceil(total / perPage),
        },
      });
    } else {
      response.status(400).json({ message: "No car found!" });
    }
  } catch (error) {
    response.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Get all registered cars
const userRegisteredCars = async (request, response) => {
  try {
    // Populate car owner details
    let query = [
      {
        $lookup: {
          from: "users",
          localField: "carOwner",
          foreignField: "_id",
          as: "ownedBy",
        },
      },
      { $unwind: "$ownedBy" },
      {
        $match: {
          carOwner: new Types.ObjectId(request.user?._id),
        },
      },
    ];

    // Search functionality
    if (request.query.keyword && request.query.keyword != "") {
      query.push({
        $match: {
          $or: [
            {
              carName: { $regex: request.query.keyword, $options: "i" },
            },
            {
              brand: { $regex: request.query.keyword, $options: "i" },
            },
            {
              model: { $regex: request.query.keyword, $options: "i" },
            },
            {
              year: { $regex: request.query.keyword, $options: "i" },
            },
            {
              bodyType: { $regex: request.query.keyword, $options: "i" },
            },
            {
              carPrice: { $regex: request.query.keyword, $options: "i" },
            }, 
          ],
        },
      });
    }


    // Show only public cars
    if (request.query.all !== "admin") {
      query.push({
        $match: {
          isPublic: true,
        },
      });
    }

    // Sort functionality
    if (request.query.sortBy && request.query.sortOrder) {
      var sort = {};
      sort[request.query.sortBy] = request.query.sortOrder == "asc" ? 1 : -1;
      query.push({
        $sort: sort,
      });
    } else {
      query.push({
        $sort: { createdAt: -1 },
      });
    }

    // Pagination functionality
    let total = await carRegistrationModel.countDocuments(query);
    let page = request.query.page ? parseInt(request.query.page) : 1;
    let perPage = request.query.perPage ? parseInt(request.query.perPage) : 6;  
    let skip = (page - 1) * perPage;
    query.push({
      $skip: skip,
    });
    query.push({
      $limit: perPage,
    });

    const allCars = await carRegistrationModel.aggregate(query);

    if (allCars) {
      response.status(200).json({
        data: allCars.map((doc) => carRegistrationModel.hydrate(doc)),
        paginationDetails: {
          total: total,
          availableData: allCars.length,
          currentPage: page,
          perPage: perPage,
          totalPages: Math.ceil(total / perPage),
        },
      });
    } else {
      response.status(400).json({ message: "No car found!" });
    }
  } catch (error) {
    response.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};


export default {
    registerCar,
    getRegisteredCars,
    userRegisteredCars
};