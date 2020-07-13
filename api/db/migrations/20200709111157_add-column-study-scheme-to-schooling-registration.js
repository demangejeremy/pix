const TABLE_NAME = 'schooling-registrations';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string('studyScheme');
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('studyScheme');
  });
};
