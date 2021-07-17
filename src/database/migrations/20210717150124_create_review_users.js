exports.up = function (knex) {
  return knex.schema.createTable('review_users', (table) => {
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
      .integer('user_reviewed_id')
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
    table.integer('rating').notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('review_users');
};
