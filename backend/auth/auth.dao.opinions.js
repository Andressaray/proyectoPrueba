const mongoose      = require('mongoose');
const opinionSchema = require('./auth.model.opinions');

opinionSchema.statics = {
  createOpinion: function (data, cb) {
    const opinion = new this(data);
    opinion.save(cb);
  }
};

const opinionModel = mongoose.model('opinion', opinionSchema);
module.exports  = opinionModel;