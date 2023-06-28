import Joi from "@hapi/joi";

const registeredCarValidationSchema = Joi.object({
    carName: Joi.string().required().messages({
        "string.empty": "The car name field can not be empty"
    }),
    condition: Joi.string().required().messages({
        "string.empty": "The car condition field can not be empty"
    }),
    bodyType: Joi.string().required().messages({
        "string.empty": "The car body type field can not be empty"
    }),
    brand: Joi.string().required().messages({
        "string.empty": "The car brand field can not be empty"
    }),
    model: Joi.string().required().messages({
        "string.empty": "The car model field can not be empty"
    }),
    year: Joi.string().required().messages({
        "string.empty": "The car year field can not be empty"
    }),
    passengerCapacity: Joi.string().required().messages({
        "string.empty": "The passenger capacity field can not be empty"
    }),
    exteriorColor: Joi.string().required().messages({
        "string.empty": "The exterior color field can not be empty"
    }),
    fuelType: Joi.string().required().messages({
        "string.empty": "The fuel type field can not be empty"
    }),
    mileage: Joi.string().required().messages({
        "string.empty": "The mileage field can not be empty"
    }),
    transmission: Joi.string().required().messages({
        "string.empty": "The transmission field can not be empty"
    }),
    drivetrain: Joi.string().required().messages({
        "string.empty": "The drivetrain field can not be empty"
    }),
    engineCapacity: Joi.string().required().messages({
        "string.empty": "The engine capacity field can not be empty"
    }),
    power: Joi.string().required().messages({
        "string.empty": "The car power field can not be empty"
    }),
    carPrice: Joi.string().required().regex(/^\d+$/).messages({
        "string.pattern.base": "The car price field should only include numbers",
        "string.empty": "The car price field can not be empty"
    }),
    carImage: Joi.string(),
    carOwner: Joi.string(),
    features: Joi.array(),
    length: Joi.string(),
    width: Joi.string(),
    height: Joi.string(),
    cargoVolume: Joi.string()
})


export default registeredCarValidationSchema