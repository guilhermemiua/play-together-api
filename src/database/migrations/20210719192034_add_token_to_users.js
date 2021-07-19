exports.up = function (knex) {
  return knex.schema.alterTable('users', (table) => {
    table.string('token').nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('users', (table) => {
    table.dropColumn('token');
  });
};
