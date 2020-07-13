const { parse } = require('./csv-parser');
const SuperiorSchoolingRegistrationSet = require('../../../../lib/domain/models/SuperiorSchoolingRegistrationSet');
const columnNameByAttribute = {
  firstName: 'Premier prenom',
  middleName: 'Deuxieme prenom',
  thirdName: 'Troisieme prenom',
  lastName: 'Nom de famille',
  preferredLastName: 'Nom d usage',
  studentNumber: 'Numero etudiant',
  email: 'Email',
  degree: 'Diplome',
  division: 'Composante',
  teachingTeam: 'Equipe pedagogique',
  group: 'Groupe',
  studyScheme: 'Regime'
};

class SuperiorSchoolingRegistrationParser {

  constructor(input) {
    this._input = input;
  }

  parse() {
    const superiorSchoolingRegistrationSet = new SuperiorSchoolingRegistrationSet();

    const registrationLines = parse(this._input);

    registrationLines.forEach((line) => {
      const registrationAttributes = this._lineToRegistrationAttibutes(line);
      superiorSchoolingRegistrationSet.addRegistration(registrationAttributes);
    });

    return superiorSchoolingRegistrationSet;
  }

  _lineToRegistrationAttibutes(line) {
    const registrationAttributes = {};

    Object.keys(columnNameByAttribute).map((attribute) => {

      const column = columnNameByAttribute[attribute];
      registrationAttributes[attribute] = line[column];
    });

    registrationAttributes['birthdate'] = new Date(line['Date de naissance (jj/mm/aaaa)']);

    return registrationAttributes;
  }
}

module.exports = SuperiorSchoolingRegistrationParser;

