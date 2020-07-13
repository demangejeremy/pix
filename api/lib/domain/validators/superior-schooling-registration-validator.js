const Joi = require('@hapi/joi').extend(require('@hapi/joi-date'));
const { EntityValidationError } = require('../errors');

const validationConfiguration = { abortEarly: false, allowUnknown: true };

const validationSchema = Joi.object({
  firstName: Joi.string()
    .required()
    .messages({
      'string.base': 'Veuillez donner le prénom du participant.',
      'string.empty': 'Veuillez donner le prénom du participant.',
    }),
  lastName: Joi.string()
    .required()
    .messages({
      'string.base': 'Veuillez donner le nom du participant.',
      'string.empty': 'Veuillez donner le nom du participant.',
    }),
  birthdate: Joi.date()
    .required()
    .messages({
      'string.base': 'Veuillez donner la date de naissance du participant.',
      'string.empty': 'Veuillez donner la date de naissance du participant.',
    }),
  email: Joi.string().email()
    .optional()
    .messages({
      'string.base': 'L\'email n\'est pas vailde.',
    }),
});

module.exports = {
  checkValidation(superiorSchoolingRegistration) {
    const { error } = validationSchema.validate(
      superiorSchoolingRegistration,
      validationConfiguration,
    );
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    }
  }
};
