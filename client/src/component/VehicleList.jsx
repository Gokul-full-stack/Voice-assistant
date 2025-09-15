import React from "react";

function VehicleList({ vehicles }) {
  if (!Array.isArray(vehicles)) {
    return <div className="p-4">❌ No vehicles found.</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-2">Vehicles</h2>
      <ul className="space-y-2">
        {vehicles.map((v, index) => (
          <li
            key={index}
            className="border p-2 rounded-lg shadow-sm bg-gray-50"
          >
            🚗 <strong>{v.name}</strong> – Driver:{" "}
            {v.driver ? v.driver : "None"} – Location: {v.location}
          </li>
        ))}
      </ul>
    </div>
  );
}


export default VehicleList;
