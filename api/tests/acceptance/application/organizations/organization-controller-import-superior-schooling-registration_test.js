const { expect, knex, databaseBuilder, generateValidRequestAuthorizationHeader } = require('../../../test-helper');
const Membership = require('../../../../lib/domain/models/Membership');

const createServer = require('../../../../server');
let server;

describe('Acceptance | Application | organization-controller-import-schooling-registrations', () => {

  beforeEach(async () => {
    server = await createServer();
  });

  afterEach(() => {
    return knex('schooling-registrations').delete();
  });

  describe('POST /api/organizations/{id}/sup/import-students', () => {
    let connectedUser;
    beforeEach(async () => {
      connectedUser = databaseBuilder.factory.buildUser();
      await databaseBuilder.commit();
    });

    context('when the user is an admin for an organization which managing student', () => {
      it('create schooling-registrations for the given organization', async () => {
        const organization = databaseBuilder.factory.buildOrganization({ type: 'SUP', isManagingStudents: true });
        databaseBuilder.factory.buildMembership({ organizationId: organization.id, userId: connectedUser.id, organizationRole: Membership.roles.ADMIN });
        await databaseBuilder.commit();
        const buffer =
          'Premier prenom;Deuxieme prenom;Troisieme prenom;Nom de famille;Nom d usage;Date de naissance (jj/mm/aaaa);Email;Numero etudiant;Composante;Equipe pedagogique;Groupe;Diplome;Regime\n' +
          'Beatrix;The;Bride;Kiddo;Black Mamba;1970-01-01;thebride@example.net;12346;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend\n' +
          'O-Ren;;;Ishii;Cottonmouth;1980-01-01;ishii@example.net;789;Assassination Squad;Bill;Deadly Viper Assassination Squad;DUT;;';

        const options = {
          method: 'POST',
          url: `/api/organizations/${organization.id}/sup/import-students`,
          headers: {
            authorization: generateValidRequestAuthorizationHeader(connectedUser.id),
          },
          payload: buffer
        };

        const response = await server.inject(options);
        const registrations = await knex('schooling-registrations').where({ organizationId: organization.id });

        expect(response.statusCode).to.equal(201);
        expect(registrations).to.have.lengthOf(2);

      });
    });

    context('when the user is not an admin for an organization which managing student', () => {
      it('create schooling-registrations for the given organization', async () => {
        const organization = databaseBuilder.factory.buildOrganization({ type: 'SUP', isManagingStudents: true });
        databaseBuilder.factory.buildMembership({ organizationId: organization.id, userId: connectedUser.id, organizationRole: Membership.roles.MEMBER });
        await databaseBuilder.commit();
        const buffer = 'Premier prenom;Deuxieme prenom;Troisieme prenom;Nom de famille;Nom d usage;Date de naissance (jj/mm/aaaa);Email;Numero etudiant;Composante;Equipe pedagogique;Groupe;Diplome;Regime';

        const options = {
          method: 'POST',
          url: `/api/organizations/${organization.id}/sup/import-students`,
          headers: {
            authorization: generateValidRequestAuthorizationHeader(connectedUser.id),
          },
          payload: buffer
        };

        const response = await server.inject(options);

        expect(response.statusCode).to.equal(403);
      });
    });
  });
});
