const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
require("dotenv").config();
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eddx8.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    client.connect();
    const allDonnerCollection = client
      .db("rokto-bondon")
      .collection("all-donner");
    const bannerCollection = client.db("rokto-bondon").collection("banner");
    // add donner
    app.post("/addDonner", async (req, res) => {
      const body = req.body;
      const donner = { ...body, approved: true };
      const result = await allDonnerCollection.insertOne(donner);
      res.send(result);
    });
    // durdanto soinoi
    app.get("/durdantodonner", async (req, res) => {
      const result = await allDonnerCollection.find({}).toArray();
      res.send(result);
    });
    // donner profile
    app.get("/donnerProfile/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await allDonnerCollection.findOne(query);
      res.send(result);
    });
    app.get("/totalDonner", async (req, res) => {
      const result = await allDonnerCollection
        .find({})
        .estimatedDocumentCount();
      res.send(result);
    });
    app.post("/banner", async (req, res) => {
      const body = req.body;
      const result = await bannerCollection.insertOne(body);
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
