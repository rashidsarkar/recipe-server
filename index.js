const express = require("express");
const cors = require("cors");
const mongodb = require("mongodb");

const app = express();

const port = 5000;

// middleware
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// const uri = "mongodb://127.0.0.1:27017";
const uri = "mongodb://127.0.0.1:27017";
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ydmxw3q.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

//getman

async function run() {
  try {
    const featureCollection = client
      .db("educodaDB")
      .collection("featureSection");

    app.get("/api/features", async (req, res) => {
      const result = await featureCollection.find().toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Education is running");
});

app.listen(port, () => {
  console.log(`server is running on port: ${port}`);
});
