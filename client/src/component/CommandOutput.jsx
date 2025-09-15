import React from "react";

function CommandOutput({ output }) {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold">Assistant Output</h2>
      <div className="border rounded-lg p-3 bg-gray-100 mt-2">
        {output ? output : "Say something..."}
      </div>
    </div>
  );
}

export default CommandOutput;
