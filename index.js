require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

const cors = require("cors");

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.raiw9.mongodb.net/?retryWrites=true&w=majority`;
// const uri = `mongodb://localhost:27017`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    const db = client.db("rental-housing");
    const itemsCollection = db.collection("items");
    const userCollection = db.collection("users");
  } finally {
  }
};

run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Welcome to Cloud Shopping Server!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
