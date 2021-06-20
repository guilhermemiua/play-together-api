const connection = require('../database/connection');

class StateController {
  async findAll(request, response) {
    try {
      const { offset, limit } = request.query;

      const query = connection('states');

      if (offset && limit) {
        const states = await query.limit(limit).offset(offset);

        return response.status(200).send(states);
      }

      const states = await query;

      return response.status(201).send(states);
    } catch (error) {
      console.log(error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }
}

module.exports = new StateController();
