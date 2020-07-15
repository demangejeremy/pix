const _ = require('lodash');

class Student {

  constructor({
    nationalStudentId,
    accounts = [],
  } = {}) {
    this.nationalStudentId = nationalStudentId;
    this.accounts = accounts;
  }

  getAppropriateAccount() {
    return _.orderBy(this.accounts, ['certificationCount', 'updatedAt'], ['desc', 'desc'])[0];
  }
}

module.exports = Student;
