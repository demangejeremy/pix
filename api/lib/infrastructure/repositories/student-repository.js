const _ = require('lodash');
const Student = require('../../domain/models/Student');
const Bookshelf = require('../bookshelf');

module.exports = {

  _toStudents(results) {
    return results.reduce((studentArray, result) => {
      const nationalStudentId = result.nationalStudentId;
      const student = _.find(studentArray, (student) => student.nationalStudentId === nationalStudentId);
      const account = { userId: result.userId, certificationCount: result.certificationCount, updatedAt: result.updatedAt };
      if (student) {
        student.accounts.push(account);
      } else {
        studentArray.push(new Student({ nationalStudentId, accounts: [account] }));
      }
      return studentArray;
    }, []);
  },

  async findReconciledStudentsByNationalStudentId(nationalStudentIds) {
    const results = await Bookshelf.knex
      .select({
        nationalStudentId: 'schooling-registrations.nationalStudentId',
        userId: 'users.id',
        updatedAt: 'users.updatedAt',
      })
      .count('certification-courses.id as certificationCount')
      .from('schooling-registrations')
      .join('users', 'users.id', 'schooling-registrations.userId')
      .leftJoin('certification-courses', 'certification-courses.userId', 'users.id')
      .where('users.id', 'is not', null)
      .whereIn('nationalStudentId', nationalStudentIds)
      .groupBy('schooling-registrations.nationalStudentId', 'users.id', 'users.updatedAt');

    return this._toStudents(results);
  },
};
