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

    app.post("/api/userData", async (req, res) => {
      const { name, photo, email, coin } = req.body;
      const userExists = await userCollection.findOne({ email });

      if (userExists) {
        return res.status(400).json({ message: "User already exists" });
      }

      const newUser = { name, photo, email, coin };
      const result = await userCollection.insertOne(newUser);

      if (result.insertedId) {
        res.status(201).json({ message: "User data added successfully" });
      } else {
        res.status(500).json({ message: "Failed to add user data" });
      }
    });

    app.get("/userCoin/:email", async (req, res) => {
      const { email } = req.params; // Use req.params to get email parameter
      const user = await userCollection.findOne({ email });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ coin: user.coin });
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
