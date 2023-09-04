import Joi from "@hapi/joi";

const underprivilegedValidationSchema = Joi.object({
    names: Joi.string().required().min(2).label("first name").regex(/^[A-Za-z ]+$/).messages({
        "string.pattern.base": "The names field can not include numbers and special characters",
        "string.empty": "The names field can not be empty"
    }),

    passportPhoto: Joi.string(),

    phoneNumber: Joi.string().label("phone number").regex(/^([+]\d{2})?\d{10}$/).required().messages({
        "string.pattern.base": "Invalid phone number",
        "string.empty": "The phone number field can not be empty"
    }),

    nationalId: Joi.string().required().min(2).label("national ID").pattern(/^[0-9]+$/).messages({
        "string.empty": "The national ID can not be empty",
        "string.pattern.base": "The national ID field must contain only numeric characters",
    }),

    residentCell: Joi.string().required().messages({
        "string.empty": "The residental cell field can not be empty",
    }),

    hasSponsor: Joi.boolean(),
})


export default underprivilegedValidationSchema