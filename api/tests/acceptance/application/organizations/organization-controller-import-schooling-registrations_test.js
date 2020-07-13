const _ = require('lodash');
const iconv = require('iconv-lite');
const {
  expect, knex, databaseBuilder,
  generateValidRequestAuthorizationHeader,
} = require('../../../test-helper');

const createServer = require('../../../../server');

const Membership = require('../../../../lib/domain/models/Membership');

describe('Acceptance | Application | organization-controller-import-schooling-registrations', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('POST /api/organizations/{id}/SCO/import-students', () => {

    let organizationId;
    let options;

    beforeEach(async () => {
      const connectedUser = databaseBuilder.factory.buildUser();
      organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true }).id;
      databaseBuilder.factory.buildMembership({
        organizationId,
        userId: connectedUser.id,
        organizationRole: Membership.roles.ADMIN
      });
      await databaseBuilder.commit();

      options = {
        method: 'POST',
        url: `/api/organizations/${organizationId}/SCO/import-students`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(connectedUser.id),
        },
      };
    });

    afterEach(() => {
      return knex('schooling-registrations').delete();
    });

    context('Expected output', () => {

      context('when no schoolingRegistration has been imported yet, and the file is well formatted', () => {
        beforeEach(() => {
          const buffer = iconv.encode(
            '<?xml version="1.0" encoding="ISO-8859-15"?>' +
            '<BEE_ELEVES VERSION="2.1">' +
              '<DONNEES>' +
                '<ELEVES>' +
                  '<ELEVE ELEVE_ID="0001">' +
                    '<ID_NATIONAL>0000000001X</ID_NATIONAL>' +
                    '<NOM_DE_FAMILLE>HANDMADE</NOM_DE_FAMILLE>' +
                    '<NOM_USAGE></NOM_USAGE>' +
                    '<PRENOM>Luciole</PRENOM>' +
                    '<PRENOM2>Léa</PRENOM2>' +
                    '<PRENOM3>Lucy</PRENOM3>' +
                    '<DATE_NAISS>31/12/1994</DATE_NAISS>' +
                    '<CODE_PAYS>100</CODE_PAYS>' +
                    '<CODE_DEPARTEMENT_NAISS>033</CODE_DEPARTEMENT_NAISS>' +
                    '<CODE_COMMUNE_INSEE_NAISS>33318</CODE_COMMUNE_INSEE_NAISS>' +
                    '<CODE_MEF>123456789</CODE_MEF>' +
                    '<CODE_STATUT>AP</CODE_STATUT>' +
                  '</ELEVE>' +
                  '<ELEVE ELEVE_ID="0002">' +
                    '<ID_NATIONAL>00000000124</ID_NATIONAL>' +
                    '<NOM_DE_FAMILLE>COVERT</NOM_DE_FAMILLE>' +
                    '<NOM_USAGE>COJAUNE</NOM_USAGE>' +
                    '<PRENOM>Harry</PRENOM>' +
                    '<PRENOM2>Coco</PRENOM2>' +
                    '<PRENOM3></PRENOM3>' +
                    '<DATE_NAISS>01/07/1994</DATE_NAISS>' +
                    '<CODE_PAYS>132</CODE_PAYS>' +
                    '<VILLE_NAISS>LONDRES</VILLE_NAISS>' +
                    '<CODE_MEF>12341234</CODE_MEF>' +
                    '<CODE_STATUT>ST</CODE_STATUT>' +
                  '</ELEVE>' +
                '</ELEVES>' +
                '<STRUCTURES>' +
                  '<STRUCTURES_ELEVE ELEVE_ID="0001">' +
                    '<STRUCTURE>' +
                      '<CODE_STRUCTURE>4A</CODE_STRUCTURE>' +
                      '<TYPE_STRUCTURE>D</TYPE_STRUCTURE>' +
                    '</STRUCTURE>' +
                  '</STRUCTURES_ELEVE>' +
                  '<STRUCTURES_ELEVE ELEVE_ID="0002">' +
                    '<STRUCTURE>' +
                      '<CODE_STRUCTURE>4A</CODE_STRUCTURE>' +
                      '<TYPE_STRUCTURE>D</TYPE_STRUCTURE>' +
                    '</STRUCTURE>' +
                  '</STRUCTURES_ELEVE>' +
                '</STRUCTURES>' +
              '</DONNEES>' +
            '</BEE_ELEVES>', 'ISO-8859-15');
          options.payload = buffer;
        });

        it('should respond with a 204 - no content', async () => {
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(204);
        });

        it('should create all schoolingRegistrations', async () => {
          // when
          await server.inject(options);

          // then
          const schoolingRegistrations = await knex('schooling-registrations').where({ organizationId });
          expect(schoolingRegistrations).to.have.lengthOf(2);
          expect(_.map(schoolingRegistrations, 'firstName')).to.have.members(['Luciole', 'Harry']);
        });
      });

      context('when some schoolingRegistrations data are not well formatted', () => {
        beforeEach(() => {
          // given
          const wellFormattedStudent =
            '<ELEVE ELEVE_ID="0001">' +
              '<ID_NATIONAL>00000000123</ID_NATIONAL>' +
              '<NOM_DE_FAMILLE>HANDMADE</NOM_DE_FAMILLE>' +
              '<NOM_USAGE></NOM_USAGE>' +
              '<PRENOM>Luciole</PRENOM>' +
              '<PRENOM2>Léa</PRENOM2>' +
              '<PRENOM3>Lucy</PRENOM3>' +
              '<DATE_NAISS>31/12/1994</DATE_NAISS>' +
              '<CODE_PAYS>100</CODE_PAYS>' +
              '<CODE_DEPARTEMENT_NAISS>033</CODE_DEPARTEMENT_NAISS>' +
              '<CODE_COMMUNE_INSEE_NAISS>33318</CODE_COMMUNE_INSEE_NAISS>' +
              '<CODE_MEF>123456789</CODE_MEF>' +
              '<CODE_STATUT>AP</CODE_STATUT>' +
            '</ELEVE>';

          const malformedStudentsBuffer = iconv.encode(
            '<?xml version="1.0" encoding="ISO-8859-15"?>' +
            '<BEE_ELEVES VERSION="2.1">' +
              '<DONNEES>' +
                '<ELEVES>' +
                  wellFormattedStudent +
                  '<ELEVE ELEVE_ID="0002">' +
                    '<NOM_DE_FAMILLE>COVERT</NOM_DE_FAMILLE>' +
                    '<NOM_USAGE>COJAUNE</NOM_USAGE>' +
                    '<PRENOM>Harry</PRENOM>' +
                    '<PRENOM2>Coco</PRENOM2>' +
                    '<PRENOM3></PRENOM3>' +
                    '<DATE_NAISS>01/07/1994</DATE_NAISS>' +
                    '<CODE_PAYS>100</CODE_PAYS>' +
                    '<CODE_DEPARTEMENT_NAISS>033</CODE_DEPARTEMENT_NAISS>' +
                    '<CODE_COMMUNE_INSEE_NAISS>33318</CODE_COMMUNE_INSEE_NAISS>' +
                    '<CODE_MEF>12341234</CODE_MEF>' +
                    '<CODE_STATUT>ST</CODE_STATUT>' +
                  '</ELEVE>' +
                  '<ELEVE ELEVE_ID="0003">' +
                    '<ID_NATIONAL>00000000124</ID_NATIONAL>' +
                    '<NOM_DE_FAMILLE>DAUMUR</NOM_DE_FAMILLE>' +
                    '<PRENOM>Bran</PRENOM>' +
                    '<DATE_NAISS>01/07/1994</DATE_NAISS>' +
                    '<CODE_PAYS>100</CODE_PAYS>' +
                    '<CODE_DEPARTEMENT_NAISS>033</CODE_DEPARTEMENT_NAISS>' +
                    '<CODE_COMMUNE_INSEE_NAISS>33318</CODE_COMMUNE_INSEE_NAISS>' +
                    '<CODE_MEF>12341234</CODE_MEF>' +
                    '<CODE_STATUT>ST</CODE_STATUT>' +
                  '</ELEVE>' +
                  '<ELEVE ELEVE_ID="0004">' +
                    '<ID_NATIONAL>00000000125</ID_NATIONAL>' +
                    '<NOM_DE_FAMILLE>FRAS</NOM_DE_FAMILLE>' +
                    '<PRENOM>Valentin</PRENOM>' +
                    '<DATE_NAISS>01/07/1994</DATE_NAISS>' +
                    '<CODE_PAYS>100</CODE_PAYS>' +
                    '<CODE_DEPARTEMENT_NAISS>033</CODE_DEPARTEMENT_NAISS>' +
                    '<CODE_COMMUNE_INSEE_NAISS>33318</CODE_COMMUNE_INSEE_NAISS>' +
                    '<CODE_MEF>12341234</CODE_MEF>' +
                    '<CODE_STATUT>ST</CODE_STATUT>' +
                  '</ELEVE>' +
                  '<ELEVE ELEVE_ID="0005">' +
                    '<ID_NATIONAL>00000000126</ID_NATIONAL>' +
                    '<NOM_DE_FAMILLE>VANDOU</NOM_DE_FAMILLE>' +
                    '<PRENOM>Hubert</PRENOM>' +
                    '<DATE_NAISS>31/08/2009</DATE_NAISS>' +
                    '<DATE_SORTIE>01/09/2019</DATE_SORTIE>' +
                    '<CODE_PAYS>100</CODE_PAYS>' +
                    '<CODE_DEPARTEMENT_NAISS>033</CODE_DEPARTEMENT_NAISS>' +
                    '<CODE_COMMUNE_INSEE_NAISS>33318</CODE_COMMUNE_INSEE_NAISS>' +
                    '<CODE_MEF>12341234</CODE_MEF>' +
                    '<CODE_STATUT>ST</CODE_STATUT>' +
                  '</ELEVE>' +
                '</ELEVES>' +
                '<STRUCTURES>' +
                  '<STRUCTURES_ELEVE ELEVE_ID="0001">' +
                    '<STRUCTURE>' +
                      '<CODE_STRUCTURE>4A</CODE_STRUCTURE>' +
                      '<TYPE_STRUCTURE>D</TYPE_STRUCTURE>' +
                    '</STRUCTURE>' +
                  '</STRUCTURES_ELEVE>' +
                  '<STRUCTURES_ELEVE ELEVE_ID="0002">' +
                    '<STRUCTURE>' +
                      '<CODE_STRUCTURE>4A</CODE_STRUCTURE>' +
                      '<TYPE_STRUCTURE>D</TYPE_STRUCTURE>' +
                    '</STRUCTURE>' +
                  '</STRUCTURES_ELEVE>' +
                  '<STRUCTURES_ELEVE ELEVE_ID="0004">' +
                    '<STRUCTURE>' +
                      '<CODE_STRUCTURE>Inactifs</CODE_STRUCTURE>' +
                      '<TYPE_STRUCTURE>D</TYPE_STRUCTURE>' +
                    '</STRUCTURE>' +
                  '</STRUCTURES_ELEVE>' +
                  '<STRUCTURES_ELEVE ELEVE_ID="0005">' +
                    '<STRUCTURE>' +
                      '<CODE_STRUCTURE>5B</CODE_STRUCTURE>' +
                      '<TYPE_STRUCTURE>D</TYPE_STRUCTURE>' +
                    '</STRUCTURE>' +
                  '</STRUCTURES_ELEVE>' +
                '</STRUCTURES>' +
              '</DONNEES>' +
            '</BEE_ELEVES>', 'ISO-8859-15');

          options.payload = malformedStudentsBuffer;
        });

        it('should save well formatted schoolingRegistrations only', async () => {
          // when
          await server.inject(options);

          // then
          const schoolingRegistrations = await knex('schooling-registrations').where({ organizationId });
          expect(schoolingRegistrations).to.have.lengthOf(1);
          expect(schoolingRegistrations[0].lastName).to.equal('HANDMADE');
        });
      });

      context('when the schoolingRegistration has already been imported, but in another organization', () => {
        beforeEach(async () => {
          // given
          const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
          databaseBuilder.factory.buildSchoolingRegistration({ nationalStudentId: '00000000124', organizationId: otherOrganizationId });
          await databaseBuilder.commit();

          const buffer = iconv.encode(
            '<?xml version="1.0" encoding="ISO-8859-15"?>' +
            '<BEE_ELEVES VERSION="2.1">' +
              '<DONNEES>' +
                '<ELEVES>' +
                  '<ELEVE ELEVE_ID="0001">' +
                    '<ID_NATIONAL>00000000124</ID_NATIONAL>' +
                    '<NOM_DE_FAMILLE>COVERT</NOM_DE_FAMILLE>' +
                    '<NOM_USAGE>COJAUNE</NOM_USAGE>' +
                    '<PRENOM>Harry</PRENOM>' +
                    '<PRENOM2>Coco</PRENOM2>' +
                    '<DATE_NAISS>01/07/1994</DATE_NAISS>' +
                    '<CODE_PAYS>132</CODE_PAYS>' +
                    '<VILLE_NAISS>LONDRES</VILLE_NAISS>' +
                    '<CODE_MEF>12341234</CODE_MEF>' +
                    '<CODE_STATUT>ST</CODE_STATUT>' +
                  '</ELEVE>' +
                '</ELEVES>' +
                '<STRUCTURES>' +
                  '<STRUCTURES_ELEVE ELEVE_ID="0001">' +
                    '<STRUCTURE>' +
                      '<CODE_STRUCTURE>4A</CODE_STRUCTURE>' +
                      '<TYPE_STRUCTURE>D</TYPE_STRUCTURE>' +
                    '</STRUCTURE>' +
                  '</STRUCTURES_ELEVE>' +
                '</STRUCTURES>' +
              '</DONNEES>' +
            '</BEE_ELEVES>', 'ISO-8859-15');

          options.payload = buffer;
        });

        it('should save the schoolingRegistration in the current organization', async () => {
          // when
          const response = await server.inject(options);

          // then
          const schoolingRegistrations = await knex('schooling-registrations').where({ nationalStudentId: '00000000124' });
          expect(schoolingRegistrations).to.have.lengthOf(2);
          expect(response.statusCode).to.equal(204);
        });
      });

      context('when a schoolingRegistration is present twice in the file', () => {
        beforeEach(async () => {
          // given
          const schoolingRegistration1 =
            '<ELEVE ELEVE_ID="0001">' +
            '<ID_NATIONAL>00000000123</ID_NATIONAL>' +
            '<NOM_DE_FAMILLE>COVERT</NOM_DE_FAMILLE>' +
            '<PRENOM>Harry</PRENOM>' +
            '<DATE_NAISS>01/07/1994</DATE_NAISS>' +
            '<CODE_PAYS>100</CODE_PAYS>' +
            '<CODE_DEPARTEMENT_NAISS>033</CODE_DEPARTEMENT_NAISS>' +
            '<CODE_COMMUNE_INSEE_NAISS>33318</CODE_COMMUNE_INSEE_NAISS>' +
            '<CODE_MEF>12341234</CODE_MEF>' +
            '<CODE_STATUT>ST</CODE_STATUT>' +
            '</ELEVE>';

          const schoolingRegistration2 =
            '<ELEVE ELEVE_ID="0002">' +
            '<ID_NATIONAL>00000000123</ID_NATIONAL>' +
            '<NOM_DE_FAMILLE>COVERT</NOM_DE_FAMILLE>' +
            '<PRENOM>Harry</PRENOM>' +
            '<DATE_NAISS>02/07/1994</DATE_NAISS>' +
            '<CODE_PAYS>100</CODE_PAYS>' +
            '<CODE_DEPARTEMENT_NAISS>033</CODE_DEPARTEMENT_NAISS>' +
            '<CODE_COMMUNE_INSEE_NAISS>33318</CODE_COMMUNE_INSEE_NAISS>' +
            '<CODE_MEF>12341234</CODE_MEF>' +
            '<CODE_STATUT>ST</CODE_STATUT>' +
            '</ELEVE>';

          const bufferWithMalformedStudent = iconv.encode(
            '<?xml version="1.0" encoding="ISO-8859-15"?>' +
            '<BEE_ELEVES VERSION="2.1">' +
            '<DONNEES>' +
            '<ELEVES>' +
            schoolingRegistration1 +
            schoolingRegistration2 +
            '</ELEVES>' +
            '<STRUCTURES>' +
            '<STRUCTURES_ELEVE ELEVE_ID="0001">' +
            '<STRUCTURE>' +
            '<CODE_STRUCTURE>4A</CODE_STRUCTURE>' +
            '<TYPE_STRUCTURE>D</TYPE_STRUCTURE>' +
            '</STRUCTURE>' +
            '</STRUCTURES_ELEVE>' +
            '<STRUCTURES_ELEVE ELEVE_ID="0002">' +
            '<STRUCTURE>' +
            '<CODE_STRUCTURE>4A</CODE_STRUCTURE>' +
            '<TYPE_STRUCTURE>D</TYPE_STRUCTURE>' +
            '</STRUCTURE>' +
            '</STRUCTURES_ELEVE>' +
            '</STRUCTURES>' +
            '</DONNEES>' +
            '</BEE_ELEVES>', 'ISO-8859-15');

          options.payload = bufferWithMalformedStudent;
        });

        it('should not import any schoolingRegistration and return a 409 - Conflict', async () => {
          // when
          const response = await server.inject(options);

          // then
          const schoolingRegistrations = await knex('schooling-registrations').where({ organizationId });
          expect(schoolingRegistrations).to.have.lengthOf(0);
          expect(response.statusCode).to.equal(422);
          expect(response.result.errors[0].detail).to.equal('L’INE 00000000123 est présent plusieurs fois dans le fichier. La base SIECLE doit être corrigée pour supprimer les doublons. Réimportez ensuite le nouveau fichier.');
        });
      });

      context('when a schoolingRegistration cant be updated', () => {
        beforeEach(async () => {
          // given
          const schoolingRegistrationThatCantBeUpdatedBecauseBirthdateIsMissing =
            '<ELEVE ELEVE_ID="0001">' +
              '<ID_NATIONAL>00000000456</ID_NATIONAL>' +
              '<NOM_DE_FAMILLE>COVERT</NOM_DE_FAMILLE>' +
              '<NOM_USAGE>COJAUNE</NOM_USAGE>' +
              '<PRENOM>Harry</PRENOM>' +
              '<PRENOM2>Coco</PRENOM2>' +
              '<PRENOM3></PRENOM3>' +
              '<DATE_NAISS></DATE_NAISS>' +
              '<CODE_PAYS>100</CODE_PAYS>' +
              '<CODE_DEPARTEMENT_NAISS>033</CODE_DEPARTEMENT_NAISS>' +
              '<CODE_COMMUNE_INSEE_NAISS>33318</CODE_COMMUNE_INSEE_NAISS>' +
              '<CODE_MEF>12341234</CODE_MEF>' +
              '<CODE_STATUT>ST</CODE_STATUT>' +
            '</ELEVE>';

          const schoolingRegistrationThatCouldBeUpdated =
            '<ELEVE ELEVE_ID="0002">' +
              '<ID_NATIONAL>00000000123</ID_NATIONAL>' +
              '<NOM_DE_FAMILLE>JAUNE</NOM_DE_FAMILLE>' +
              '<NOM_USAGE></NOM_USAGE>' +
              '<PRENOM>ATTEND</PRENOM>' +
              '<PRENOM2></PRENOM2>' +
              '<PRENOM3></PRENOM3>' +
              '<DATE_NAISS>01/07/1994</DATE_NAISS>' +
              '<CODE_PAYS>100</CODE_PAYS>' +
              '<CODE_DEPARTEMENT_NAISS>033</CODE_DEPARTEMENT_NAISS>' +
              '<CODE_COMMUNE_INSEE_NAISS>33318</CODE_COMMUNE_INSEE_NAISS>' +
              '<CODE_MEF>12341234</CODE_MEF>' +
              '<CODE_STATUT>ST</CODE_STATUT>' +
            '</ELEVE>';

          const bufferWithMalformedStudent = iconv.encode(
            '<?xml version="1.0" encoding="ISO-8859-15"?>' +
            '<BEE_ELEVES VERSION="2.1">' +
              '<DONNEES>' +
                '<ELEVES>' +
                  schoolingRegistrationThatCantBeUpdatedBecauseBirthdateIsMissing +
                  schoolingRegistrationThatCouldBeUpdated +
                '</ELEVES>' +
                '<STRUCTURES>' +
                  '<STRUCTURES_ELEVE ELEVE_ID="0001">' +
                    '<STRUCTURE>' +
                      '<CODE_STRUCTURE>4A</CODE_STRUCTURE>' +
                      '<TYPE_STRUCTURE>D</TYPE_STRUCTURE>' +
                    '</STRUCTURE>' +
                  '</STRUCTURES_ELEVE>' +
                  '<STRUCTURES_ELEVE ELEVE_ID="0002">' +
                    '<STRUCTURE>' +
                      '<CODE_STRUCTURE>4A</CODE_STRUCTURE>' +
                      '<TYPE_STRUCTURE>D</TYPE_STRUCTURE>' +
                    '</STRUCTURE>' +
                  '</STRUCTURES_ELEVE>' +
                  '<STRUCTURES_ELEVE ELEVE_ID="0003">' +
                    '<STRUCTURE>' +
                      '<CODE_STRUCTURE>4A</CODE_STRUCTURE>' +
                      '<TYPE_STRUCTURE>D</TYPE_STRUCTURE>' +
                    '</STRUCTURE>' +
                  '</STRUCTURES_ELEVE>' +
                '</STRUCTURES>' +
              '</DONNEES>' +
            '</BEE_ELEVES>', 'ISO-8859-15');

          options.payload = bufferWithMalformedStudent;

          databaseBuilder.factory.buildSchoolingRegistration({
            lastName: 'LALOUX',
            firstName: 'RENE',
            nationalStudentId: '123',
            organizationId
          });
          databaseBuilder.factory.buildSchoolingRegistration({
            lastName: 'UEMATSU',
            firstName: 'NOBUO',
            nationalStudentId: '456',
            organizationId
          });

          await databaseBuilder.commit();
        });

        it('should not update any schoolingRegistration and return a 400 - Bad Request', async () => {
          // when
          const response = await server.inject(options);

          // then
          const schoolingRegistrations = await knex('schooling-registrations').where({ organizationId });
          expect(_.map(schoolingRegistrations, 'lastName')).to.have.members(['LALOUX', 'UEMATSU']);
          expect(response.statusCode).to.equal(400);
          expect(response.result.errors[0].detail).to.equal('Une erreur est survenue durant le traitement.');
        });
      });

      context('when a schoolingRegistration cant be updated but another could be created', () => {
        beforeEach(async () => {
          // given
          const schoolingRegistrationThatCouldBeCreated =
            '<ELEVE ELEVE_ID="0001">' +
              '<ID_NATIONAL>123</ID_NATIONAL>' +
              '<NOM_DE_FAMILLE>COLAGRECO</NOM_DE_FAMILLE>' +
              '<NOM_USAGE>PEPSIGRECO</NOM_USAGE>' +
              '<PRENOM>ARNAUD</PRENOM>' +
              '<PRENOM2></PRENOM2>' +
              '<PRENOM3></PRENOM3>' +
              '<DATE_NAISS>01/07/1994</DATE_NAISS>' +
              '<CODE_PAYS>100</CODE_PAYS>' +
              '<CODE_DEPARTEMENT_NAISS>033</CODE_DEPARTEMENT_NAISS>' +
              '<CODE_COMMUNE_INSEE_NAISS>33318</CODE_COMMUNE_INSEE_NAISS>' +
              '<CODE_MEF>12341234</CODE_MEF>' +
              '<CODE_STATUT>ST</CODE_STATUT>' +
            '</ELEVE>';

          const schoolingRegistrationThatCantBeUpdatedBecauseBirthdateIsMissing =
            '<ELEVE ELEVE_ID="0002">' +
              '<ID_NATIONAL>456</ID_NATIONAL>' +
              '<NOM_DE_FAMILLE>COVERT</NOM_DE_FAMILLE>' +
              '<NOM_USAGE>COJAUNE</NOM_USAGE>' +
              '<PRENOM>Harry</PRENOM>' +
              '<PRENOM2>Coco</PRENOM2>' +
              '<PRENOM3></PRENOM3>' +
              '<DATE_NAISS></DATE_NAISS>' +
              '<CODE_PAYS>100</CODE_PAYS>' +
              '<CODE_DEPARTEMENT_NAISS>033</CODE_DEPARTEMENT_NAISS>' +
              '<CODE_COMMUNE_INSEE_NAISS>33318</CODE_COMMUNE_INSEE_NAISS>' +
              '<CODE_MEF>12341234</CODE_MEF>' +
              '<CODE_STATUT>ST</CODE_STATUT>' +
            '</ELEVE>';

          const schoolingRegistrationThatCouldBeUpdated =
            '<ELEVE ELEVE_ID="0003">' +
              '<ID_NATIONAL>789</ID_NATIONAL>' +
              '<NOM_DE_FAMILLE>JAUNE</NOM_DE_FAMILLE>' +
              '<NOM_USAGE></NOM_USAGE>' +
              '<PRENOM>ATTEND</PRENOM>' +
              '<PRENOM2></PRENOM2>' +
              '<PRENOM3></PRENOM3>' +
              '<DATE_NAISS>01/07/1994</DATE_NAISS>' +
              '<CODE_PAYS>100</CODE_PAYS>' +
              '<CODE_DEPARTEMENT_NAISS>033</CODE_DEPARTEMENT_NAISS>' +
              '<CODE_COMMUNE_INSEE_NAISS>33318</CODE_COMMUNE_INSEE_NAISS>' +
              '<CODE_MEF>12341234</CODE_MEF>' +
              '<CODE_STATUT>ST</CODE_STATUT>' +
            '</ELEVE>';

          const buffer = iconv.encode(
            '<?xml version="1.0" encoding="ISO-8859-15"?>' +
            '<BEE_ELEVES VERSION="2.1">' +
              '<DONNEES>' +
                '<ELEVES>' +
                  schoolingRegistrationThatCouldBeCreated +
                  schoolingRegistrationThatCantBeUpdatedBecauseBirthdateIsMissing +
                  schoolingRegistrationThatCouldBeUpdated +
                '</ELEVES>' +
                '<STRUCTURES>' +
                  '<STRUCTURES_ELEVE ELEVE_ID="0001">' +
                    '<STRUCTURE>' +
                      '<CODE_STRUCTURE>4A</CODE_STRUCTURE>' +
                      '<TYPE_STRUCTURE>D</TYPE_STRUCTURE>' +
                    '</STRUCTURE>' +
                  '</STRUCTURES_ELEVE>' +
                  '<STRUCTURES_ELEVE ELEVE_ID="0002">' +
                    '<STRUCTURE>' +
                      '<CODE_STRUCTURE>4A</CODE_STRUCTURE>' +
                      '<TYPE_STRUCTURE>D</TYPE_STRUCTURE>' +
                    '</STRUCTURE>' +
                  '</STRUCTURES_ELEVE>' +
                '</STRUCTURES>' +
              '</DONNEES>' +
            '</BEE_ELEVES>', 'ISO-8859-15');

          options.payload = buffer;

          databaseBuilder.factory.buildSchoolingRegistration({
            lastName: 'LALOUX',
            firstName: 'RENE',
            nationalStudentId: '456',
            organizationId
          });
          databaseBuilder.factory.buildSchoolingRegistration({
            lastName: 'UEMATSU',
            firstName: 'NOBUO',
            nationalStudentId: '789',
            organizationId
          });

          await databaseBuilder.commit();
        });

        it('should not update and create anyone, and return a 400 - Bad Request', async () => {
          // when
          const response = await server.inject(options);

          // then
          const schoolingRegistrations = await knex('schooling-registrations').where({ organizationId });
          expect(schoolingRegistrations).to.have.lengthOf(2);
          expect(_.map(schoolingRegistrations, 'lastName')).to.have.members(['LALOUX', 'UEMATSU']);
          expect(response.statusCode).to.equal(400);
        });
      });

      context('when a schoolingRegistration cant be created but another could be updated', () => {
        beforeEach(async () => {
          // given
          const schoolingRegistrationThatCantBeCreatedBecauseBirthdateIsMissing =
            '<ELEVE ELEVE_ID="0001">' +
              '<ID_NATIONAL>123</ID_NATIONAL>' +
              '<NOM_DE_FAMILLE>COLAGRECO</NOM_DE_FAMILLE>' +
              '<NOM_USAGE>PEPSIGRECO</NOM_USAGE>' +
              '<PRENOM>ARNAUD</PRENOM>' +
              '<PRENOM2></PRENOM2>' +
              '<PRENOM3></PRENOM3>' +
              '<DATE_NAISS></DATE_NAISS>' +
              '<CODE_PAYS>100</CODE_PAYS>' +
              '<CODE_DEPARTEMENT_NAISS>033</CODE_DEPARTEMENT_NAISS>' +
              '<CODE_COMMUNE_INSEE_NAISS>33318</CODE_COMMUNE_INSEE_NAISS>' +
              '<CODE_MEF>12341234</CODE_MEF>' +
              '<CODE_STATUT>ST</CODE_STATUT>' +
            '</ELEVE>';

          const schoolingRegistrationThatCouldBeCreated =
            '<ELEVE ELEVE_ID="0002">' +
              '<ID_NATIONAL>456</ID_NATIONAL>' +
              '<NOM_DE_FAMILLE>COVERT</NOM_DE_FAMILLE>' +
              '<NOM_USAGE>COJAUNE</NOM_USAGE>' +
              '<PRENOM>Harry</PRENOM>' +
              '<PRENOM2>Coco</PRENOM2>' +
              '<PRENOM3></PRENOM3>' +
              '<DATE_NAISS>01/07/1994</DATE_NAISS>' +
              '<CODE_PAYS>100</CODE_PAYS>' +
              '<CODE_DEPARTEMENT_NAISS>033</CODE_DEPARTEMENT_NAISS>' +
              '<CODE_COMMUNE_INSEE_NAISS>33318</CODE_COMMUNE_INSEE_NAISS>' +
              '<CODE_MEF>12341234</CODE_MEF>' +
              '<CODE_STATUT>ST</CODE_STATUT>' +
            '</ELEVE>';

          const schoolingRegistrationThatCouldBeUpdated =
            '<ELEVE ELEVE_ID="0003">' +
              '<ID_NATIONAL>789</ID_NATIONAL>' +
              '<NOM_DE_FAMILLE>JAUNE</NOM_DE_FAMILLE>' +
              '<NOM_USAGE></NOM_USAGE>' +
              '<PRENOM>ATTEND</PRENOM>' +
              '<PRENOM2></PRENOM2>' +
              '<PRENOM3></PRENOM3>' +
              '<DATE_NAISS>01/07/1994</DATE_NAISS>' +
              '<CODE_PAYS>100</CODE_PAYS>' +
              '<CODE_DEPARTEMENT_NAISS>033</CODE_DEPARTEMENT_NAISS>' +
              '<CODE_COMMUNE_INSEE_NAISS>33318</CODE_COMMUNE_INSEE_NAISS>' +
              '<CODE_MEF>12341234</CODE_MEF>' +
              '<CODE_STATUT>ST</CODE_STATUT>' +
            '</ELEVE>';

          const buffer = iconv.encode(
            '<?xml version="1.0" encoding="ISO-8859-15"?>' +
            '<BEE_ELEVES VERSION="2.1">' +
              '<DONNEES>' +
                '<ELEVES>' +
                  schoolingRegistrationThatCantBeCreatedBecauseBirthdateIsMissing +
                  schoolingRegistrationThatCouldBeCreated +
                  schoolingRegistrationThatCouldBeUpdated +
                '</ELEVES>' +
                '<STRUCTURES>' +
                  '<STRUCTURES_ELEVE ELEVE_ID="0001">' +
                    '<STRUCTURE>' +
                      '<CODE_STRUCTURE>4A</CODE_STRUCTURE>' +
                      '<TYPE_STRUCTURE>D</TYPE_STRUCTURE>' +
                    '</STRUCTURE>' +
                  '</STRUCTURES_ELEVE>' +
                  '<STRUCTURES_ELEVE ELEVE_ID="0002">' +
                    '<STRUCTURE>' +
                      '<CODE_STRUCTURE>4A</CODE_STRUCTURE>' +
                      '<TYPE_STRUCTURE>D</TYPE_STRUCTURE>' +
                    '</STRUCTURE>' +
                  '</STRUCTURES_ELEVE>' +
                  '<STRUCTURES_ELEVE ELEVE_ID="0003">' +
                    '<STRUCTURE>' +
                      '<CODE_STRUCTURE>4A</CODE_STRUCTURE>' +
                      '<TYPE_STRUCTURE>D</TYPE_STRUCTURE>' +
                    '</STRUCTURE>' +
                  '</STRUCTURES_ELEVE>' +
                '</STRUCTURES>' +
              '</DONNEES>' +
            '</BEE_ELEVES>', 'ISO-8859-15');

          options.payload = buffer;

          databaseBuilder.factory.buildSchoolingRegistration({
            lastName: 'LALOUX',
            firstName: 'RENE',
            nationalStudentId: '789',
            organizationId
          });

          await databaseBuilder.commit();
        });

        it('should not update and create anyone, and return a 400 - Bad Request', async () => {
          // when
          const response = await server.inject(options);

          // then
          const schoolingRegistrations = await knex('schooling-registrations').where({ organizationId });
          expect(schoolingRegistrations).to.have.lengthOf(1);
          expect(_.map(schoolingRegistrations, 'lastName')).to.have.members(['LALOUX']);
          expect(response.statusCode).to.equal(400);
        });
      });

      context('when a schoolingRegistration cant be imported', async() => {
        beforeEach(() => {
          // given
          const malformedStudentsBuffer = iconv.encode(
            '<?xml version="1.0" encoding="ISO-8859-15"?>' +
            '<BEE_ELEVES VERSION="2.1">' +
              '<DONNEES>' +
                '<ELEVES>' +
                  '<ELEVE ELEVE_ID="0001">' +
                    '<ID_NATIONAL>123</ID_NATIONAL>' +
                    '<NOM_DE_FAMILLE>WRONG</NOM_DE_FAMILLE>' +
                    '<PRENOM>Person</PRENOM>' +
                  '</ELEVE>' +
                '</ELEVES>' +
                '<STRUCTURES>' +
                  '<STRUCTURES_ELEVE ELEVE_ID="0001">' +
                    '<STRUCTURE>' +
                      '<CODE_STRUCTURE>4A</CODE_STRUCTURE>' +
                      '<TYPE_STRUCTURE>D</TYPE_STRUCTURE>' +
                    '</STRUCTURE>' +
                  '</STRUCTURES_ELEVE>' +
                '</STRUCTURES>' +
              '</DONNEES>' +
            '</BEE_ELEVES>', 'ISO-8859-15');
          options.payload = malformedStudentsBuffer;
        });

        it('should not import the schoolingRegistrations and return a 400 - Bad Request', async () => {
          // when
          const response = await server.inject(options);

          // then
          const schoolingRegistrations = await knex('schooling-registrations').where({ organizationId });
          expect(schoolingRegistrations).to.have.lengthOf(0);
          expect(response.statusCode).to.equal(400);
          expect(response.result.errors[0].detail).to.equal('Une erreur est survenue durant le traitement.');
        });
      });

      context('when file in not properly formatted', async() => {
        beforeEach(() => {
          // given
          const malformedBuffer = iconv.encode(
            '<?xml version="1.0" encoding="ISO-8859-15"?>' +
            '<BEE_ELEVES VERSION="2.1">' +
            '</BEE_ELEVES>', 'ISO-8859-15');
          options.payload = malformedBuffer;
        });

        it('should return a 422 - Unprocessable Entity', async () => {
          // when
          const response = await server.inject(options);

          // then
          const schoolingRegistrations = await knex('schooling-registrations').where({ organizationId });
          expect(schoolingRegistrations).to.have.lengthOf(0);
          expect(response.statusCode).to.equal(422);
          expect(response.result.errors[0].detail).to.equal('Aucune inscription d\'élève n\'a pu être importée depuis ce fichier.Vérifiez que le fichier est conforme.');
        });
      });
    });

    context('Resource access management', () => {
      beforeEach(() => {
        const buffer = iconv.encode(
          '<?xml version="1.0" encoding="ISO-8859-15"?>' +
          '<BEE_ELEVES VERSION="2.1">' +
          '</BEE_ELEVES>', 'ISO-8859-15');
        options.payload = buffer;
      });

      context('when user is not authenticated', () => {
        beforeEach(() => {
          // given
          options.headers.authorization = 'invalid.access.token';
        });

        it('should respond with a 401 - unauthorized access', async () => {
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(401);
        });
      });

      context('when user user does not belong to Organization', () => {
        beforeEach(async () => {
          // given
          const userId = databaseBuilder.factory.buildUser.withMembership().id;
          await databaseBuilder.commit();

          options.headers.authorization = generateValidRequestAuthorizationHeader(userId);
        });

        it('should respond with a 403 - Forbidden access', async () => {
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(403);
        });
      });

      context('when Organization does not manage schoolingRegistrations', () => {
        beforeEach(async () => {
          // given
          const organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: false }).id;
          const userId = databaseBuilder.factory.buildUser.withMembership({
            organizationId,
            organizationRole: Membership.roles.ADMIN
          }).id;
          await databaseBuilder.commit();

          options.headers.authorization = generateValidRequestAuthorizationHeader(userId);
          options.url = `/api/organizations/${organizationId}/SCO/import-students`;
        });

        it('should respond with a 403 - Forbidden access', async () => {
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(403);
        });
      });

      context('when user is not ADMIN', () => {
        beforeEach(async () => {
          // given
          const organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true }).id;
          const userId = databaseBuilder.factory.buildUser.withMembership({
            organizationId,
            organizationRole: Membership.roles.MEMBER
          }).id;
          await databaseBuilder.commit();

          options.headers.authorization = generateValidRequestAuthorizationHeader(userId);
          options.url = `/api/organizations/${organizationId}/SCO/import-students`;
        });

        it('should respond with a 403 - Forbidden access', async () => {
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });
});
