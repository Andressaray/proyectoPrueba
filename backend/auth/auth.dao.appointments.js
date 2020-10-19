const mongoose           = require('mongoose');
const appointmentsSchema = require('./auth.model.appointments');
appointmentsSchema.statics = {
    createAppintment: function (data, cb) {
      const appointment = new this(data);
      appointment.save(cb);
    }
  };
  const appointment = mongoose.model('appointments', appointmentsSchema);
  module.exports    = appointment;