const faker = require('faker');

function createGroupFactory() {
  const group = {
    name: faker.name.title(),
  };

  return group;
}

module.exports = createGroupFactory;
