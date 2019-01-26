const express = require('express')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const MongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID

const jwt_secret = '12345678' // :)

const app = express()

app.use(bodyParser.json())
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

app.post('/api/user/login', (req, res) => {
    db.collection('users').findOne({ email: req.body.email }, (err, result) => {
        if (err) {
            res.sendStatus(500)
        } else if (bcrypt.compareSync(req.body.password, result.password)) {
            delete result.password
            const token = jwt.sign(result, jwt_secret, { expiresIn: 86400 })
            res.json({ token: token })
        } else {
            res.sendStatus(403)
        }
    })
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