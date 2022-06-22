const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId
require('dotenv').config();
const cors = require('cors');
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
const dbUser = `${process.env.DB_USER}`;
const dbPass = `${process.env.DB_PASS}`;
const dbServer = `${process.env.DB_SERVER}`;
const db = dbUser;
const url = `mongodb+srv://${dbUser}:${dbPass}@${dbServer}/${db}?retryWrites=true&w=majority`;
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

console.log("User Name:", dbUser, "& Server URL:", dbServer);

async function run() {
  try {
    await client.connect();
    const database = client.db();
    const bookingsCollection = database.collection('bookings');
    const settingsCollection = database.collection('settings');
    const usersCollection = database.collection('users');

    /* Bookings Api */

    // get bookings 
    app.get('/bookings', async (req, res) => {
      const cursor = bookingsCollection.find({});
      const bookings = await cursor.toArray();
      const count = await cursor.count();
      res.send({
        count,
        bookings
      });
    })

    // Post api
    app.post('/bookings', async (req, res) => {
      const booking = req.body;
      console.log('Recived booking data form forntend', booking);

      const result = await bookingsCollection.insertOne(booking);
      console.log(result);
      res.json(result);
    });

    //UPDATE API
    app.put('/bookings/:id', async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: updatedData.status.status
        },
      };
      console.log(updateDoc)
      const result = await bookingsCollection.updateOne(filter, updateDoc, options)
      console.log('updating entry', id)
      res.json(result);
    })

    // Delete api
    app.delete('/bookings/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bookingsCollection.deleteOne(query);
      res.json(result);
    })

    /* Users Data */

    // get users 
    app.get('/users', async (req, res) => {
      const cursor = usersCollection.find({});
      const users = await cursor.toArray();
      const count = await cursor.count();
      res.send({
        count,
        users
      });
    })

    // get single user 
    app.get('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const cursor = usersCollection.find(query);
      const users = await cursor.toArray();
      const count = await cursor.count();
      res.send({
        count,
        users
      });
    })

    // Post api
    app.post('/users', async (req, res) => {
      const users = req.body;
      console.log('Recived user data form forntend', users);

      const result = await usersCollection.insertOne(users);
      console.log(result);
      res.json(result);
    });

    /* Admin from settings api */
    //get general settings
    app.get('/general-settings', async (req, res) => {
      const cursor = settingsCollection.find({});
      const settings = await cursor.toArray();
      const count = await cursor.count();
      res.send({
        count,
        settings
      });
    })


    // Post api
    app.post('/general-settings', async (req, res) => {
      const settings = req.body;
      console.log('Recived settings data form forntend', settings);

      const result = await settingsCollection.insertOne(settings);
      console.log(result);
      res.json(result);
    });


    //UPDATE API
    app.put('/general-settings', async (req, res) => {
      const id = '629e4f7ffd58f1b52a3a074b';
      const settings = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          ...settings
        },
      };
      console.log(updateDoc)
      const result = await settingsCollection.updateOne(filter, updateDoc, options);
      console.log('updating settings', id);
      console.log(result);
      res.json(result);
    })

    //get trip info form
    app.get('/form/trip-information', async (req, res) => {
      const cursor = database.collection('trip_information').find({});
      const forms = await cursor.toArray();
      const count = await cursor.count();
      res.send({
        count,
        forms
      });
    })

    //get guest info form
    app.get('/form/guest-information', async (req, res) => {
      const cursor = database.collection('guest_information').find({});
      const forms = await cursor.toArray();
      const count = await cursor.count();
      res.send({
        count,
        forms
      });
    })



    // Get default-values
    app.get('/default-values', async (req, res) => {
      const cursor = database.collection('default_values').find({});
      const bookings = await cursor.toArray();
      let values = bookings[0]
      delete values['_id'];
      res.send(values);
    })

    //email sender
    app.post('/send-mail', async (req, res) => {
      const email = req.body;
      console.log('Recived email data form forntend', email);
      const mailgun = new Mailgun(formData);
      const mg = mailgun.client({
        username: 'api',
        key: '8d3e51bcbf55e2c44a8d1057aa653a00-50f43e91-a2a788fb',
      });
      mg.messages
        .create('sandbox7655551c2ecd4f4e9579f5ad6a7a936e.mailgun.org', {
          from: email.from,
          to: email.to,
          subject: email.subject,
          text: email.text,
        })
        .then(msg => console.log(msg) && res.json(msg)) // logs response data
        .catch(err => console.log(err)); // logs any error`;
    });


  }
  finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('The server for flughafenchauffeur.ch is running.');
})

app.listen(port, () => {
  console.log('server is running at port', port);
})