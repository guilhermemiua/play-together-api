exports.up = function (knex) {
  return knex.schema.createTable('group_users', (table) => {
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
      .integer('group_id')
      .unsigned()
      .references('id')
      .inTable('groups')
      .notNullable()
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('group_users');
};
