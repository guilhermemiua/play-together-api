const validator = (schema) => async (req, res, next) => {
  const { body } = req;
  try {
    // throws an error if not valid
    await schema.validate(body);

    next();
  } catch (error) {
    return res.status(400).json({ message: error.errors.join(', ') });
  }
};

module.exports = validator;
