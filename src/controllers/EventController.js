const { Event } = require('../models');

class EventController {
  async findById(request, response) {
    try {
      const { id } = request.params;

      const event = await Event.query().findById(id);

      return response.status(200).send(event);
    } catch (error) {
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async findAll(request, response) {
    try {
      const { offset, limit } = request.params;

      const query = Event.query();

      if (offset && limit) {
        const events = await query.page(offset, limit);

        return response.status(200).send(events);
      }

      const events = await query;

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

      const eventCreated = await Event.query().insertAndFetch({
        sport,
        local,
        state,
        city,
        date,
        start_time,
        end_time,
        players_quantity,
        user_id: userId,
      });

      return response.status(201).send(eventCreated);
    } catch (error) {
      return response.status(500).send({ message: 'Internal server error' });
    }
  }
}

module.exports = new EventController();
