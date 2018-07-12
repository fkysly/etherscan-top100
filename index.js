const mongoose = require('mongoose')
const express = require('express')
const Record = require('./record')
const request = require('request')
const schedule = require("node-schedule")

const url = 'https://etherscan.io/token/tokenholderchart/0x744d70fdbe2ba4cf95131626614a1763df805b9e'
const holdReg = /A Total (.+) Tokens Held by the Top 100 accounts from the Total Supply Of/g
const addressReg = /Total Token Holders: ([0-9]+)/g
const app = express()
const mongodbURL = "mongodb://localhost:27017/etherscan"
const port = process.env.PORT || 8080
const router = express.Router()

mongoose.connect(mongodbURL, {useNewUrlParser: true})

var rule = new schedule.RecurrenceRule()
rule.minute = 8
var j = schedule.scheduleJob(rule, fetchTop100)

router.get('/records', function(req, res) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "X-Requested-With")
  Record.find(function(err, records) {
    if (err) res.send(err)
    res.json(records)
  })
})

app.use('/api', router)
app.listen(port)
console.log('listening on port ' + port)

function fetchTop100() {
  request(url, (err, res, body) => {
    if (err) throw err
    var regArray = holdReg.exec(body)
    let holdCount = parseInt(regArray[1].split(',').join(''))
    regArray = addressReg.exec(body)
    let addressCount = parseInt(regArray[1])
    console.log(holdCount, addressCount)

    let record = new Record({holdCount: holdCount, addressCount: addressCount})
    record.save(function (err, records) {
      if (err) throw err
      console.log("insert success")
    })
  })
}
