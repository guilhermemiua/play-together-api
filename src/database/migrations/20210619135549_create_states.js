exports.up = function (knex) {
  return knex.schema.createTable('states', (table) => {
    table.increments();
    table.string('name').notNullable();
    table.string('abbreviation').notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('states');
};
