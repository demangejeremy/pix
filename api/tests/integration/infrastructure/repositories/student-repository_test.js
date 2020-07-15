const { expect, databaseBuilder } = require('../../../test-helper');
const studentRepository = require('../../../../lib/infrastructure/repositories/student-repository');

describe('Integration | Infrastructure | Repository | student-repository', () => {

  describe('#findReconciledStudentsByNationalStudentId', () => {

    it('should return instances of Student', async () => {
      // given
      const firstNationalStudentId = '1234';
      const firstUser = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildCertificationCourse({ userId: firstUser.id });
      databaseBuilder.factory.buildCertificationCourse({ userId: firstUser.id });
      databaseBuilder.factory.buildSchoolingRegistration({ userId: firstUser.id, nationalStudentId: firstNationalStudentId });

      const secondUser = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildCertificationCourse({ userId: secondUser.id });
      databaseBuilder.factory.buildSchoolingRegistration({ userId: secondUser.id, nationalStudentId: firstNationalStudentId });

      const secondNationalStudentId = '5678';
      const thirdUser = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildCertificationCourse({ userId: thirdUser.id });
      databaseBuilder.factory.buildSchoolingRegistration({ userId: thirdUser.id, nationalStudentId: secondNationalStudentId });

      await databaseBuilder.commit();

      // when
      const students = await studentRepository.findReconciledStudentsByNationalStudentId([firstNationalStudentId, secondNationalStudentId]);

      // then
      expect(students.length).to.equal(2);
      expect(students[0].nationalStudentId).to.equal(firstNationalStudentId);
      expect(students[0].accounts).to.have.deep.members([{ userId: firstUser.id, updatedAt: firstUser.updatedAt, certificationCount: 2 }, { userId: secondUser.id, updatedAt: secondUser.updatedAt, certificationCount: 1 }]);
      expect(students[1].nationalStudentId).to.equal(secondNationalStudentId);
      expect(students[1].accounts).to.have.deep.members([{ userId: thirdUser.id, updatedAt: thirdUser.updatedAt, certificationCount: 1 }]);
    });
  });
});
