const { City } = require('../models');

class CityController {
  async findById(request, response) {
    try {
      const { id } = request.params;

      const city = await City.query().findById(id);

      if (!city) {
        return response.status(404).send({ message: 'City not found' });
      }

      return response.status(200).send(city);
    } catch (error) {
      console.log(error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async findAll(request, response) {
    try {
      const { offset, limit, stateId, name } = request.query;

      const query = City.query();

      if (stateId) {
        query.where('state_id', '=', stateId);
      }

      if (name) {
        query.where('name', 'like', `%${name}%`);
      }

      if (offset && limit) {
        const cities = await query.page(
          parseInt(offset, 10),
          parseInt(limit, 10)
        );

        return response.status(200).send(cities);
      }

      const cities = await query;

      return response.status(200).send(cities);
    } catch (error) {
      console.log(error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }
}

module.exports = new CityController();
