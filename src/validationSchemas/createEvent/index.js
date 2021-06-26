const { isSameDay, isAfter } = require('date-fns');
const yup = require('yup');

const createEventSchema = yup.object({
  state_id: yup.string().required(),
  city_id: yup.string().required(),
  local: yup.string().required(),
  date: yup.date().required().nullable(),
  start_time: yup
    .date()
    .required()
    .nullable()
    .test(
      'is-greater',
      'Start time should be greater than current time',
      (startTime, context) => {
        const { date } = context.parent;

        if (isSameDay(startTime, date)) {
          return isAfter(startTime, new Date());
        }

        return true;
      }
    ),
  end_time: yup.date().required().nullable(),
  players_quantity: yup.string().required(),
});

module.exports = createEventSchema;
