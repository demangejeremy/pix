const Joi = require('@hapi/joi').extend(require('@hapi/joi-date'));
const { EntityValidationError } = require('../errors');

const validationConfiguration = { abortEarly: false, allowUnknown: true };

const validationSchema = Joi.object({
  withStudentNumber: Joi.array().unique('studentNumber'),
  withoutStudentNumber: Joi.array()
    .unique((a, b) => a.lastName === b.lastName && a.firstName === b.firstName && a.birthdate.getTime() === b.birthdate.getTime())
});

module.exports = {
  checkValidation(superiorSchoolingRegistrationSet) {
    const registrationsToValidate = {
      withStudentNumber: [],
      withoutStudentNumber: []
    };

    superiorSchoolingRegistrationSet.registrations().forEach((registration) => {
      if (registration.studentNumber) {
        registrationsToValidate.withStudentNumber.push(registration);
      }
      else
      {
        registrationsToValidate.withoutStudentNumber.push(registration);
      }
    });
    const { error } = validationSchema.validate(
      registrationsToValidate,
      validationConfiguration,
    );
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    }
  }
};
