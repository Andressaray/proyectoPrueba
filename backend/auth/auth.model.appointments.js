const mongoose = require('mongoose');
const Schema   = mongoose.Schema;
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

const appointmentsSchema = new Schema ({

    id: {
        type:       Number,
        required:   true
    },
    name: {
        type:       String,
        required:   true,
        uppercase:  true
    },
    date: {
        type:       Date,
        required:   true,
        unique:     true
    },
    dateA: {
        type:       Date,
        required:   true,
        unique:     true
    },
    typeAppointment: {
        type:       String,
        required:   true,
        uppercase:  true
    },
    attended: {
        type:       String,
        uppercase:  true
    },
    result: {
        type:       String
    },
    medicated: {
        type:       String
    },
    descriptionM: {
        type:       String
    },
    treatment: {
        type:       String
    },
    descriptionTreatment: {
        type:       String
    },
    surgery : {
        type:       String
    },
    typeSurgery: {
        type:       String
    },
    descriptionS: {
        type:       String
    }           
}, {
    timestamps: true
});

module.exports = appointmentsSchema;