const express = require('express')
const MongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID

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

app.get('/api/items/:category_id?', (req, res) => {
    var query = { }
    if (req.params.category_id) {
        query['category_id'] = new ObjectID(req.params.category_id)
    }

    db.collection('items').find(query).toArray((err, data) => {
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