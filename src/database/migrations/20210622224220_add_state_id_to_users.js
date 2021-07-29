exports.up = function (knex) {
  return knex.schema.alterTable('users', (table) => {
    table.dropColumn('state');
    table
      .integer('state_id')
      .unsigned()
      .references('id')
      .inTable('states')
      .nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('users', (table) => {
    table.dropForeign('state_id');
    table.dropColumn('state_id');
    table.string('state');
  });
};
