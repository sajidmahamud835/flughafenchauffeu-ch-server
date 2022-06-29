const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const cors = require('cors');
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const nodemailer = require("nodemailer");
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

console.log("User Name:", dbUser, "& Database Server URL:", dbServer);

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
    });

    // Post api
    app.post('/bookings', async (req, res) => {
      const booking = req.body;
      console.log('Recived booking data form forntend', booking);

      const result = await bookingsCollection.insertOne(booking);
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
      const result = await bookingsCollection.updateOne(filter, updateDoc, options);
      console.log('updating entry', id);
      res.json(result);
    });

    // Delete api
    app.delete('/bookings/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bookingsCollection.deleteOne(query);
      res.json(result);
    });

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
    });

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
    });

    // Post api
    app.post('/users', async (req, res) => {
      const users = req.body;
      console.log('Recived user data form forntend', users);

      const result = await usersCollection.insertOne(users);
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
    });


    // Post api
    app.post('/general-settings', async (req, res) => {
      const settings = req.body;
      console.log('Recived settings data form forntend', settings);

      const result = await settingsCollection.insertOne(settings);
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
      const result = await settingsCollection.updateOne(filter, updateDoc, options);
      console.log('updating settings', id);
      res.json(result);
    });

    app.get('/form/tripInfo', async (req, res) => {
      const cursor = database.collection('tripInfo').find({});
      const inputs = await cursor.toArray();
      const count = await cursor.count();
      res.send({
        count,
        id: 2,
        title: "Reiseinformationen",
        collectionName: "tripInfo",
        description: "Please select whare do you want to get picked up from.",
        inputs
      });
    });

    //updating tripInfo
    app.put('/form/tripInfo/:id', async (req, res) => {
      const id = req.params.id;
      const inputs = req.body;
      delete inputs['_id']
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          ...inputs
        },
      };
      const result = await database.collection('tripInfo').updateOne(filter, updateDoc, options);
      console.log('updating entry', id);
      res.json(result);
    });


    app.get('/form/guestInfo', async (req, res) => {
      const cursor = database.collection('guestInfo').find({});
      const inputs = await cursor.toArray();
      const count = await cursor.count();
      res.send({
        count,
        id: 3,
        title: "persönliche Informationen",
        collectionName: "guestInfo",
        description: "Please select whare do you want to get picked up from.",
        inputs
      });
    });

    //updating guestInfo
    app.put('/form/guestInfo/:id', async (req, res) => {
      const id = req.params.id;
      const inputs = req.body;
      delete inputs['_id']
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          ...inputs
        },
      };
      const result = await database.collection('guestInfo').updateOne(filter, updateDoc, options);
      console.log('updating entry', id);
      res.json(result);
    });



    // Get default-values
    app.get('/default-values', async (req, res) => {
      const cursor = database.collection('default_values').find({});
      const bookings = await cursor.toArray();
      let values = bookings[0];
      delete values['_id'];
      res.send(values);
    });

    app.get('/email', async (req, res) => {
      // create reusable transporter object using the default SMTP transport
      let transporter = nodemailer.createTransport({
        host: "130.hosttech.eu",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: "web185p3", // user
          pass: "BigB0ss135@#", //  password
        },
      });

      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: '"FlughafenChauffeur" <no-reply@flughafenchauffeur.ch>', // sender address
        to: ["sajidmahamud835@gmail.com", "sajid.mahamud.835@gmail.com"], // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Hello world? html", // plain text body
        html: "<b>Hello world? test</b>", // html body
      });

      console.log("Message sent: %s", info.messageId);
      res.send(info);
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    });

    //email sender
    app.post('/send-mail', async (req, res) => {
      const email = req.body;
      console.log('Recived email data form forntend', email);
      if (false) {
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
      } else {
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
          host: "130.hosttech.eu",
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: "web185p3", // user
            pass: "BigB0ss135@#", //  password
          },
        });

        // send mail with defined transport object
        let info = await transporter.sendMail({
          from: email.from, // sender address
          to: email.to, // list of receivers
          subject: email.subject, // Subject line
          text: email.text, // plain text body
          // html: "<b>Hello world? test</b>", // html body
        });

        console.log("Message sent: %s", info.messageId);
        res.send(info);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
      }
    });


  }
  finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('The server for flughafenchauffeur.ch is running.');
});

app.listen(port, () => {
  console.log('server is running at port', port);
});