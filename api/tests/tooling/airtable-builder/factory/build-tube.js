module.exports = function buildTube({
  id = 'recTIeergjhID28Ep',
  nom = '@web',
  titre = '',
  description = '',
  titrePratique = 'Adresses',
  descriptionPratique = 'Connaitre le sujet',
  createdTime = '2018-03-15T14:35:03.000Z',
  competences = [
    'rectTASRUL6lz0sEJ',
  ],
} = {}) {

  return {
    id,
    'fields': {
      'id persistant': id,
      'Nom': nom,
      'Titre': titre,
      'Description': description,
      'Titre pratique': titrePratique,
      'Description pratique': descriptionPratique,
      'Competences (id persistant)': competences,
    },
    'createdTime': createdTime,
  };
};
