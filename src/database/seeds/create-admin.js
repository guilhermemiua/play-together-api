exports.seed = function (knex) {
  return knex('users')
    .del()
    .then(() =>
      // Inserts seed entries
      knex('users').insert([
        {
          email: 'admin@admin.com',
          password:
            '$2b$10$6iYI3EUn9HCQIpjK8PXjNuNxHJ8APehS7YQpZfPaEqN3mUg8.a1aW',
          role: 'admin',
        },
      ])
    );
};
