exports.up = function (knex) {
  return knex.schema.createTable('events', (table) => {
    table.increments();
    table.string('sport').notNullable();
    table.string('local').notNullable();
    table.date('date').notNullable();
    table.datetime('start_time').notNullable();
    table.datetime('end_time').notNullable();
    table.integer('players_quantity').notNullable();
    table
      .integer('user_id')
      .unsigned()
      .references('id')
      .inTable('users')
      .notNullable()
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('events');
};
