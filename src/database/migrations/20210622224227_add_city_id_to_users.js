exports.up = function (knex) {
  return knex.schema.alterTable('users', (table) => {
    table.dropColumn('city');
    table
      .integer('city_id')
      .unsigned()
      .references('id')
      .inTable('cities')
      .nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('users', (table) => {
    table.dropForeign('city_id');
    table.dropColumn('city_id');
    table.string('city');
  });
};
