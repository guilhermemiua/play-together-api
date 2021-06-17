const yup = require('yup');

const updateEmailSchema = yup.object({
  email: yup.string().email().required(),
});

module.exports = updateEmailSchema;
