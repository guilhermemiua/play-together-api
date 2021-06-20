exports.up = function (knex) {
  return knex.schema.createTable('cities', (table) => {
    table.increments();
    table.string('name').notNullable();
    table
      .integer('state_id')
      .unsigned()
      .references('id')
      .inTable('states')
      .notNullable()
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('cities');
};
