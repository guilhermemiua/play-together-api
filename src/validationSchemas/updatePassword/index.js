const yup = require('yup');

const updatePasswordSchema = yup.object().shape({
  password: yup.string().required(),
  confirm_password: yup
    .string()
    .required()
    .oneOf([yup.ref('password'), null], 'Passwords must be equal'),
});

module.exports = updatePasswordSchema;
