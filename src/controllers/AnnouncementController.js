import mongoose from "mongoose";
import announcementValidationSchema from "../validations/announcementValidation.js";
import announcementModel from "../models/announcementModel.js";
import { uploadToCloudinary } from "../helpers/upload.js";

const createAnnouncement = async (request, response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(request.user?._id)) {
        return response.status(400).json({
          invalidId: "Something went wrong, refresh your page and try again!",
        });
      }

      let newCategory;
      let imageResult;

      if(request.query.isTyped) {
        const { error } = announcementValidationSchema.validate(request.body);
  
        if (error)
          return response.status(400).json({ message: error.details[0].message });
        
        if(request.body.headerImage !=="") {
            imageResult = await uploadToCloudinary(request.body.headerImage);
        }
    
        newCategory = new announcementModel({
          title: request.body.title,
          announcementBody: request.body.announcementBody,
          category: request.body.category,
          headerImage: request.body.headerImage !=="" ? imageResult.secure_url : null,
          createdBy: request.user?._id,
        });
      }

      else {
        newCategory = new announcementModel({
            title: request.body.title,
            category: request.body.category,
            announcementFile: request.body.announcementFile,
            createdBy: request.user?._id,
          });
      }
  
      const announcement = await newCategory.save();
      const populatedAnnouncement = await announcement.populate({
        path: "createdBy"
      });
  
      response.status(200).json({
        message: "Announcement created successfully!",
        data: populatedAnnouncement,
      });
    } catch (error) {
        response.status(500).json({
          status: "fail",
          message: error.message,
        });
    }
  };

  const getAllAnnouncements = async (request, response) => {
    try {
      let query = [
        {
          $lookup: {
            from: "users",
            localField: "createdBy",
            foreignField: "_id",
            as: "staffCreator",
          },
        },
        { $unwind: "$staffCreator" },
      ];
  
      // Search functionality
      if (request.query.keyword && request.query.keyword != "") {
        query.push({
          $match: {
            $or: [
              {
                title: { $regex: request.query.keyword, $options: "i" },
              },
              {
                postBody: {
                  $regex: request.query.keyword,
                  $options: "i",
                },
              },
              {
                "staffCreator.firstName": {
                  $regex: request.query.keyword,
                  $options: "i",
                },
              },
              {
                "title": {
                  $regex: request.query.keyword,
                  $options: "i",
                },
              },
              {
                "role": {
                  $regex: request.query.keyword,
                  $options: "i",
                },
              },
              {
                "announcementBody": {
                  $regex: request.query.keyword,
                  $options: "i",
                },
              },
              {
                "category": {
                  $regex: request.query.keyword,
                  $options: "i",
                },
              },
              {
                "staffCreator.lastName": {
                  $regex: request.query.keyword,
                  $options: "i",
                },
              },
            ],
          },
        });
      }
  
      if (request.query.creatorId && request.query.creatorId !== "All") {
        query.push({
          $match: {
            createdBy: new mongoose.Types.ObjectId(request.query.creatorId),
          },
        });
      }
  
      if (request.query.category && request.query.category !== "All") {
        query.push({
          $match: {
            category: {
              $in: [request.query.category, "All"],
            },
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
  
      const allAnnouncements = await announcementModel.aggregate(query);

      if (allAnnouncements) {
        response.status(200).json({
          data: allAnnouncements.map((doc) => announcementModel.hydrate(doc)),
        });
      } else {
        response.status(400).json({ message: "No announcements found" });
      }
    } catch (error) {
      response.status(500).json({
        status: "fail",
        message: error.message,
      });
    }
  };

  const getSingleAnnouncement = async (request, response) => {
    try {
      const announcement = await announcementModel.findOne({ _id : request.query.announcementId }).populate("createdBy")
  
      response.status(200).json({
        data: announcement,
      });
    } catch (error) {
      response.status(500).json({
        status: 'fail',
        message: error.message,
      });
    }
  };

  const updateAnnouncement = async (request, response) => {
    try {
  
      const announcement = await announcementModel.findOne({ _id: request.query.announcementId });
      if (announcement) {
        let current_user = request.user;
  
        if (announcement.createdBy != current_user._id && current_user.role !== "Principle") {
          return response.status(400).json({
            message:
              'Access denied, you are not the creator of this announcement!',
          });
        }

        if(request.query.isTyped) {
            if (
                request.body.headerImage &&
                request.body.headerImage !== announcement.headerImage
              ) {
                const announcementImageResult = await uploadToCloudinary(
                  request.body.headerImage,
                );
                  announcement.title = request.body.title || announcement.title;
                  announcement.announcementBody = request.body.announcementBody || announcement.announcementBody;
                  announcement.category = request.body.category || announcement.category;
                  announcement.headerImage = announcementImageResult.secure_url || announcement.headerImage;
              } else {
                  announcement.title = request.body.title || announcement.title;
                  announcement.announcementBody = request.body.announcementBody || announcement.announcementBody;
                  announcement.category = request.body.category || announcement.category;
              }
        }
        else {
            announcement.title = request.body.title || announcement.title;
            announcement.category = request.body.category || announcement.category;
            announcement.announcementFile = request.body.announcementFile || announcement.announcementFile;
        }
  
        await announcement.save();
  
        response.status(200).json({
          successMessage: 'Announcement updated successfully!',
          data: announcement.populate("createdBy"),
        });
      } else {
        response.status(400).json({
          message: 'Announcement not found!',
        });
      }
    } catch (error) {
      response.status(500).json({
        status: 'fail',
        message: error.message,
      });
    }
  };

  const deleteAnnouncemeent = async (req, res) => {
    try {
      if (
        !req.query.announcementId ||
        !mongoose.Types.ObjectId.isValid(req.query.announcementId)
      ) {
        throw new Error(
          !req.query.announcementId
            ? 'Announcement id required'
            : 'Invalid announcement id format',
        );
      }
      const announcement = await announcementModel.findOne({ _id: req.query.announcementId });
      let current_user = req.user;
  
      if (announcement.createdBy != current_user._id && current_user.role !== "Principle") {
        return res.status(400).json({
          message:
            'Access denied, you are not the creator of this announcement!',
      });
      }
      const user =
        await announcementModel.findByIdAndDelete(req.query.announcementId)
      if (!user) {
        throw new Error(
          "The announcement you're trying to delete does not exist",
        );
      }
  
      res.status(200).json({
        successMessage: 'Announcement deleted Successfully!',
      });
    } catch (error) {
      res.status(500).json({
        status: 'fail',
        message: error.message,
      });
    }
  };

  export default {
    createAnnouncement,
    getAllAnnouncements,
    getSingleAnnouncement,
    updateAnnouncement,
    deleteAnnouncemeent
  };