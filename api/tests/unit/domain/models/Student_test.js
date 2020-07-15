const Student = require('../../../../lib/domain/models/Student');
const { expect } = require('../../../test-helper');
const moment = require('moment');

describe('Unit | Domain | Models | Student', () => {

  let student;
  let firstAccount;
  let secondAccount;

  beforeEach(() => {
    firstAccount = { userId: 1, updatedAt: moment().add(1, 'd').toDate(), certificationCount: 1 };
    secondAccount = { userId: 2, updatedAt: moment().toDate(), certificationCount: 2 };
    student = new Student({ accounts: [firstAccount, secondAccount] });
  });

  describe('#getAppropriateAccount', () => {

    it('should return the account with most certification', () => {
      // when
      const appropriateAccount = student.getAppropriateAccount();

      // then
      expect(appropriateAccount).to.deep.equal(secondAccount);
    });

    context('when both account have the same number of certifications', () => {

      beforeEach(() => {
        secondAccount.certificationCount = 1;
      });

      it('should return the most recent account', () => {
        // when
        const appropriateAccount = student.getAppropriateAccount();

        // then
        expect(appropriateAccount).to.deep.equal(firstAccount);
      });
    });
  });
});
