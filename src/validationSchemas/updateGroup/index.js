const yup = require('yup');

const updateGroupSchema = yup.object({
  name: yup.string().required(),
});

module.exports = updateGroupSchema;
