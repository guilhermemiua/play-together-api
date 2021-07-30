const faker = require('faker');

function createUserFactory() {
  const genders = ['female', 'male'];
  const gender = faker.random.arrayElement(genders);

  const user = {
    first_name: faker.name.firstName(gender),
    last_name: faker.name.lastName(gender),
    email: faker.internet.email(),
    password: faker.internet.password(),
    age: faker.datatype.number(),
    gender,
  };

  return user;
}

module.exports = createUserFactory;
