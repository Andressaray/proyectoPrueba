const mongoose = require('mongoose');
const Schema   = mongoose.Schema;
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

const opinionSchema = new Schema ({
    id: {
        type:       Number,
        required:   true,
        unique:     true
    },
    name: {
        type:       String,
        required:   true,
        uppercase:  true
    },
    calification: {
        type:      Number,
        required:  true,
        maxlength: 5
    },
    description: {
        type:      String,
        required:  true,
        maxlength: 400,
    },
    time: {
        type:      Date,
        required:  true
    }
}, {
    timestamps: true
});

module.exports = opinionSchema;