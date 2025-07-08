const express = require("express");
const admin = require("firebase-admin");
const { nanoid } = require("nanoid");
const cors = require("cors");

const app = express();

// Enable CORS for all routes to allow frontend to communicate with backend
app.use(cors());
// Enable JSON body parsing for incoming requests
app.use(express.json());

// Initialize Firebase Admin SDK with service account credentials
// The serviceAccountKey.json file contains your Firebase project's credentials
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Replace with your actual Firebase database URL
  databaseURL: "https://url-shortner-60b69.firebaseio.com"
});

// Get a reference to the Firestore database
const db = admin.firestore();

// API endpoint for shortening URLs
app.post("/api/shorten", async (req, res) => {
  const { longUrl } = req.body;
  // Generate a short ID for the URL
  const shortId = nanoid(7);

  try {
    // Store the long URL and short ID in Firestore
    await db.collection("urls").doc(shortId).set({
      longUrl,
      shortId,
    });
    // Respond with the shortened URL
    res.json({ shortUrl: `${req.protocol}://${req.get("host")}/${shortId}` });
  } catch (error) {
    console.error("Error shortening URL:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// API endpoint for redirecting short URLs to long URLs
app.get("/:shortId", async (req, res) => {
  const { shortId } = req.params;

  try {
    // Retrieve the long URL from Firestore using the short ID
    const doc = await db.collection("urls").doc(shortId).get();
    if (doc.exists) {
      // If found, redirect to the original long URL
      res.redirect(doc.data().longUrl);
    } else {
      // If not found, send a 404 response
      res.status(404).send("URL not found");
    }
  } catch (error) {
    console.error("Error retrieving URL:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Define the port for the server to listen on
const PORT = process.env.PORT || 5000;
// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));