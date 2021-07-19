const yup = require('yup');

const schema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().required(),
});

module.exports = schema;
