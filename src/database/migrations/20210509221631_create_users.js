exports.up = function (knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments();
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.string('email').notNullable();
    table.string('password').notNullable();
    table.integer('age').notNullable();
    table.string('gender').notNullable();
    table.boolean('is_email_verified').notNullable().defaultTo(false);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('users');
};
