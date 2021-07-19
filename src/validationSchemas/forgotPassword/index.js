const yup = require('yup');

const schema = yup.object({
  email: yup.string().email().required(),
});

module.exports = schema;
