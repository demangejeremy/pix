const { checkValidation } = require('../validators/superior-schooling-registration-validator');

class SuperiorSchoolingRegistration {

  constructor({
    firstName,
    middleName,
    thirdName,
    lastName,
    preferredLastName,
    studentNumber,
    email,
    birthdate,
    degree,
    division,
    teachingTeam,
    group,
    studyScheme
  } = {}) {
    this.firstName = firstName;
    this.middleName = middleName;
    this.thirdName = thirdName;
    this.lastName = lastName;
    this.preferredLastName = preferredLastName;
    this.studentNumber = studentNumber;
    this.email = email;
    this.birthdate = birthdate;
    this.degree = degree;
    this.division = division;
    this.teachingTeam = teachingTeam;
    this.group = group;
    this.studyScheme = studyScheme;
  }

  validate() {
    checkValidation({
      firstName: this.firstName,
      lastName: this.lastName,
      birthdate: this.birthdate,
      email: this.email
    });
  }
}

module.exports = SuperiorSchoolingRegistration;
