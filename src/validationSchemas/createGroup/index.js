const yup = require('yup');

const createGroupSchema = yup.object({
  name: yup.string().required(),
});

module.exports = createGroupSchema;
