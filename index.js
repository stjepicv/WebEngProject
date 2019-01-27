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

const checkJwt = (req, res, next) => {
    var token = req.headers['authorization']
    if (!token) {
        res.sendStatus(401)
    } else {
        const regex = /(?:Bearer )?(.+)/
        token = regex.exec(token)[1]

        jwt.verify(token, jwt_secret, (err, payload) => {
            if (err) {
                res.sendStatus(401)
            } else {
                req.jwt_payload = payload
                next()
            }
        })
    }
}

app.post('/api/user/login', (req, res) => {
    db.collection('users').findOne({ email: req.body.email }, (err, result) => {
        if (err) {
            res.sendStatus(500)
        } else if (bcrypt.compareSync(req.body.password, result.password)) {
            delete result.password
            const token = jwt.sign(result, jwt_secret, { expiresIn: 86400 })
            res.json({ token: token })
        } else {
            res.sendStatus(400)
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


app.post('/api/order', checkJwt, (req, res) => {
    if (!req.body.items || req.body.items.length == 0) {
        res.sendStatus(400)
    } else {
        const itemIds = req.body.items.map(id => new ObjectID(id))
        db.collection('items').find({ _id: { $in: itemIds }}).toArray()
            .then((items) => {
                var total = 0
                for (i in items) {
                    total += items[i].price
                }

                const order = {
                    user_id: new ObjectID(req.jwt_payload._id),
                    datetime: new Date(),
                    items: items,
                    total: total
                }

                return db.collection('orders').insertOne(order)
            })
            .then((data) => res.send())
            .catch((error) => res.sendStatus(500))
    }
})

app.get('/api/order', checkJwt, (req, res) => {
    const userId = req.jwt_payload._id
    db.collection('orders').find({ user_id: new ObjectID(userId) }).toArray()
        .then((orders) => res.json(orders))
        .catch((error) => res.sendStatus(500))
})


app.listen(3000, () => {
    console.log('Example app listening on port 3000!')
})