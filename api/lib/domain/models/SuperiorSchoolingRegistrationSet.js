const SuperiorSchoolingRegistration =  require('./SuperiorSchoolingRegistration');
const { checkValidation } = require('../validators/superior-schooling-registration-set-validator');
class SuperiorSchoolingRegistrationSet {

  constructor() {
    this._registrationList = [];
  }

  get organizationId() {
    return this._organizationId;
  }
  setOrganizationId(organizationId) {
    this._organizationId = organizationId;
  }

  addRegistration(registartionAttributes) {
    const registration = new SuperiorSchoolingRegistration(registartionAttributes);
    registration.validate();
    this._registrationList.push(registration);
    checkValidation(this);
  }

  registrations()  {
    return this._registrationList.map((registration) => ({ ...registration, organizationId:  this._organizationId }));
  }
}

module.exports = SuperiorSchoolingRegistrationSet;
