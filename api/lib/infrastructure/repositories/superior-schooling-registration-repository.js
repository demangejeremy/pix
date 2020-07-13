const { knex } = require('../bookshelf');
const _ = require('lodash');

const { AlreadyExistingSchoolingRegistration } = require('../../domain/errors');

module.exports = {

  async saveSet(superiorSchoolingRegistrationSet) {

    const studentNumbers = [];
    const names = [];
    superiorSchoolingRegistrationSet
      .registrations()
      .forEach(({ studentNumber, firstName, lastName, birthdate }) => {
        studentNumbers.push(studentNumber);
        names.push([firstName, lastName, birthdate]);
      });

    const countOfAlreadyExistingSchoolingRegistration = await knex('schooling-registrations')
      .where({ organizationId: superiorSchoolingRegistrationSet.organizationId })
      .andWhere((builder) => {
        builder.whereIn('studentNumber', studentNumbers);
        builder.orWhere((builder) => builder.whereIn(['firstName', 'lastName', 'birthdate'], names));
      })
      .count();

    if (countOfAlreadyExistingSchoolingRegistration[0].count > 0) {
      throw new AlreadyExistingSchoolingRegistration();
    }

    const schoolinRegistrationRows = superiorSchoolingRegistrationSet
      .registrations()
      .map((registration) => {
        const attributs =  _.pick(registration, [
          'organizationId',
          'studentNumber',
          'firstName',
          'middleName',
          'thirdName',
          'lastName',
          'preferredLastName',
          'studentNumber',
          'email',
          'birthdate',
          'group',
          'studyScheme',
        ]);
        return {
          ...attributs,
          educationalTeam: registration.teachingTeam,
          diploma: registration.degree,
          department: registration.division,
        };
      });
    await knex('schooling-registrations').insert(schoolinRegistrationRows);
  }

};
