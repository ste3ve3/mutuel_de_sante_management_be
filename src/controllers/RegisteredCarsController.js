import mongoose from "mongoose";
import carRegistrationModel from "../models/carRegistrationModel.js";
import auctionModel from "../models/auctionModel.js";
import userModel from "../models/userModel.js";
import registeredCarValidationSchema from "../validations/registeredCarValidation.js";
import { uploadToCloudinary } from "../helpers/upload.js";
import { generateAccessToken } from "../helpers/security.helper.js";
import { Types } from "mongoose";
import { sendEmail } from "../helpers/nodemailer.js";

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

    // Filter by clearance
    if (request.query.cleared == "true") {
      query.push({
        $match: {
          isCleared: true,
        },
      });
    }
    if (request.query.cleared == "false") {
      query.push({
        $match: {
          isCleared: false,
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

    const { date } = request.query;
    function objectIdWithTimestamp(timestamp) {
      /* Convert string date to Date object (otherwise assume timestamp is a date) */
      if (typeof timestamp == 'string') {
        timestamp = new Date(timestamp);
      }

      /* Convert date object to hex seconds since Unix epoch */
      var hexSeconds = Math.floor(timestamp / 1000).toString(16);

      /* Create an ObjectId with that hex timestamp */
      var constructedObjectId = new Types.ObjectId(
        hexSeconds + '0000000000000000',
      );

      return constructedObjectId;
    }
    const where = {};
    if (date) {
      const { year, month, isYearly } = JSON.parse(date);
      if (isYearly) {
        where._id = {
          $gt: objectIdWithTimestamp(`${year}/01/01`),
          $lt: objectIdWithTimestamp(`${Number(year) + 1}/01/01`),
        };
      } else {
        let lt;
        if (Number(month) == 12) {
          lt = objectIdWithTimestamp(`${Number(year) + 1}/01/01`);
        } else {
          const str = `${year}/${Number(month) + 1}/01`;
          lt = objectIdWithTimestamp(str);
        }
        // console.log(lt)
        where._id = {
          $gt: objectIdWithTimestamp(`${year}/${month}/01`),
          $lt: lt,
        };
      }

      query.push({
        $match: where,
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


const carClearance = async (request, response) => {
  try {
    const id = request.query.carId;
    const car =
      await carRegistrationModel.findById(id).populate("carOwner");
    if (!car) {
      throw new HttpException(
        400,
        'Car not found!'
      );
    }
    car.isCleared = true;

    const updated = await car.save();

    sendEmail({
      to: car.carOwner.email,
      subject: "Magerwa VCC | Car Clearance Report",
      html: `
            <div style="padding: 10px 0;">
                <p style="font-size: 16px;"> Hello ${car.carOwner.names}, Magerwa Team here! We would like to let you know that your ${car.carName} car was cleared from Magerwa VCC successfully! </p> 
            </div>
            `,
    });

    response.status(200).json({
      successMessage: `The ${car.carName} car was cleared successfully!`,
      updatedCar: updated,
    });
  } catch (error) {
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const deleteCar = async (req, res) => {
  try {
    if (
      !req.query.carId ||
      !mongoose.Types.ObjectId.isValid(req.query.carId)
    ) {
      throw new Error(
        !req.query.carId
          ? 'Car id required'
          : 'Invalid car id format',
      );
    }
    const car =
      await carRegistrationModel.findByIdAndDelete(req.query.carId)
    if (!car) {
      throw new Error(
        "The car you're trying to delete does no longer exist",
      );
    }

    res.status(200).json({
      successMessage: 'Car deleted Successfully!',
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};


// Add car to auction
const moveToAuction = async (request, response) => {
  try {
    const { carId } = request.query
    if (!mongoose.Types.ObjectId.isValid(carId)) {
      return response.status(400).json({
        message:
          'Something went wrong, refresh your page and try again!',
      });
    }

    const { isEndUser } = request.query;

    const targetedCar = await carRegistrationModel.findOne({ _id: carId }).populate("carOwner");

    if(!targetedCar) {
      return response.status(400).json({
        message:
          'Car not found!',
      });
    }

    const { _id, createdAt, updatedAt, isCleared, isPublic, ...carData } = targetedCar._doc;
    let newAuctionCar;

    if(isEndUser) {
      newAuctionCar = new auctionModel({
        ...carData,
        isPublic: false
       });
    }
    else {
      newAuctionCar = new auctionModel({
        ...carData,
        auctionDate: request.body.auctionDate,
        auctionTime: request.body.auctionTime,
        auctionLocation: request.body.auctionLocation,
        locationMap: request.body.locationMap,
        contactPhone1: request.body.contactPhone1,
        contactPhone2: request.body.contactPhone2,
        contactEmail: request.body.contactEmail,
        isPublic: true 
       });
    }
    

    const auctionCar = await newAuctionCar.save();

    await carRegistrationModel.findByIdAndDelete(carId)

    sendEmail({
      to: targetedCar.carOwner.email,
      subject: "Magerwa VCC | Your Car Moved to Auction",
      html: `
            <div style="padding: 10px 0;">
                <p style="font-size: 16px;"> Hello ${targetedCar.carOwner.names}, Magerwa Team here! We would like to let you know that your ${targetedCar.carName} car has been moved to auction! Check our platform for more information. </p> 
            </div>
            `,
    });

    response.status(200).json({
      successMessage: isEndUser ? "Car was successfully submitted for review!" : "Car was successfully moved to auction!",
      carContent: auctionCar,
    });
  } catch (error) {
      console.log(error);
      response.status(500).json({
        status: 'fail',
        message: error.message,
      });
  }
};


export default {
    registerCar,
    getRegisteredCars,
    userRegisteredCars,
    carClearance,
    deleteCar,
    moveToAuction
};