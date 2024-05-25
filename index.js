const express = require("express");
const cors = require("cors");
const mongodb = require("mongodb");
require("dotenv").config();

const app = express();
const port = 5000;

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ydmxw3q.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Main function to run the server and connect to MongoDB
async function run() {
  try {
    const receipeCollection = client
      .db("recipeSharingSystem")
      .collection("allRecipe");
    const userCollection = client
      .db("recipeSharingSystem")
      .collection("allUser");

    app.get("/api/allRecipe", async (req, res) => {
      const result = await receipeCollection.find().toArray();
      res.send(result);
    });

    app.post("/api/AddRecipes", async (req, res) => {
      const {
        recipe_name,
        image,
        details,
        video_code,
        country,
        category,
        creatorEmail,
      } = req.body;

      // Construct the new recipe document
      const newRecipe = {
        recipe_name,
        image,
        details,
        video_code,
        country,
        category,
        creatorEmail,
        watchCount: 0,
        purchased_by: [],
      };

      try {
        const result = await receipeCollection.insertOne(newRecipe);
        res.status(201).json(result);
      } catch (error) {
        res.status(400).json({ message: "Error saving recipe", error });
      }
    });

    app.post("/userData", async (req, res) => {
      const { name, email, photoURL, coin } = req.body;

      // Check if user already exists in the database
      const existingUser = await userCollection.findOne({ email });

      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // If user doesn't exist, insert the data into the database
      try {
        await userCollection.insertOne({
          name,
          email,
          photoURL, // Add photoURL field
          coin: coin || 50,
        });
        res.status(201).json({ message: "User data inserted successfully" });
      } catch (error) {
        res.status(500).json({ message: "Error inserting user data", error });
      }
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
  console.log(`Server is running on port: ${port}`);
});
