import Joi from "@hapi/joi";

const studentLoginValidationSchema = Joi.object({
    regNumber: Joi.string()
    .required()
    .messages({
      "string.empty": "The registration number field cannot be empty"
    }),
    password: Joi.string()
    .required()
    .messages({
      "string.empty": "The password field cannot be empty"
    }),
})


export default studentLoginValidationSchema