const express = require('express')
const MongoClient = require('mongodb').MongoClient

const app = express()

app.use(express.static('public'))

var db
MongoClient.connect('mongodb://localhost:27017/webshop', (err, database) => {
    if (err) {
        console.log('Error connecting to database')
    } else {
        console.log('Connected to MongoDB')
        db = database
    }
})



app.listen(3000, () => {
    console.log('Example app listening on port 3000!')
})