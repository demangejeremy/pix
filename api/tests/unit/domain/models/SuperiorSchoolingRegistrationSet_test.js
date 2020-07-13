const SuperiorSchoolingRegistrationSet = require('../../../../lib/domain/models/SuperiorSchoolingRegistrationSet');
const { expect, catchErr } = require('../../../test-helper');
const {  EntityValidationError } = require('../../../../lib/domain/errors');

describe('Unit | Domain | Models | SuperiorSchoolingRegistrationSet', () => {

  context('#addRegistration', () => {
    context('when set has no registration', () => {
      it('creates the first registration of the set', () => {

        const organizationId = 12;
        const superiorSchoolingRegistrationSet = new SuperiorSchoolingRegistrationSet(organizationId);
        superiorSchoolingRegistrationSet.setOrganizationId(organizationId);
        const registrationAttributes = {
          firstName: 'Beatrix',
          middleName: 'The',
          thirdName: 'Bride',
          lastName: 'Kiddo',
          preferredLastName: 'Black Mamba',
          studentNumber: '1',
          email: 'thebride@example.net',
          birthdate: new Date('1980-07-01'),
          degree: 'Master',
          division: 'Assassination Squad',
          teachingTeam: 'Pai Mei',
          group: 'Deadly Viper Assassination Squad',
          studyScheme: 'I have no idea what it\'s like.'
        };

        superiorSchoolingRegistrationSet.addRegistration(registrationAttributes);
        const registrations = superiorSchoolingRegistrationSet.registrations();

        expect(registrations).to.have.lengthOf(1);
        expect(registrations[0]).to.deep.equal({ ...registrationAttributes, organizationId });
      });
    });

    context('when set has registrations', () => {
      it('creates the a new registration for the set', () => {

        const organizationId = 12;
        const superiorSchoolingRegistrationSet = new SuperiorSchoolingRegistrationSet(organizationId);
        superiorSchoolingRegistrationSet.setOrganizationId(organizationId);
        const registration1 = {
          firstName: 'Beatrix',
          middleName: 'The',
          thirdName: 'Bride',
          lastName: 'Kiddo',
          preferredLastName: 'Black Mamba',
          studentNumber: '1',
          email: 'thebride@example.net',
          birthdate: new Date('1980-07-01'),
          degree: 'Master',
          division: 'Assassination Squad',
          teachingTeam: 'Pai Mei',
          group: 'Deadly Viper Assassination Squad',
          studyScheme: 'I have no idea what it\'s like.'
        };
        const registration2 = {
          firstName: 'Bill',
          middleName: 'Unknown',
          thirdName: 'Unknown',
          lastName: 'Unknown',
          preferredLastName: 'Snake Charmer',
          studentNumber: '2',
          email: 'bill@example.net',
          birthdate: new Date('1960-07-01'),
          degree: 'Doctorat',
          division: 'Assassination Squad Management',
          teachingTeam: 'Pai Mei',
          group: 'Deadly Viper Assassination Squad',
          studyScheme: 'I have always no idea what it\'s like.'
        };

        superiorSchoolingRegistrationSet.addRegistration(registration1);
        superiorSchoolingRegistrationSet.addRegistration(registration2);
        const registrations = superiorSchoolingRegistrationSet.registrations();

        expect(registrations).to.have.lengthOf(2);
        expect(registrations[1]).to.deep.equal({ ...registration2, organizationId });
      });
    });

    context('when a registration is not valid', () => {
      it('throws an error', async () => {

        const organizationId = 12;
        const superiorSchoolingRegistrationSet = new SuperiorSchoolingRegistrationSet(organizationId);
        superiorSchoolingRegistrationSet.setOrganizationId(organizationId);
        const registration = {
          firstName: null,
          lastName: 'Kiddo',
          birthdate: new Date('1980-07-01'),
        };

        const addRegistration = superiorSchoolingRegistrationSet.addRegistration.bind(superiorSchoolingRegistrationSet);
        const error = await catchErr(addRegistration)(registration);

        expect(error).to.be.instanceOf(EntityValidationError);
      });
    });

    context('when there is a registration with the same student number', () => {
      it('throws an error', async () => {

        const organizationId = 12;
        const superiorSchoolingRegistrationSet = new SuperiorSchoolingRegistrationSet(organizationId);
        superiorSchoolingRegistrationSet.setOrganizationId(organizationId);
        const registration1 = {
          firstName: 'Beatrix',
          lastName: 'Kiddo',
          birthdate: new Date('1980-07-01'),
          studentNumber: 1
        };
        const registration2 = {
          firstName: 'Ishii',
          lastName: 'O-ren',
          birthdate: new Date('1990-01-01'),
          studentNumber: 1
        };

        const addRegistration = superiorSchoolingRegistrationSet.addRegistration.bind(superiorSchoolingRegistrationSet);
        await catchErr(addRegistration)(registration1);
        const error = await catchErr(addRegistration)(registration2);

        expect(error).to.be.instanceOf(EntityValidationError);
      });
    });

    context('when there is a registration have no student number but the same first name, last name and bithdate', () => {
      it('throws an error', async () => {

        const organizationId = 12;
        const superiorSchoolingRegistrationSet = new SuperiorSchoolingRegistrationSet(organizationId);
        superiorSchoolingRegistrationSet.setOrganizationId(organizationId);
        const registration1 = {
          firstName: 'Beatrix',
          lastName: 'Kiddo',
          birthdate: new Date('1980-07-01'),
        };
        const registration2 = {
          firstName: 'Beatrix',
          lastName: 'Kiddo',
          birthdate: new Date('1980-07-01'),
        };

        const addRegistration = superiorSchoolingRegistrationSet.addRegistration.bind(superiorSchoolingRegistrationSet);
        await catchErr(addRegistration)(registration1);
        const error = await catchErr(addRegistration)(registration2);

        expect(error).to.be.instanceOf(EntityValidationError);
      });
    });
  });
});
