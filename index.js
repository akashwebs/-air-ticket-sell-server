const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const app = express();
const cors = require("cors");
const { JsonWebTokenError } = require("jsonwebtoken");
const port = process.env.PORT || 5000;
require("dotenv").config();
app.use(cors());
app.use(express.json());
const jwt = require("jsonwebtoken");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eddx8.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function verifyJwt(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unathuraization error" });
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRATE, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    client.connect();
    const allDonnerCollection = client
      .db("rokto-bondon")
      .collection("all-donner");
    const bannerCollection = client.db("rokto-bondon").collection("banner");

    // jwt user token send
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;

      if (!email) {
        return;
      }
      const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRATE, {
        expiresIn: "1h",
      });
      const filter = { email: email };
      const option = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, option);
      res.send({ result, token });
    });

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

    // all donner for dashboard
    app.get("/allDonner/:serachQuery", async (req, res) => {
      const serachQuery = req.params.serachQuery;
      const query = {};
      const allDonner = await allDonnerCollection.find(query).toArray();
      if (serachQuery === "all") {
        res.send(allDonner);
        return;
      }
      if (
        serachQuery === "a+" ||
        serachQuery === "a-" ||
        serachQuery === "b+" ||
        serachQuery === "b-" ||
        serachQuery === "ab+" ||
        serachQuery === "ab-" ||
        serachQuery === "o+" ||
        serachQuery === "o-"
      ) {
        const filterGroup = allDonner.filter(
          (data) => data.bloodGroup.toLowerCase() === serachQuery
        );
        res.send(filterGroup);
        return;
      }
      const filterData = allDonner.filter(
        (data) =>
          data.phone.toLowerCase().includes(serachQuery) ||
          data.fullName.includes(serachQuery)
      );

      res.send(filterData);
    });
    // get blood group
    app.get("/bloodgroup/:group", async (req, res) => {
      const group = req.params.group;
      console.log(group);
      const query = { bloodGroup: group, approved: true };
      const result = await allDonnerCollection.find(query).toArray();
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
    // update profile

    app.put("/updateProfile/:id", async (req, res) => {
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
      const result = await allDonnerCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // delete donner profile
    app.delete("/deleteDonnerProfile/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      if (!id) {
        return;
      }
      const filter = { _id: ObjectId(id) };
      const result = await allDonnerCollection.deleteOne(filter);
      res.send(result);
    });

    /* 
    group='all'
    distric='all'
    type= 'all'
    type='all'
    type='yes'
     */

    // search result
    app.get("/serachresult/:group", async (req, res) => {
      console.log(req.query);
      console.log(req.params.group);
      const queryData = req.query;

      const distric = queryData.distric;
      const group = req.params.group;
      const type = queryData.type;

      const allData = await allDonnerCollection
        .find({ approved: true })
        .toArray();
      // blood group only
      if (group !== "all" && distric === "all" && type === "all") {
        const bloodGroupData = allData.filter(
          (data) => data.bloodGroup === group
        );
        res.send(bloodGroupData);
        return;
      }
      // distri onley
      if (group === "all" && distric !== "all" && type === "all") {
        const districData = allData.filter((data) => data.distric === distric);
        res.send(districData);
        return;
      }
      // only elegiable
      if (group === "all" && distric === "all" && type === "yes") {
        const elegiable = allData.filter((data) => data.elegibale === "Yes");
        res.send(elegiable);
        return;
      }

      // blood group and distric
      if (group !== "all" && distric !== "all" && type === "all") {
        const groupAndDistric = allData.filter(
          (data) => data.bloodGroup === group && data.distric === distric
        );
        res.send(groupAndDistric);
        return;
      }

      //blood group and type
      if (group !== "all" && distric === "all" && type !== "all") {
        const groupAndType = allData.filter(
          (data) => data.bloodGroup === group && data.elegibale === "Yes"
        );
        res.send(groupAndType);
        return;
      }

      // distric and type
      if (group === "all" && distric !== "all" && type !== "all") {
        const groupAndType = allData.filter(
          (data) => data.distric === distric && data.elegibale === "Yes"
        );
        res.send(groupAndType);
        return;
      } else {
        res.send(allData);
      }
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
