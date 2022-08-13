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
    // add banner
    app.post("/addBanner", async (req, res) => {
      const body = req.body;
      const result = await bannerCollection.insertOne(body);
      res.send(result);
    });
    // clint side get banner
    app.get("/banner", async (req, res) => {
      const query = { hide: false };
      const result = await bannerCollection.find(query).toArray();
      const sorting = result.sort((x, y) => {
        return x.orders - y.orders;
      });
      res.send(sorting);
    });

    // all banner for dashboard
    app.get("/allBanner/:variation", async (req, res) => {
      const variation = req.params.variation;
      let query = {};
      if (variation == "Unhide") {
        query = { hide: true };
      } else if (variation == "Hide") {
        query = { hide: false };
      }

      const result = await bannerCollection.find(query).toArray();
      res.send(result);
    });
    // update from dashboar for update hide and unhide banner
    app.put("/updatebanner/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      if (!id) {
        return;
      }
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };

      const updateDoc = {
        $set: body,
      };
      const result = await bannerCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });
    // delte banner fromm dashbaoard
    app.delete("/deleteBanner/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await bannerCollection.deleteOne(filter);
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
