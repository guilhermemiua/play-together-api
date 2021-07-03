exports.up = function (knex) {
  return knex.schema.createTable('friend_requests', (table) => {
    table.increments();
    table
      .integer('sender_id')
      .unsigned()
      .references('id')
      .inTable('users')
      .notNullable()
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    table
      .integer('receiver_id')
      .unsigned()
      .references('id')
      .inTable('users')
      .notNullable()
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('friend_requests');
};
