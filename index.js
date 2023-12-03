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
    const productCollection = db.collection("items");
    const userCollection = db.collection("users");

    // ! auth api

    // Sign up route
    app.post("/api/sign-up", async (req, res) => {
      try {
        const { name, email, password } = req.body;

        // Check if the email already exists in the database
        const existingUser = await userCollection.findOne({ email });
        if (existingUser) {
          return res
            .status(409)
            .json({ message: "Email already exists", status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10); // Hashing password
        const userId = uuidv4();

        // Save user to the database
        const newUser = await userCollection.insertOne({
          id: userId,
          name,
          email,
          password: hashedPassword,
          created_at: new Date(),
          created_by: "System", // You can modify this as needed
        });

        const createdUser = {
          _id: newUser.insertedId, // Assuming MongoDB returns the insertedId
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

    // ! product api (CRUD)

    // Create a product
    app.post("/api/add-product", async (req, res) => {
      try {
        const { name, price, category, created_by } = req.body;

        const newProduct = {
          id: uuidv4(),
          name,
          price,
          category,
          created_at: new Date(),
          created_by,
        };

        const insertedProduct = await productCollection.insertOne(newProduct);

        res.status(201).json({
          message: "Product created successfully",
          product: newProduct,
          status: 201,
        });
      } catch (error) {
        res
          .status(500)
          .json({ message: "Error creating product", error: error.message });
      }
    });

    // Get all products
    app.get("/api/products", async (req, res) => {
      try {
        const products = await productCollection.find({}).toArray();

        res.status(200).json({ products, status: 200 });
      } catch (error) {
        res
          .status(500)
          .json({ message: "Error fetching products", error: error.message });
      }
    });

    // Update a product by ID
    app.put("/api/product/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const { name } = req.body;

        const updatedProduct = await productCollection.findOneAndUpdate(
          { id },
          { $set: { name } },
          { returnOriginal: false }
        );

        res.status(200).json({
          message: "Product updated successfully",
          product: updatedProduct.value,
          status: 200,
        });
      } catch (error) {
        res
          .status(500)
          .json({ message: "Error updating product", error: error.message });
      }
    });

    // Delete a product by ID
    app.delete("/api/product/:id", async (req, res) => {
      try {
        const { id } = req.params;

        await productCollection.deleteOne({ id });

        res
          .status(200)
          .json({ message: "Product deleted successfully", status: 200 });
      } catch (error) {
        res
          .status(500)
          .json({ message: "Error deleting product", error: error.message });
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
