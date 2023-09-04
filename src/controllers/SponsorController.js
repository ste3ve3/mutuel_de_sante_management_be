import sponsorModel from "../models/sponsorModel.js";
import mongoose from "mongoose";
import sponsorValidationSchema from "../validations/sponsorValidation.js";
import { Types } from "mongoose";

const addSponsor = async (request, response) => {
  const { error } = sponsorValidationSchema.validate(request.body);

  if (error)
    return response.status(400).json({ message: error.details[0].message });

  try {

    const newUser = new sponsorModel({
      names: request.body.names,
      phoneNumber: request.body.phoneNumber
    });

    await newUser.save();

    response.status(201).json({
      successMessage: "Sponsor added successfully!",
      data: newUser
    });
  } catch (error) {
    response.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

const getAllSponsors = async (request, response) => {
    try {
      let query = [];
  
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
  
      const allSponsors = await sponsorModel.aggregate(query);
  
      if (allSponsors) {
        response.status(200).json({
          data: allSponsors.map((doc) => sponsorModel.hydrate(doc)),
        });
      } else {
        response.status(400).json({ message: "No sponsors found!" });
      }
    } catch (error) {
      response.status(500).json({
        status: "fail",
        message: error.message,
      });
    }
  };

const updateSponsor = async (request, response) => {
    try {
  
      const sponsor = await sponsorModel.findOne({ _id: request.query.sponsorId });
      if (sponsor) {
        sponsor.names = request.body.names || sponsor.names;
        sponsor.phoneNumber = request.body.phoneNumber || sponsor.phoneNumber;

        await sponsor.save();
  
        response.status(200).json({
          successMessage: 'Sponsor updated successfully!',
          data: sponsor,
        });
      } else {
        response.status(400).json({
          message: 'Sponsor not found!',
        });
      }
    } catch (error) {
      response.status(500).json({
        status: 'fail',
        message: error.message,
      });
    }
  };

const deleteSponsor = async (req, res) => {
  try {
    if (
      !req.query.sponsorId ||
      !mongoose.Types.ObjectId.isValid(req.query.sponsorId)
    ) {
      throw new Error(
        !req.query.sponsorId
          ? 'Sponsor id required'
          : 'Invalid sponsor id format',
      );
    }
    const user =
      await sponsorModel.findByIdAndDelete(req.query.sponsorId)
    if (!user) {
      throw new Error(
        "The sponsor you're trying to delete does no longer exist",
      );
    }

    res.status(200).json({
      successMessage: 'Sponsor deleted Successfully!',
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};


export default {
  addSponsor,
  getAllSponsors,
  updateSponsor,
  deleteSponsor
};