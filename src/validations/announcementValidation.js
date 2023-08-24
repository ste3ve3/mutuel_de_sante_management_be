import Joi from "@hapi/joi";

const announcementValidationSchema = Joi.object({
    title: Joi.string()
    .required()
    .messages({
      "string.empty": "The title field cannot be empty",
    }),
    announcementBody: Joi.string()
    .required()
    .messages({
      "string.empty": "The announcement body field cannot be empty",
    }),
    category: Joi.string()
    .required()
    .messages({
      "string.empty": "The category field cannot be empty",
    }),
    headerImage: Joi.string().allow("").optional(),

    announcementFile: Joi.string().allow('').optional(),

})


export default announcementValidationSchema