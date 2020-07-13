const { expect } = require('../../../../test-helper');
const SuperiorSchoolingRegistrationParser = require('../../../../../lib/infrastructure/serializers/csv/superior-schooling-registration-parser');
const _ = require('lodash');

describe('SuperiorSchoolingRegistrationParser', () => {
  context('when the header is correctly formed', () => {
    context('when there is no line', () => {
      it('returns an empty SuperiorSchoolingRegistrationSet', () => {
        const input = 'Premier prenom;Deuxieme prenom;Troisieme prenom;Nom de famille;Nom d usage;Date de naissance (jj/mm/aaaa);Email;Numero etudiant;Composante;Equipe pedagogique;Groupe;Diplome;Regime';
        const parser = new SuperiorSchoolingRegistrationParser(input);

        const superiorSchoolingRegistrationSet = parser.parse();

        expect(superiorSchoolingRegistrationSet.registrations()).to.be.empty;
      });
    });
    context('when there are lines', () => {
      it('returns a SuperiorSchoolingRegistrationSet with a schooling registration for each line', () => {
        const input = `Premier prenom;Deuxieme prenom;Troisieme prenom;Nom de famille;Nom d usage;Date de naissance (jj/mm/aaaa);Email;Numero etudiant;Composante;Equipe pedagogique;Groupe;Diplome;Regime
        Beatrix;The;Bride;Kiddo;Black Mamba;1970-01-01;thebride@example.net;12346;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend;
        O-Ren;;;Ishii;Cottonmouth;1980-01-01;ishii@example.net;789;Assassination Squad;Bill;Deadly Viper Assassination Squad;DUT;;
        `;
        const parser = new SuperiorSchoolingRegistrationParser(input);

        const superiorSchoolingRegistrationSet = parser.parse();
        const registrations = superiorSchoolingRegistrationSet.registrations();
        expect(registrations).to.have.lengthOf(2);
      });

      it('returns a SuperiorSchoolingRegistrationSet with a schooling registration for each line using the CSV column', () => {
        const input = `Premier prenom;Deuxieme prenom;Troisieme prenom;Nom de famille;Nom d usage;Date de naissance (jj/mm/aaaa);Email;Numero etudiant;Composante;Equipe pedagogique;Groupe;Diplome;Regime
        Beatrix;The;Bride;Kiddo;Black Mamba;1970-01-01;thebride@example.net;123456;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend;
        O-Ren;;;Ishii;Cottonmouth;1980-01-01;ishii@example.net;789;Assassination Squad;Bill;Deadly Viper Assassination Squad;DUT;;
        `;
        const parser = new SuperiorSchoolingRegistrationParser(input);

        const superiorSchoolingRegistrationSet = parser.parse();
        const registrations = _.sortBy(superiorSchoolingRegistrationSet.registrations(), 'preferredLastName');
        expect(registrations[0]).to.deep.equal({
          firstName: 'Beatrix',
          middleName: 'The',
          thirdName: 'Bride',
          lastName: 'Kiddo',
          preferredLastName: 'Black Mamba',
          studentNumber: '123456',
          email: 'thebride@example.net',
          birthdate: new Date('1970-01-01'),
          degree: 'Master',
          division: 'Assassination Squad',
          teachingTeam: 'Hattori Hanzo',
          group: 'Deadly Viper Assassination Squad',
          studyScheme: 'hello darkness my old friend',
          organizationId: undefined
        });
        expect(registrations[1]).to.deep.equal({
          firstName: 'O-Ren',
          middleName: undefined,
          thirdName: undefined,
          lastName: 'Ishii',
          preferredLastName: 'Cottonmouth',
          studentNumber: '789',
          email: 'ishii@example.net',
          birthdate: new Date('1980-01-01'),
          degree: 'DUT',
          division: 'Assassination Squad',
          teachingTeam: 'Bill',
          group: 'Deadly Viper Assassination Squad',
          studyScheme: undefined,
          organizationId: undefined
        });
      });
    });
  });
});
