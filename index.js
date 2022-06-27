const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const app = express()
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config()
app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9wiav.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        client.connect()
        const soinikCollection = client.db("rokto-bondon").collection("rokto-soinik");
        app.post('/soinik',async(req,res)=>{
            const body=req.body;
            const result=await soinikCollection.insertOne(body);
            res.send(result)
        })
    }
    finally{

    }
}





app.get('/', (req, res) => {
    res.send('rokto bondon server is running');
})

app.listen(port, () => {
    console.log('successfully run rokto bondon', port)
})


run().catch(console.dir);