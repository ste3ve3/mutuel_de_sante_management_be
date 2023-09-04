import underprivilegedModel from "../models/underprivilegedModel.js";
import sponsorModel from "../models/sponsorModel.js";
import mongoose from "mongoose";
import underprivilegedValidationSchema from "../validations/underprivilegedValidation.js";
import { uploadToCloudinary } from "../helpers/upload.js";
import { Types } from "mongoose";

const addPerson = async (request, response) => {
  const { error } = underprivilegedValidationSchema.validate(request.body);

  if (error)
    return response.status(400).json({ message: error.details[0].message });

  try {
    let imageResult = await uploadToCloudinary(request.body.passportPhoto); 

    const newUser = new underprivilegedModel({
      names: request.body.names,
      passportPhoto: imageResult.secure_url,
      phoneNumber: request.body.phoneNumber,
      nationalId: request.body.nationalId,
      residentCell: request.body.residentCell
    });

    await newUser.save();

    response.status(201).json({
      successMessage: "Person added successfully!",
      data: newUser
    });
  } catch (error) {
    response.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};


const getAllPeople = async (request, response) => {
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
  
      const allPeople = await underprivilegedModel.aggregate(query);
  
      if (allPeople) {
        response.status(200).json({
          data: allPeople.map((doc) => underprivilegedModel.hydrate(doc)),
        });
      } else {
        response.status(400).json({ message: "No users found!" });
      }
    } catch (error) {
      response.status(500).json({
        status: "fail",
        message: error.message,
      });
    }
  };

const updatePerson = async (request, response) => {
    try {
  
      const person = await underprivilegedModel.findOne({ _id: request.query.personId });
      if (person) {
        if (
            request.body.passportPhoto &&
            request.body.passportPhoto !== person.passportPhoto
            ) {
            const personImageResult = await uploadToCloudinary(
                request.body.passportPhoto,
            );
                person.names = request.body.names || person.names;
                person.phoneNumber = request.body.phoneNumber || person.phoneNumber;
                person.nationalId = request.body.nationalId || person.nationalId;
                person.residentCell = request.body.residentCell || person.residentCell;
                person.passportPhoto = personImageResult.secure_url || person.passportPhoto;
            } else {
                person.names = request.body.names || person.names;
                person.phoneNumber = request.body.phoneNumber || person.phoneNumber;
                person.nationalId = request.body.nationalId || person.nationalId;
                person.residentCell = request.body.residentCell || person.residentCell;
            }
  
        await person.save();
  
        response.status(200).json({
          successMessage: 'Person updated successfully!',
          data: person,
        });
      } else {
        response.status(400).json({
          message: 'Person not found!',
        });
      }
    } catch (error) {
      response.status(500).json({
        status: 'fail',
        message: error.message,
      });
    }
  };

const assignSponsor = async (request, response) => {
    try {
  
      const person = await underprivilegedModel.findOne({ _id: request.query.personId });
      if (person) {
            person.hasSponsor = true;
            person.sponsorId = request.body.sponsorId;
  
        await person.save();
  
        response.status(200).json({
          successMessage: 'Sponsor assigned successfully!',
          data: person,
        });
      } else {
        response.status(400).json({
          message: 'Person not found!',
        });
      }
    } catch (error) {
      response.status(500).json({
        status: 'fail',
        message: error.message,
      });
    }
};

const viewSponsor = async (request, response) => {
    try {
      const sponsor = await sponsorModel.findOne({ sponsorId: request.query.sponsorId })
  
      response.status(200).json({
         data: sponsor,
      });
    } catch (error) {
      response.status(500).json({
        status: 'fail',
        message: error.message,
      });
    }
  };

const deletePerson = async (req, res) => {
  try {
    if (
      !req.query.personId ||
      !mongoose.Types.ObjectId.isValid(req.query.personId)
    ) {
      throw new Error(
        !req.query.personId
          ? 'Person id required'
          : 'Invalid person id format',
      );
    }
    const user =
      await underprivilegedModel.findByIdAndDelete(req.query.personId)
    if (!user) {
      throw new Error(
        "The person you're trying to delete does no longer exist",
      );
    }

    res.status(200).json({
      successMessage: 'Person deleted Successfully!',
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};


export default {
  addPerson,
  getAllPeople,
  updatePerson,
  assignSponsor,
  viewSponsor,
  deletePerson
};