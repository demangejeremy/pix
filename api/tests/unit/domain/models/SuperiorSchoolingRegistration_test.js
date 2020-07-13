const SuperiorSchoolingRegistration = require('../../../../lib/domain/models/SuperiorSchoolingRegistration');
const { expect, catchErr } = require('../../../test-helper');
const { EntityValidationError } = require('../../../../lib/domain/errors');

describe('Unit | Domain | Models | SuperiorSchoolingRegistartion', () => {

  describe('#validate', () => {
    context('when firstName is not present', () => {
      it('throws an error', async () => {
        const superiorSchoolingRegistration = new SuperiorSchoolingRegistration({
          firstName: null,
          lastName: 'Kiddo',
          birthdate: new Date('1980-07-01'),
        });
        const validate = superiorSchoolingRegistration.validate.bind(superiorSchoolingRegistration);
        const error = await catchErr(validate)();

        expect(error).to.be.instanceOf(EntityValidationError);
      });
    });

    context('when firstName is present', () => {
      it('is valid', async () => {
        const superiorSchoolingRegistration = new SuperiorSchoolingRegistration({
          firstName: 'Oren',
          lastName: 'Ishii',
          birthdate: new Date('1990-07-01'),
        });

        try {
          superiorSchoolingRegistration.validate();
        } catch (e) {
          expect.fail('superiorSchoolingRegistration is valid when first when first name');
        }
      });
    });

    context('when lastName is not present', () => {
      it('throws an error', async () => {
        const superiorSchoolingRegistration = new SuperiorSchoolingRegistration({
          firstName: 'Beatrix',
          lastName: null,
          birthdate: new Date('1980-07-01'),
        });
        const validate = superiorSchoolingRegistration.validate.bind(superiorSchoolingRegistration);
        const error = await catchErr(validate)();

        expect(error).to.be.instanceOf(EntityValidationError);
      });
    });

    context('when birthdate is not present', () => {
      it('throws an error', async () => {
        const superiorSchoolingRegistration = new SuperiorSchoolingRegistration({
          firstName: 'Beatrix',
          lastName: 'Kiddo',
          birthdate: null,
        });
        const validate = superiorSchoolingRegistration.validate.bind(superiorSchoolingRegistration);
        const error = await catchErr(validate)();

        expect(error).to.be.instanceOf(EntityValidationError);
      });
    });

    context('when birthdate is not a date', () => {
      it('throws an error', async () => {
        const superiorSchoolingRegistration = new SuperiorSchoolingRegistration({
          firstName: 'Beatrix',
          lastName: 'Kiddo',
          birthdate: 'qdqsdqd',
        });
        const validate = superiorSchoolingRegistration.validate.bind(superiorSchoolingRegistration);
        const error = await catchErr(validate)();

        expect(error).to.be.instanceOf(EntityValidationError);
      });
    });

    context('when email is correctly formed', () => {
      it('throws an error', async () => {
        const superiorSchoolingRegistration = new SuperiorSchoolingRegistration({
          firstName: 'Beatrix',
          lastName: 'Kiddo',
          birthdate: '2020-01-01',
          email:  'azdxqsdsqdsqqsdqsd'
        });
        const validate = superiorSchoolingRegistration.validate.bind(superiorSchoolingRegistration);
        const error = await catchErr(validate)();

        expect(error).to.be.instanceOf(EntityValidationError);
      });
    });

  });
});
