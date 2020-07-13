const { expect, databaseBuilder, knex } = require('../../../test-helper');

const importSuperiorSchoolingRegistration = require('../../../../lib/domain/usecases/import-superior-schooling-registrations');
const superiorSchoolingRegistrationRepository = require('../../../../lib/infrastructure/repositories/superior-schooling-registration-repository');
const SuperiorSchoolingRegistrationParser = require('../../../../lib/infrastructure/serializers/csv/superior-schooling-registration-parser');

describe('Integration | UseCase | ImportSuperiorSchoolingRegistration', () => {

  afterEach(() => {
    return knex('schooling-registrations').delete();
  });

  it('parses the csv received and creates the SuperiorSchoolingRegistration', async () => {
    const buffer = `Premier prenom;Deuxieme prenom;Troisieme prenom;Nom de famille;Nom d usage;Date de naissance (jj/mm/aaaa);Email;Numero etudiant;Composante;Equipe pedagogique;Groupe;Diplome;Regime
        Beatrix;The;Bride;Kiddo;Black Mamba;1970-01-01;thebride@example.net;12346;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend;
        O-Ren;;;Ishii;Cottonmouth;1980-01-01;ishii@example.net;789;Assassination Squad;Bill;Deadly Viper Assassination Squad;DUT;;
    `.trim();

    const organization = databaseBuilder.factory.buildOrganization();
    await databaseBuilder.commit();
    await importSuperiorSchoolingRegistration({ organizationId: organization.id, superiorSchoolingRegistrationRepository, superiorSchoolingRegistrationParser: new SuperiorSchoolingRegistrationParser(buffer) });

    const registrations = await knex('schooling-registrations').where({ organizationId: organization.id });
    expect(registrations).to.have.lengthOf(2);
  });

});
