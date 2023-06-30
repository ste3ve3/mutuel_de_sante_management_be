import mongoose from "mongoose";
import { Types } from "mongoose";
import auctionModel from "../models/auctionModel.js";
import carValidationSchema from "../validations/carFormValidation.js";
import { uploadToCloudinary } from "../helpers/upload.js";

// Add car to auction
const addToAuction = async (request, response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(request.user?._id)) {
        return response.status(400).json({
          message:
            'Something went wrong, refresh your page and try again!',
        });
      }
      //Validation
      const { error } = carValidationSchema.validate(request.body);
  
      if (error)
        return response
          .status(400)
          .json({ message: error.details[0].message });
  
       const carImageResult = await uploadToCloudinary(request.body.carImage);
  
      const newAuctionCar = new auctionModel({
        ...request.body,
        carOwner: request.user?._id,
        carImage: carImageResult.secure_url,
        isPublic: true 
       });
  
      const auctionCar = await newAuctionCar.save();
      const populatedCar = await auctionCar.populate('carOwner');
  
      response.status(200).json({
        successMessage: `Your ${newAuctionCar.carName} Car was successfully submitted for review, we will get in touch soon!`,
        carContent: populatedCar,
      });
    } catch (error) {
        response.status(500).json({
          status: 'fail',
          message: error.message,
        });
    }
};


// Get all auction cars
const getAuctionCars = async (request, response) => {
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
    let total = await auctionModel.countDocuments(query);
    let page = request.query.page ? parseInt(request.query.page) : 1;
    let perPage = request.query.perPage ? parseInt(request.query.perPage) : 4;  
    let skip = (page - 1) * perPage;
    query.push({
      $skip: skip,
    });
    query.push({
      $limit: perPage,
    });

    const allCars = await auctionModel.aggregate(query);
    
    if (allCars) {
      response.status(200).json({
        data: allCars.map((doc) => auctionModel.hydrate(doc)),
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


// Get detailed auction car
const getDetailedCar = async (request, response) => {
  try {
    let carId = request.query.carId;

    const car = await auctionModel.findOne({
      _id: carId
    });

    if (!car) {
      response.status(400).json({ message: "Car not found in our system!" });
      return
    }

    response.status(200).json({
      data: car,
    });
  } catch (error) {
    response.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};


const publishCar = async (request, response) => {
  try {
    const id = request.query.carId;
    const car =
      await auctionModel.findById(id);
    if (!car) {
      throw new HttpException(
        400,
        'Car not found!'
      );
    }
    car.isPublic = request.body.isPublic;

    const updated = await car.save();

    response.status(200).json({
      successMessage: `The visibility of ${car.carName} car was changed successfully!`,
      updatedCar: updated,
    });
  } catch (error) {
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const editCar = async (request, response) => {
  try {
    let carId = request.query.carId;

    const AuctionCar = await auctionModel.findOne({ _id: carId });

    if (AuctionCar) {
      (AuctionCar.auctionDate = request.body.auctionDate || AuctionCar.auctionDate),
        (AuctionCar.auctionTime =
          request.body.auctionTime || AuctionCar.auctionTime),
        (AuctionCar.auctionLocation =
          request.body.auctionLocation ||
          AuctionCar.auctionLocation),
        (AuctionCar.locationMap = request.body.locationMap || AuctionCar.locationMap),
        (AuctionCar.contactPhone1 = request.body.contactPhone1 || AuctionCar.contactPhone1),
        (AuctionCar.contactPhone2 =
          request.body.contactPhone2 || AuctionCar.contactPhone2),
        (AuctionCar.contactEmail = request.body.contactEmail || AuctionCar.contactEmail)

      await AuctionCar.save();

      response.status(200).json({
        successMessage: 'Car updated successfully!',
        updatedAuctionCar: AuctionCar,
      });
    } else {
      response.status(400).json({
        carUpdateError: 'Car not found!',
      });
    }
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
      await auctionModel.findByIdAndDelete(req.query.carId)
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


export default {
    addToAuction,
    getAuctionCars,
    getDetailedCar,
    publishCar,
    editCar,
    deleteCar
};