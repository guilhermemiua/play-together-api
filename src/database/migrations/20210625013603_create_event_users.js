exports.up = function (knex) {
  return knex.schema.createTable('event_users', (table) => {
    table.increments();
    table
      .integer('user_id')
      .unsigned()
      .references('id')
      .inTable('users')
      .notNullable()
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    table
      .integer('event_id')
      .unsigned()
      .references('id')
      .inTable('events')
      .notNullable()
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('event_users');
};
