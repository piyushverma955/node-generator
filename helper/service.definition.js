var model = {
    _id: { type: String},
    name: { type: String, unique: true},
    definition: String,
    port: Number
};

module.exports = model;