const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');


const port = process.env.PORT || 5000;




//middleware
app.use(express.json());
app.use(cors());



const uri = `mongodb+srv://${process.env.NAME_DB}:${process.env.PASSWORD_DB}@cluster0.gweohfd.mongodb.net/?retryWrites=true&w=majority`;

const run = async () => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

    try {
            const categoriesCollection = client.db("quickSellDb").collection("bikeCategories");



             app.get('/categories', async(req,res) => {
                const query ={}
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
