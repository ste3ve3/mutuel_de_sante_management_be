import Joi from "@hapi/joi";

const studentValidationSchema = Joi.object({
    firstName: Joi.string().required().min(2).label("first name").regex(/^[A-Za-z ]+$/).messages({
        "string.pattern.base": "The firstName field can not include numbers and special characters",
        "string.empty": "The firstName field can not be empty"
    }),
    lastName: Joi.string().required().min(2).label("last name").regex(/^[A-Za-z ]+$/).messages({
        "string.pattern.base": "The lastName field can not include numbers and special characters",
        "string.empty": "The lastName field can not be empty"
    }),

    studentEmail: Joi.string().allow('').optional(),

    regNumber: Joi.string()
    .required()
    .pattern(/^\d+$/)
    .messages({
      "string.empty": "The registration number field cannot be empty",
      "string.pattern.base": "The registration number must only contain numbers",
    }),
})


export default studentValidationSchema