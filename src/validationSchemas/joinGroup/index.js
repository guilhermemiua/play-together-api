const yup = require('yup');

const schema = yup.object({
  group_id: yup.string().required(),
});

module.exports = schema;
