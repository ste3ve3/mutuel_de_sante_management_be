import Joi from "@hapi/joi";

const sponsorValidationSchema = Joi.object({
    names: Joi.string().required().min(2).label("first name").regex(/^[A-Za-z ]+$/).messages({
        "string.pattern.base": "The names field can not include numbers and special characters",
        "string.empty": "The names field can not be empty"
    }),

    phoneNumber: Joi.string().label("phone number").regex(/^([+]\d{2})?\d{10}$/).required().messages({
        "string.pattern.base": "Invalid phone number",
        "string.empty": "The phone number field can not be empty"
    }),

})

export default sponsorValidationSchema