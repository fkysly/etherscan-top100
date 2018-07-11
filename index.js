const request = require('request')
const schedule = require("node-schedule")
const MongoClient = require('mongodb').MongoClient
const mongodbURL = "mongodb://localhost:27017/etherscan"
const url = 'https://etherscan.io/token/tokenholderchart/0x744d70fdbe2ba4cf95131626614a1763df805b9e'
const holdReg = /A Total (.+) Tokens Held by the Top 100 accounts from the Total Supply Of/g
const addressReg = /Total Token Holders: ([0-9]+)/g

var rule = new schedule.RecurrenceRule()
rule.minute = 4
var j = schedule.scheduleJob(rule, fetchTop100)

function fetchTop100() {
  request(url, (err, res, body) => {
    if (err) throw err
    var regArray = holdReg.exec(body)
    let holdCount = parseInt(regArray[1].split(',').join(''))
    regArray = addressReg.exec(body)
    let addressCount = parseInt(regArray[1])
    console.log(holdCount, addressCount)
    MongoClient.connect(mongodbURL, {useNewUrlParser: true}, function(err, db) {
      if (err) throw err
      var dbo = db.db("etherscan-top100")
      var myobj = { holdCount: holdCount, addressCount: addressCount, date: new Date() }
      dbo.collection("etherscan").insertOne(myobj, function(err, res) {
        if (err) throw err
        console.log("insert success")
        db.close()
      })
    })
  })
}
