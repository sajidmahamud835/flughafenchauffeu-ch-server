const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId
require('dotenv').config();
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fphq6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
  try {
    await client.connect(`${process.env.DB_USER}`);
    const database = client.db();
    const servicesCollection = database.collection('services');
    const ordersCollection = database.collection('orders');

    // // Post api
    app.post('/services', async (req, res) => {
      const service = req.body;
      console.log('hitted!', service);

      const result = await servicesCollection.insertOne(service);
      console.log(result);
      res.json(result);
    });

    app.post('/orders', async (req, res) => {
      const order = req.body;
      console.log('hitted!', order);

      const result = await ordersCollection.insertOne(order);
      console.log(result);
      res.json(result);
    });

    // Get products api
    app.get('/services', async (req, res) => {
      const cursor = servicesCollection.find({});
      const services = await cursor.toArray();
      const count = await cursor.count();
      res.send({
        count,
        services
      });
    })

    app.get('/orders', async (req, res) => {
      const cursor = ordersCollection.find({});
      const orders = await cursor.toArray();
      const count = await cursor.count();
      res.send({
        count,
        orders
      });
    })

    //UPDATE API
    app.put('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: updatedData.status
        },
      };
      const result = await ordersCollection.updateOne(filter, updateDoc, options)
      console.log('updating user', id)
      res.json(result);
    })

    // Delete api
    app.delete('/services/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await servicesCollection.deleteOne(query);
      res.json(result);
    })

    app.delete('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.json(result);
    })
  }
  finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!');
})

app.listen(port, () => {
  console.log('server is running at port', port);
})