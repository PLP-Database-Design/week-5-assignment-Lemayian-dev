// Import necessary modules or frameworks or library
const express = require("express");
const mysql = require("mysql2");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

// MySQL database connection configuration
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Test the database connection
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err.stack);
    return;
  }
  console.log("Connected to the database as ID " + connection.threadId);
});

// Root route to display patients and providers
app.get("/", (req, res) => {
  const patientsQuery =
    "SELECT patient_id, first_name, last_name, date_of_birth FROM patients";
  const providersQuery =
    "SELECT first_name, last_name, provider_specialty FROM providers";

  // Execute both queries
  connection.query(patientsQuery, (err, patientsResults) => {
    if (err) {
      console.error("Error retrieving patients:", err);
      return res.status(500).send("Error retrieving patients");
    }

    connection.query(providersQuery, (err, providersResults) => {
      if (err) {
        console.error("Error retrieving providers:", err);
        return res.status(500).send("Error retrieving providers");
      }

      // Rendering the data on the browser
      res.send(`
        <h1>Welcome to the Hospital_db!</h1>
        <h2>Patients:</h2>
        <ul>
          ${patientsResults
            .map(
              (patient) => `
            <li>
              ID: ${patient.patient_id}, Name: ${patient.first_name} ${patient.last_name}, 
            
            </li>
          `
            )
            .join("")}
        </ul>
        <h2>Providers:</h2>
        <ul>
          ${providersResults
            .map(
              (provider) => `
            <li>
              Name: ${provider.first_name} ${provider.last_name}, Specialty: ${provider.provider_specialty}
            </li>
          `
            )
            .join("")}
        </ul>
        <h2>Patients by First Name</h2>
        <ul>
          ${patientsResults
            .map(
              (patient) => `
            <li>
              Name: ${patient.first_name}
            </li>
          `
            )
            .join("")}
        </ul>

        <h2>Providers by Specialty</h2> 
        <ul>
          ${providersResults
            .map(
              (provider) => `
            <li>
              Name: ${provider.first_name},Specialty: ${provider.provider_specialty}
            </li>
          `
            )
            .join("")}
        </ul>
      `);
    });
  });
});

// 1. Retrieve all patients
app.get("/patients", (req, res) => {
  const query = "SELECT patient_id, first_name, last_name";
  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).send("Error retrieving patients");
    }
    res.json(results);
  });
});

// 2. Retrieve all providers
app.get("/providers", (req, res) => {
  const query =
    "SELECT first_name, last_name, provider_specialty FROM providers";
  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).send("Error retrieving providers");
    }
    res.json(results);
  });
});

// 3. Filter patients by First Name
app.get("/patients/first_name/:firstName", (req, res) => {
  const { firstName } = req.params;
  const query = "SELECT * FROM patients WHERE first_name = ?";
  connection.query(query, [firstName], (err, results) => {
    if (err) {
      return res.status(500).send("Error retrieving patients");
    }
    res.json(results);
  });
});

// 4. Retrieve all providers by their specialty
app.get("/providers/specialty/:specialty", (req, res) => {
  const { specialty } = req.params;
  const query = "SELECT * FROM providers WHERE provider_specialty = ?";
  connection.query(query, [specialty], (err, results) => {
    if (err) {
      return res.status(500).send("Error retrieving providers");
    }
    res.json(results);
  });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
