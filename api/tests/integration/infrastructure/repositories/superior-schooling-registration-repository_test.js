const { expect, databaseBuilder, knex, catchErr } = require('../../../test-helper');
const superiorSchoolingRegistrationRepository = require('../../../../lib/infrastructure/repositories/superior-schooling-registration-repository');
const SuperiorSchoolingRegistrationSet = require('../../../../lib/domain/models/SuperiorSchoolingRegistrationSet');
const { AlreadyExistingSchoolingRegistration } = require('../../../../lib/domain/errors');

describe('Integration | Infrastructure | Repository | superior-schooling-registration-repository', () => {

  describe('#saveSet', () => {
    afterEach(() => {
      return knex('schooling-registrations').delete();
    });

    context('when there is no schooling registration with the same student number or the same first name, last name and birthdate', () => {
      it('save all the superior schooling registrations', async function() {

        const organization = databaseBuilder.factory.buildOrganization();
        await databaseBuilder.commit();

        const superiorSchoolingRegistrationSet = new SuperiorSchoolingRegistrationSet();
        superiorSchoolingRegistrationSet.setOrganizationId(organization.id);
        const registration1 = {
          firstName: 'Elle',
          middleName: 'One',
          thirdName: 'Eyed',
          lastName: 'Driver',
          preferredLastName: 'California Mountain Snake',
          studentNumber: '3',
          email: 'driver@example.net',
          birthdate: new Date('1975-07-01'),
          degree: 'BTS',
          division: 'Assassination Squad',
          teachingTeam: 'Pai Mei',
          group: 'Deadly Viper Assassination Squad',
          studyScheme: 'I have no idea what it\'s like.'
        };
        const registration1Attributes = {
          organizationId: organization.id,
          firstName: 'Elle',
          middleName: 'One',
          thirdName: 'Eyed',
          lastName: 'Driver',
          preferredLastName: 'California Mountain Snake',
          studentNumber: '3',
          email: 'driver@example.net',
          birthdate: '1975-07-01',
          diploma: 'BTS',
          department: 'Assassination Squad',
          educationalTeam: 'Pai Mei',
          group: 'Deadly Viper Assassination Squad',
          studyScheme: 'I have no idea what it\'s like.'
        };
        const registration2 = {
          firstName: 'O-Ren',
          middleName: 'Unknown',
          thirdName: 'Unknown',
          lastName: 'Ishii',
          preferredLastName: 'Cottonmouth',
          studentNumber: '4',
          email: 'ishii@example.net',
          birthdate: new Date('1990-07-01'),
          degree: 'DUT',
          division: 'The Crazy 88',
          teachingTeam: 'Bill',
          group: 'Tokyo Crime World',
          studyScheme: 'I have always no idea what it\'s like.'
        };
        const registration2Attributes = {
          organizationId: organization.id,
          firstName: 'O-Ren',
          middleName: 'Unknown',
          thirdName: 'Unknown',
          lastName: 'Ishii',
          preferredLastName: 'Cottonmouth',
          studentNumber: '4',
          email: 'ishii@example.net',
          birthdate: '1990-07-01',
          diploma: 'DUT',
          department: 'The Crazy 88',
          educationalTeam: 'Bill',
          group: 'Tokyo Crime World',
          studyScheme: 'I have always no idea what it\'s like.'
        };

        superiorSchoolingRegistrationSet.addRegistration(registration1);
        superiorSchoolingRegistrationSet.addRegistration(registration2);

        await superiorSchoolingRegistrationRepository.saveSet(superiorSchoolingRegistrationSet);

        const superiorSchoolingRegistrations = await knex('schooling-registrations').where({ organizationId: organization.id }).orderBy('firstName');
        expect(superiorSchoolingRegistrations).to.have.lengthOf(2);
        expect(superiorSchoolingRegistrations[0]).to.include(registration1Attributes);
        expect(superiorSchoolingRegistrations[1]).to.include(registration2Attributes);
      });
    });

    context('when there is schooling registration with the same student number for the same organization', () =>  {
      it('does not add any schooling registrations', async function() {

        const organization = databaseBuilder.factory.buildOrganization();
        databaseBuilder.factory.buildSchoolingRegistration({
          preferredLastName: 'Sidewinder',
          studentNumber: 12,
          organizationId: organization.id
        });

        await databaseBuilder.commit();

        const superiorSchoolingRegistrationSet = new SuperiorSchoolingRegistrationSet();
        superiorSchoolingRegistrationSet.setOrganizationId(organization.id);
        const registration = {
          preferredLastName: 'California Mountain Snake',
          studentNumber: '12',
          firstName: 'Elle',
          lastName: 'Driver',
          birthdate: new Date('2020-01-01'),
        };

        superiorSchoolingRegistrationSet.addRegistration(registration);

        const error = await catchErr(superiorSchoolingRegistrationRepository.saveSet)(superiorSchoolingRegistrationSet);
        const superiorSchoolingRegistrations = await knex('schooling-registrations').where({ organizationId: organization.id });

        expect(error).to.be.instanceOf(AlreadyExistingSchoolingRegistration);
        expect(superiorSchoolingRegistrations).to.have.lengthOf(1);
        expect(superiorSchoolingRegistrations[0]['preferredLastName']).to.equal('Sidewinder');
        expect(superiorSchoolingRegistrations[0]['studentNumber']).to.equal('12');
      });
    });

    context('when there is schooling registration with the same student number for another organization', () => {
      it('add schooling registrations', async function() {

        const organization = databaseBuilder.factory.buildOrganization();
        const otherOrganization = databaseBuilder.factory.buildOrganization();
        databaseBuilder.factory.buildSchoolingRegistration({
          preferredLastName: 'Sidewinder',
          studentNumber: '12',
          organizationId: otherOrganization.id,
        });

        await databaseBuilder.commit();

        const superiorSchoolingRegistrationSet = new SuperiorSchoolingRegistrationSet();
        superiorSchoolingRegistrationSet.setOrganizationId(organization.id);
        const registration = {
          firstName: 'firstName',
          lastName: 'lastName',
          birthdate: new Date('2020-01-01'),
          preferredLastName: 'Sidewinder',
          studentNumber: '12',
        };

        superiorSchoolingRegistrationSet.addRegistration(registration);

        await superiorSchoolingRegistrationRepository.saveSet(superiorSchoolingRegistrationSet);

        const superiorSchoolingRegistrations = await knex('schooling-registrations').where({ preferredLastName: 'Sidewinder' });

        const organizationIds = superiorSchoolingRegistrations.map(({ organizationId }) => organizationId);

        expect(organizationIds).to.exactlyContain([organization.id, otherOrganization.id]);
      });
    });

    context('when there is no schooling registration with the same student number but one with the same first name, last name and birthdate', () => {
      it('does not add any schooling registrations', async function() {

        const organization = databaseBuilder.factory.buildOrganization();
        databaseBuilder.factory.buildSchoolingRegistration({
          firstName: 'Elle',
          lastName: 'Driver',
          birthdate: new Date('1975-07-01'),
          studentNumber: null,
          organizationId: organization.id
        });

        await databaseBuilder.commit();

        const superiorSchoolingRegistrationSet = new SuperiorSchoolingRegistrationSet();
        superiorSchoolingRegistrationSet.setOrganizationId(organization.id);
        const registration = {
          studentNumber: null,
          firstName: 'Elle',
          lastName: 'Driver',
          birthdate: new Date('1975-07-01'),
        };

        superiorSchoolingRegistrationSet.addRegistration(registration);

        const error = await catchErr(superiorSchoolingRegistrationRepository.saveSet)(superiorSchoolingRegistrationSet);

        const superiorSchoolingRegistrations = await knex('schooling-registrations').where({ organizationId: organization.id });
        expect(error).to.be.instanceOf(AlreadyExistingSchoolingRegistration);
        expect(superiorSchoolingRegistrations).to.have.lengthOf(1);
        expect(superiorSchoolingRegistrations[0]['lastName']).to.equal('Driver');
      });
    });

    context('when there is no schooling registration with the same student number but one with the same last name, first name and birthdate for another organization', () => {
      it('does not add any schooling registrations', async function() {

        const organization = databaseBuilder.factory.buildOrganization();
        const otherOrganization = databaseBuilder.factory.buildOrganization();

        databaseBuilder.factory.buildSchoolingRegistration({
          firstName: 'Elle',
          lastName: 'Driver',
          birthdate: new Date('1975-07-01'),
          studentNumber: null,
          organizationId: otherOrganization.id
        });

        await databaseBuilder.commit();

        const superiorSchoolingRegistrationSet = new SuperiorSchoolingRegistrationSet();
        superiorSchoolingRegistrationSet.setOrganizationId(organization.id);
        const registration = {
          studentNumber: null,
          firstName: 'Elle',
          lastName: 'Driver',
          birthdate: new Date('1975-07-01'),
        };

        superiorSchoolingRegistrationSet.addRegistration(registration);

        await superiorSchoolingRegistrationRepository.saveSet(superiorSchoolingRegistrationSet);

        const superiorSchoolingRegistrations = await knex('schooling-registrations').where({ lastName: 'Driver' });
        const organizationIds = superiorSchoolingRegistrations.map(({ organizationId }) => organizationId);

        expect(organizationIds).to.exactlyContain([organization.id, otherOrganization.id]);
      });
    });
  });
});
