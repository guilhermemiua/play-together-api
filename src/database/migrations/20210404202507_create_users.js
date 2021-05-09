exports.up = function (knex) {
  return knex.schema.createTable('user_tokens', (table) => {
    table.increments();
    table.integer('user_id').references('id').inTable('users').notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('user_tokens');
};
