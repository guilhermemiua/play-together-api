const connection = require('../database/connection');

class CityController {
  async findAll(request, response) {
    try {
      const { offset, limit, stateId } = request.query;

      const query = connection('cities');

      if (stateId) {
        query.where('state_id', '=', stateId);
      }

      if (offset && limit) {
        const cities = await query.limit(limit).offset(offset);

        return response.status(200).send(cities);
      }

      const cities = await query;

      return response.status(201).send(cities);
    } catch (error) {
      console.log(error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }
}

module.exports = new CityController();
