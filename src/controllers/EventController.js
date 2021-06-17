const connection = require('../database/connection');

class EventController {
  async findById(request, response) {
    try {
      const { id } = request.params;

      const event = await connection('events').where('id', id).first();

      return response.status(200).send(event);
    } catch (error) {
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async findAll(request, response) {
    try {
      const { sport } = request.query;

      const query = connection;

      if (sport) {
        query.whereRaw("LOWER(name) LIKE '%' || LOWER(?) || '%' ", sport);
      }

      const events = await query.from('events');

      return response.status(200).send(events);
    } catch (error) {
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async create(request, response) {
    try {
      const {
        sport,
        local,
        date,
        start_time,
        end_time,
        players_quantity,
        user_id,
      } = request.body;

      const event = await connection('events')
        .insert({
          sport,
          local,
          date,
          start_time,
          end_time,
          players_quantity,
          user_id,
        })
        .returning('*');

      return response.status(201).send(event[0]);
    } catch (error) {
      return response.status(500).send({ message: 'Internal server error' });
    }
  }
}

module.exports = new EventController();
