const yup = require('yup');

const schema = yup.object({
  event_id: yup.string().required(),
});

module.exports = schema;
