const yup = require('yup');

const schema = yup.object({
  receiver_id: yup.number().required(),
});

module.exports = schema;
