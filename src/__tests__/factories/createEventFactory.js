const { addHours } = require('date-fns');
const faker = require('faker');

function createEventFactory() {
  const sports = ['soccer', 'tennis'];
  const sport = faker.random.arrayElement(sports);

  const date = new Date();

  const event = {
    sport,
    local: 'Clube',
    state_id: 26,
    city_id: 8811,
    date,
    start_time: addHours(date, 1),
    end_time: addHours(date, 2),
    players_quantity: faker.datatype.number(20),
  };

  return event;
}

module.exports = createEventFactory;
