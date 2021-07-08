exports.up = function (knex) {
  return knex.schema.createTable('groups', (table) => {
    table.increments();
    table.string('name').notNullable();
    table.string('group_image');
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
  return knex.schema.dropTable('groups');
};
