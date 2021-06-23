const { State } = require('../models');

class StateController {
  async findAll(request, response) {
    try {
      const { offset, limit, name } = request.query;

      const query = State.query();
      if (name) {
        query.where('name', 'like', `%${name}%`);
      }

      if (offset && limit) {
        const states = await query.page(offset, limit);

        return response.status(200).send(states);
      }

      const states = await query;

      return response.status(200).send(states);
    } catch (error) {
      console.log(error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }
}

module.exports = new StateController();
