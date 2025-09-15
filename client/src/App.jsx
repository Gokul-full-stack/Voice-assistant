import React, { useState, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import Navbar from "./component/Navbar";
import { TbSitemapFilled } from "react-icons/tb";
import { CiSearch } from "react-icons/ci";
import { IoMdContact } from "react-icons/io";
import { GoFilter } from "react-icons/go";
import { HiMiniSquare3Stack3D } from "react-icons/hi2";
import { Truck, Minus } from 'lucide-react';

// Map focus helper
function MapUpdater({ coords }) {
  const map = useMap();

  useEffect(() => {
    if (coords) {
      map.setView([coords.lat, coords.lng], 8);
      map.eachLayer((layer) => {
        if (
          layer.getLatLng &&
          layer.getLatLng().lat === coords.lat &&
          layer.getLatLng().lng === coords.lng
        ) {
          layer.openPopup();
        }
      });
    }
  }, [coords, map]);

  return null;
}

// Confirm modal
function ConfirmModal({ show, onConfirm, onCancel, commandText }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[2000]">
      <div className="bg-white rounded-xl shadow-lg p-6 w-96">
        <h2 className="text-lg font-semibold mb-2">Confirm Action</h2>
        <p className="text-sm text-gray-700 mb-4">
          Would you like to confirm this assignment?
        </p>
        {commandText && (
          <div className="mb-4 p-2 bg-gray-50 rounded text-sm text-gray-800">
            <strong>Command:</strong> <br />
            {commandText}
          </div>
        )}
        <div className="flex justify-end space-x-3">
          <button
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [vehicles, setVehicles] = useState({});
  const [highlight, setHighlight] = useState(null);
  const [output, setOutput] = useState("");
  const [selected, setSelected] = useState({});
  const [pendingCommand, setPendingCommand] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch vehicles
  const fetchVehicles = async () => {
    try {
      const res = await fetch("https://voice-assistant-cn82.onrender.com/api/vehicles");
      const data = await res.json();
      setVehicles(data);

      // default all selected
      const initial = {};
      Object.keys(data).forEach((k) => (initial[k] = true));
      setSelected(initial);
    } catch (err) {
      console.error("❌ Error fetching vehicles", err);
    }
  };

  // Send command
  const sendCommand = async (text) => {
    try {
      setLoading(true);
      const res = await fetch("https://voice-assistant-cn82.onrender.com/api/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text }),
      });

      const data = await res.json();
      setOutput(data.output);
      setHighlight(
        data.highlight ? { lat: data.highlight.lat, lng: data.highlight.lng } : null
      );

      await fetchVehicles();
      setLoading(false);
    } catch (err) {
      console.error(err);
      setOutput("⚠️ Error connecting to backend.");
      setLoading(false);
    }
  };

  // Handle commands
  const handleCommand = (text) => {
    if (text.toLowerCase().includes("assign")) {
      setPendingCommand(text);
      setShowModal(true);
    } else {
      sendCommand(text);
    }
  };

  // Confirm modal handlers
  const confirmAssign = () => {
    if (pendingCommand) {
      sendCommand(pendingCommand);
    }
    setShowModal(false);
    setPendingCommand(null);
  };

  const cancelAssign = () => {
    setOutput("❌ Assignment cancelled.");
    setShowModal(false);
    setPendingCommand(null);
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const customIcon = L.icon({
  iconUrl: "/icons/marker-icon.png",   // ✅ from public folder
  shadowUrl: "/icons/marker-shadow.png",
  iconSize: [25, 41], // default Leaflet size
  iconAnchor: [12, 41], 
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});


  return (
    <div className="h-screen w-full relative">
      {/* Navbar */}
      <Navbar onCommand={handleCommand}/>

      {/* Map - full screen */}
      <MapContainer
        center={[39.8283, -98.5795]}
        zoom={4}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

       {Object.entries(vehicles).map(([name, data]) =>
  selected[name] && (
    <Marker key={name} position={[data.lat, data.lng]} icon={customIcon}>
      <Popup>
        <div className="w-64 p-3 bg-white rounded shadow-md text-sm">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-pink-500 pb-1 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-500 flex items-center justify-center text-white rounded">
                🚚
              </div>
              <h2 className="font-bold">{name}</h2>
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-1">
            <p>
              <span className="font-semibold">Last Movement:</span>{" "}
              {data.lastMovement || "N/A"}
            </p>
            <p>
              <span className="font-semibold">Location:</span> {data.location}
            </p>
            <p>
              <span className="font-semibold">Driver:</span>{" "}
              {data.driver || "Not assigned"}
            </p>
            <p>
              <span className="font-semibold">Odometer:</span>{" "}
              {data.odometer || "0"} km
            </p>
            <p>
              <span className="font-semibold">Status:</span>{" "}
              {data.status || "Idle"}
            </p>
            <p>
              <span className="font-semibold">Speed:</span>{" "}
              {data.speed || 0} mph
            </p>
          </div>
        </div>
      </Popup>
    </Marker>
  )
)}
        {highlight && <MapUpdater coords={highlight} />}
      </MapContainer>

     {/* Sidebar overlay */}
<div className="absolute top-22 flex w-full justify-between px-3">
  {/* Left Sidebar */}
  <div className="flex flex-row gap-5">
    <div className="w-80 h-fit bg-white/95 backdrop-blur-md border-r border-gray-300 p-3 overflow-y-auto z-10 rounded-lg">
    
    {/* Header Row */}
    <div className="flex flex-row border-b p-2 justify-between items-center">
        <TbSitemapFilled size={20} />
        <Truck size={20} />
      <Minus size={20} />
    </div>

    {/* Dropdown + Search */}
    <div className="p-3 space-y-1.5">
      <div className="flex justify-between items-center">
        <p className="font-semibold">See</p>
      </div>
      <select className="border w-full p-2 rounded-lg">
        <option>Groups</option>
      </select>
    </div>

    {/* Vehicle List */}
    <ul className="space-y-2 p-5">
      {Object.entries(vehicles).map(([name, data]) => (
        <li key={name} className="flex items-start space-x-2">
          <input
            type="checkbox"
            checked={selected[name] || false}
            onChange={(e) =>
              setSelected({ ...selected, [name]: e.target.checked })
            }
          />
          <div
            className="cursor-pointer text-sm"
            onClick={() => setHighlight(data)}
          >
            <span className="font-semibold">{name}</span> <br />
            📍 {data.location} <br />
            👨‍✈️ {data.driver || "Not assigned"}
          </div>
        </li>
      ))}
    </ul>

    {/* Select/Deselect All */}
    <div className="mt-4 border-t flex justify-end">
      <button
        className="mb-2 px-3 py-1 text-sm rounded text-blue-500"
        onClick={() => {
          const all = {};
          const newState = !Object.values(selected).every(Boolean);
          Object.keys(vehicles).forEach((k) => (all[k] = newState));
          setSelected(all);
        }}
      >
        {Object.values(selected).every(Boolean) ? "DESELECT ALL" : "Select All"}
      </button>
    </div>
    
  </div>
  {/* Search Icon */}
 <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full cursor-pointer shadow mt-2">
  <CiSearch size={20} className="text-black" />
</div>

        
  </div>
  

  {/* Right-side Icon */}
  <div className="flex flex-row gap-3">
    <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full cursor-pointer shadow mt-2">
      <IoMdContact size={20} className="text-black" />
  </div>
  <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full cursor-pointer shadow mt-2">
      <GoFilter size={20} className="text-black" />
  </div>
   <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full cursor-pointer shadow mt-2">
      <HiMiniSquare3Stack3D size={20} className="text-black" />
  </div>
  </div>

</div>
      {/* Confirmation Modal */}
      <ConfirmModal
        show={showModal}
        onConfirm={confirmAssign}
        onCancel={cancelAssign}
        commandText={pendingCommand}
      />
    </div>
  );
}

export default App;
