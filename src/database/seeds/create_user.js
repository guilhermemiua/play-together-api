exports.seed = function (knex) {
  return knex('users')
    .del()
    .then(() =>
      knex('users').insert([
        {
          first_name: 'Guilherme',
          last_name: 'Eiti Akita Miua',
          email: 'admin@admin.com',
          password:
            '$2b$10$6iYI3EUn9HCQIpjK8PXjNuNxHJ8APehS7YQpZfPaEqN3mUg8.a1aW',
          age: 21,
          gender: 'male',
          is_email_verified: true,
        },
      ])
    );
};
