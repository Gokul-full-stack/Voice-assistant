// backend/server.js
import express from "express";
import cors from "cors";

const app = express();
app.use(cors({
  origin: [
    "http://localhost:5173",
     "https://verizonvoiceassistant.netlify.app"
],
  credentials: true,
}));
app.use(express.json());

// Mock dataset (drivers start unassigned)
let mockVehicles = {
  "vehicle a": { lat: 37.7749, lng: -122.4194, driver: null, location: "San Francisco" },
  "vehicle b": { lat: 34.0522, lng: -118.2437, driver: null, location: "Los Angeles" },
  "vehicle c": { lat: 40.7128, lng: -74.0060, driver: null, location: "New York" },
};

let drivers = [
  { id: 1, driverName: "sam" },
  { id: 2, driverName: "vasu" },
  { id: 3, driverName: "mani" },
];

// Number words → digits for "vehicle one" parsing
const numberWords = {
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  nine: "9",
  ten: "10",
};

// Normalize helper
function normalize(str) {
  if (!str) return "";
  let text = str.toLowerCase().replace(/[?.!,]/g, "").trim();
  for (let word in numberWords) {
    text = text.replace(new RegExp(`\\b${word}\\b`, "g"), numberWords[word]);
  }
  return text;
}

// -------------------- API ROUTES -------------------- //

// Get all vehicles
app.get("/api/vehicles", (req, res) => {
  res.json(mockVehicles);
});

// Add a vehicle (keeps name normalized)
app.post("/api/vehicles", (req, res) => {
  let { name, lat, lng, location, driver } = req.body;
  if (!name || !lat || !lng || !location) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  name = normalize(name);
  mockVehicles[name] = {
    lat,
    lng,
    location,
    driver: driver || null,
  };

  res.status(201).json({
    message: `✅ Vehicle "${name}" added successfully`,
    vehicle: mockVehicles[name],
  });
});

// NLP Command Handler
app.post("/api/command", (req, res) => {
  const { transcript } = req.body;
  const cmd = normalize(transcript);

  let result = { output: "❌ Could not understand.", highlight: null };

  // Find vehicle (normalized)
  const foundVehicle = Object.entries(mockVehicles).find(([name]) =>
    cmd.includes(normalize(name))
  );

  // Find driver by name token
  const foundDriver = drivers.find((d) => cmd.includes(d.driverName.toLowerCase()));

  // Find location (city)
  const foundLocation = Object.entries(mockVehicles).find(([_, v]) =>
    cmd.includes(v.location.toLowerCase())
  );

  // Assign driver -> ensure single assignment across vehicles
  if (cmd.includes("assign") && foundDriver && foundVehicle) {
    const vName = foundVehicle[0];

    // Unassign driver from any other vehicle first
    for (let [vehName, v] of Object.entries(mockVehicles)) {
      if (v.driver && v.driver.toLowerCase() === foundDriver.driverName.toLowerCase()) {
        mockVehicles[vehName].driver = null;
      }
    }

    const prevDriver = mockVehicles[vName].driver;
    mockVehicles[vName].driver = foundDriver.driverName;

    result.output = `✅ Assigned ${foundDriver.driverName} to ${vName}. (prev: ${prevDriver || "none"})`;
    result.highlight = { name: vName, ...mockVehicles[vName] };
    return res.json(result);
  }

  // Unassign driver
  if (cmd.includes("unassign") && foundVehicle) {
    const vName = foundVehicle[0];
    const prevDriver = mockVehicles[vName].driver;
    mockVehicles[vName].driver = null;

    result.output = prevDriver
      ? `🚫 Unassigned ${prevDriver} from ${vName}.`
      : `ℹ️ No driver was assigned to ${vName}.`;
    result.highlight = { name: vName, ...mockVehicles[vName] };
    return res.json(result);
  }

  // Count vehicles in location
  if ((cmd.includes("count") || cmd.includes("how many")) && foundLocation) {
    const loc = foundLocation[1].location;
    const vehiclesHere = Object.entries(mockVehicles).filter(
      ([_, v]) => v.location.toLowerCase() === loc.toLowerCase()
    );
    result.output = `📊 There are ${vehiclesHere.length} vehicle(s) in ${loc}.`;
    return res.json(result);
  }

  // Vehicle query
  if (foundVehicle) {
    const [name, v] = foundVehicle;
    result.output = `📍 ${name} is in ${v.location} at (${v.lat}, ${v.lng}). Driver: ${v.driver || "Not assigned"}`;
    result.highlight = { name, ...v };
    return res.json(result);
  }

  // Driver query
  if (foundDriver) {
    const vMatch = Object.entries(mockVehicles).find(
      ([_, v]) => v.driver?.toLowerCase() === foundDriver.driverName.toLowerCase()
    );
    if (vMatch) {
      const [name, v] = vMatch;
      result.output = `👨‍✈️ Driver ${foundDriver.driverName} is with ${name} in ${v.location}.`;
      result.highlight = { name, ...v };
      return res.json(result);
    } else {
      result.output = `ℹ️ Driver ${foundDriver.driverName} is not assigned to any vehicle yet.`;
      return res.json(result);
    }
  }

  res.json(result);
});

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`));
