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
      const { offset, limit } = request.params;

      const query = connection('events');

      if (offset && limit) {
        const events = await query.limit(limit).offset(offset);

        return response.status(200).send(events);
      }

      const events = await query.fetch();

      return response.status(201).send(events);
    } catch (error) {
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async create(request, response) {
    try {
      const {
        sport,
        local,
        state,
        city,
        date,
        start_time,
        end_time,
        players_quantity,
      } = request.body;
      const { userId } = request;

      // TODO: START_TIME < END_TIME
      // TODO: VALID DATE + TIME

      const event = await connection('events')
        .insert({
          sport,
          local,
          state,
          city,
          date,
          start_time,
          end_time,
          players_quantity,
          user_id: userId,
        })
        .returning('*');

      return response.status(201).send(event[0]);
    } catch (error) {
      return response.status(500).send({ message: 'Internal server error' });
    }
  }
}

module.exports = new EventController();
