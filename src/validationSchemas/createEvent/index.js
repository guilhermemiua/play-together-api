const yup = require('yup');

const createEventSchema = yup.object({
  local: yup.string().required(),
  date: yup.string().required(),
  start_time: yup.string().required(),
  end_time: yup.string().required(),
  players_quantity: yup.number().positive().required(),
});

module.exports = createEventSchema;
