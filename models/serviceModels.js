const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    service_desc: {
        type: String,
        required: true
    },
    req_skills:[{
        type: String,
        required: true
    }],
    proficiency: {
        type: String,
        required: true
    },
    images: [{
        type: String,
        required: false
    }]
}, {
    timestamps: true
});

ServiceSchema.path('images').validate(images => {
    return images && images.length > 0;
}, "At least one image is required.")

const Service = mongoose.model('Service', ServiceSchema);
module.exports = Service;