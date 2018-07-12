const mongoose = require('mongoose')
const Schema = mongoose.Schema

const RecordSchema = new Schema({
  holdCount: Number,
  addressCount: Number,
  date: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Record', RecordSchema)