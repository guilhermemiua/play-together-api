exports.up = function (knex) {
  return knex.schema.alterTable('events', (table) => {
    table
      .integer('state_id')
      .unsigned()
      .references('id')
      .inTable('states')
      .nullable();
    table
      .integer('city_id')
      .unsigned()
      .references('id')
      .inTable('cities')
      .nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('events', (table) => {
    table.dropForeign('state_id');
    table.dropColumn('state_id');
    table.dropForeign('city_id');
    table.dropColumn('city_id');
  });
};
