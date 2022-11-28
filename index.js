const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 5000;

//middleware
app.use(express.json());
app.use(cors());

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);


const uri = `mongodb+srv://${process.env.NAME_DB}:${process.env.PASSWORD_DB}@cluster0.gweohfd.mongodb.net/?retryWrites=true&w=majority`;

const run = async () => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

    try {
        const categoriesCollection = client.db("quickSellDb").collection("bikeCategories");
        const categoryCollection = client.db("quickSellDb").collection("category");
        const bookingCollection = client.db("quickSellDb").collection("booking");
        const paymentCollection = client.db("quickSellDb").collection("payment");
        const usersCollection = client.db("quickSellDb").collection("users");
        const myProductCollection = client.db("quickSellDb").collection("myProduct");

        //delete my product
        app.delete('/myProduct/:id', async (req, res)=>{
            const id=req.params.id;
            const filter= {_id: ObjectId(id)}
            const result = await myProductCollection.deleteOne(filter);
            res.send(result)

        })
        

        //get my product
        app.get('/myProduct', async (req, res) => {
            const email = req.query.email;
            const filter = { email: email };
            const product = await myProductCollection.find(filter).toArray();
            res.send(product);
        })


        //my product insert database
        app.post('/myProduct', async (req, res) => {
            const product = req.body;
            const result = await myProductCollection.insertOne(product)
            res.send(result);
        })


        //check is a admin?
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email };
            const user = await usersCollection.findOne(filter)
            res.send({ isAdmin: user?.role === 'admin' })
        })


        //check  sellers 
        app.get('/users/sellers/:email', async(req,res) =>{
            const email =req.params.email;
            const filter ={email};
            const user = await usersCollection.findOne(filter)
            res.send({isSellers: user?.role === 'sellers' })
        })

        app.get('/users/buyers/:email', async(req,res) =>{
            const email =req.params.email;
            const filter ={email};
            const user = await usersCollection.findOne(filter)
            res.send({isBuyers: user?.role === 'buyers' })
        })

        //delete Sellers
        app.delete('/usersRole/sellers/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const result = await usersCollection.deleteOne(filter);
            res.send(result);
        })


        //Delete Buyer
        app.delete('/usersRole/buyers/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const result = await usersCollection.deleteOne(filter);
            res.send(result);
        })


        //get all sellers
        app.get('/usersRole/sellers', async (req, res) => {
            const query = { role: 'sellers' };
            const user = await usersCollection.find(query).toArray();
            res.send(user);
        })


        //get buyers
        app.get('/usersRole/buyers', async (req, res) => {
            const query = { role: 'buyers' };
            const user = await usersCollection.find(query).toArray();
            res.send(user)
        })

        app.post('/users', async (req, res) => {
            const users = req.body;
            const result = await usersCollection.insertOne(users);
            res.send(result);
        })


        app.post('/payment-intent', async (req, res) => {
            const booking = req.body;
            const resalePrice = booking.resalePrice;
            const amount = resalePrice * 100;

            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'usd',
                "payment_method_types": [
                    "card"
                ]

            })
            res.send({
                clientSecret: paymentIntent.client_secret,
            })
        })


        app.post('/payment', async (req, res) => {
            const payment = req.body;
            const result = await paymentCollection.insertOne(payment)

            const id = payment.paymentId;
            const filter = { _id: ObjectId(id) }
            const updateDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId
                }
            }
            const updateResult = await bookingCollection.updateOne(filter, updateDoc)
            res.send(result);
        })


        app.get('/booking/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const booked = await bookingCollection.findOne(query);
            res.send(booked);
        })

        //get my orders
        app.get('/booking', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const booked = await bookingCollection.find(query).toArray();
            res.send(booked)
        })

        // bike booked
        app.post('/booking', async (req, res) => {
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking)
            res.send(result);
        })


        app.get('/category/:id', async (req, res) => {
            const id = req.params.id;
            const query = { category_id: id }
            const result = await categoryCollection.find(query).toArray();
            res.send(result)
        })

        app.get('/categories', async (req, res) => {
            const query = {}
            const result = await categoriesCollection.find(query).toArray();
            res.send(result)
        })



    }
    finally {

    }

}
run().catch(console.dir)




app.get('/', async (req, res) => {
    res.send('quick sell server running now...')
})

app.listen(port, () => {
    console.log(`server listening on port ${port}`)
})
