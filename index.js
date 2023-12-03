require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

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
    const db = client.db("cloud-shopping");
    const itemCollection = db.collection("items");
    const userCollection = db.collection("users");

    // Sign up route
    app.post("/api/sign-up", async (req, res) => {
      try {
        const { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10); // Hashing password
        const userId = uuidv4();

        // Save user to the database
        const newUser = await userCollection.insertOne({
          id: userId,
          name,
          email,
          password: hashedPassword,
          created_at: new Date(),
          created_by: "System",
        });

        const createdUser = {
          _id: newUser.insertedId,
          id: userId,
          name,
          email,
          created_at: new Date(),
          created_by: "System",
        };

        res.status(201).json({
          message: "Account created successfully",
          user: createdUser,
          status: 200,
        });
      } catch (error) {
        res
          .status(500)
          .json({ message: "Error creating user", error: error.message });
      }
    });

    // Sign in route
    app.post("/api/sign-in", async (req, res) => {
      try {
        const { email, password } = req.body;

        // Find user by email in the database
        const user = await userCollection.findOne({ email });

        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        // Compare entered password with hashed password in the database
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
          return res.status(401).json({ message: "Invalid password" });
        }

        // Remove password from the user object before sending the response
        const { password: userPassword, ...userWithoutPassword } = user;

        res.status(200).json({
          message: "Logged in successfully",
          user: userWithoutPassword,
          status: 200,
        });
      } catch (error) {
        res
          .status(500)
          .json({ message: "Error signing in", error: error.message });
      }
    });
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
