const express = require('express')
const MongoClient = require('mongodb').MongoClient

const app = express()

app.use(express.static('public'))

var db
MongoClient.connect('mongodb://localhost:27017', (err, dbConnection) => {
    if (err) {
        console.log('Error connecting to database')
    } else {
        console.log('Connected to MongoDB')
        db = dbConnection.db('webshop')
    }
})

app.get('/api/categories', (req, res) => {
    db.collection('categories').find().toArray((err, data) => {
        if (err) {
            res.sendStatus(500)
        } else {
            res.json(data)
        }
    })
})

app.listen(3000, () => {
    console.log('Example app listening on port 3000!')
})