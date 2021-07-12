const yup = require('yup');

const schema = yup.object({
  friend_request_id: yup.number().required(),
});

module.exports = schema;
