const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
require("dotenv").config();
app.use(cors());
app.use(express.json());
const jwt = require("jsonwebtoken");
const { format } = require("date-fns");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oygzwnc.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    client.connect();
    // --------------------all collection----------------

    const sellCollection = client.db("ticket").collection("sell");
    const currentBalanceCollection = client
      .db("ticket")
      .collection("currentBalance");

    // --------------------add sell---------------------------------------
    app.post("/add-sell", async (req, res) => {
      const body = req.body;
      const result = await sellCollection.insertOne(body);
      res.send(result);
    });

    // ----------------------------------------------------------------- update current balnce
    app.put("/add-current-balance/:email", async (req, res) => {
      const email = req.params.email;
      console.log("cur", email);
      const body = req.body;
      if (!email) {
        return;
      }
      const filter = { email };
      const options = { upsert: true };
      const updateDoc = {
        $set: body,
      };
      const result = await currentBalanceCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });
    // -----------------------------------------------------------------all sell get -------------------
    app.get("/all-sell", async (req, res) => {
      const query = {};
      const result = await sellCollection.find(query).toArray();
      res.send(result);
    });
    // -----------------------------------------------------------------get data current balcne---------------------------------------------------
    app.get("/current-balance", async (req, res) => {
      const email = "akash@gmail.com";
      const query = { email };
      const result = await currentBalanceCollection.findOne(query);
      res.send(result);
    });

    app.delete("/delete-sell/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await sellCollection.deleteOne(filter);
      res.send(result);
    });
  } finally {
  }
}

app.get("/", (req, res) => {
  res.send("rokto bondon server is running");
});

app.listen(port, () => {
  console.log("successfully run rokto bondon", port);
});

run().catch(console.dir);
