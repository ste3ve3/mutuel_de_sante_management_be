import Joi from "@hapi/joi";

const userValidationSchema = Joi.object({
    firstName: Joi.string().required().min(2).label("first name").regex(/^[A-Za-z ]+$/).messages({
        "string.pattern.base": "The firstName field can not include numbers and special characters",
        "string.empty": "The firstName field can not be empty"
    }),
    lastName: Joi.string().required().min(2).label("last name").regex(/^[A-Za-z ]+$/).messages({
        "string.pattern.base": "The lastName field can not include numbers and special characters",
        "string.empty": "The lastName field can not be empty"
    }),

    email: Joi.string().required().email().messages({
        "string.email": "Invalid email",
        "string.empty": "The email field can not be empty"
    }),

    role: Joi.string().required().min(2).label("last name").messages({
        "string.empty": "The role field can not be empty"
    }),

    password: Joi.string().required().regex(/^(?=(.*[A-Z]){1,})(?=(.*[a-z]){1,})(?=(.*[0-9]){1,}).{5,}$/).messages({
        "string.pattern.base": "The password should have at least one capital letter and a number",
        "string.empty": "The password field can not be empty"
    }),
})


export default userValidationSchema