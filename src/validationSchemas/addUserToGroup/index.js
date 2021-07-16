const yup = require('yup');

const schema = yup.object({
  group_id: yup.number().required(),
  user_id: yup.number().required(),
});

module.exports = schema;
