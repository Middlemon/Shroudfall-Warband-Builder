import React, { useState } from "react";
import { factions } from "../data/factions";
import { terrains } from "../data/terrain";
import { scenarios } from "../data/scenarios";

export default function WarbandBuilder() {
  const [selectedFaction, setSelectedFaction] = useState("");
  const [warband, setWarband] = useState([]);
  const [selectedTerrains, setSelectedTerrains] = useState([]);
  const [selectedScenarios, setSelectedScenarios] = useState([]);

  const availableUnits = selectedFaction
    ? [
        ...factions[selectedFaction],
        ...(selectedFaction === "The Chosen of the Spirit Tree" ||
        selectedFaction === "Silver Line" ||
        selectedFaction === "Umbral Veil"
          ? factions["Mercenaries"]
          : []),
      ]
    : [];

  // Add unit with rules for Essence Weaver, Character, max 4
  const addUnit = (unit) => {
  const countSameUnit = warband.filter((u) => u.name === unit.name).length;
  if (countSameUnit >= 4) return; // max 4

  if (unit.notes.includes("Character") && countSameUnit > 0) return; // Character only once

  let extraCost = 0;

  if (unit.notes.includes("Essence Weaver")) {
    const existingWeavers = warband.filter((u) =>
      u.notes.includes("Essence Weaver")
    ).length;
    if (existingWeavers >= 1) {
      extraCost = 5; // första är normal, andra och efter får +5
    }
  }

  setWarband([...warband, { ...unit, cost: unit.cost + extraCost }]);
};


  const removeUnit = (index) => setWarband(warband.filter((_, i) => i !== index));

  const addTerrain = (terrain) => {
    if (selectedTerrains.length < 3) setSelectedTerrains([...selectedTerrains, terrain]);
  };
  const removeTerrain = (index) =>
    setSelectedTerrains(selectedTerrains.filter((_, i) => i !== index));

  const addScenario = (scenario) => {
    if (selectedScenarios.length < 3) setSelectedScenarios([...selectedScenarios, scenario]);
  };
  const removeScenario = (index) =>
    setSelectedScenarios(selectedScenarios.filter((_, i) => i !== index));

  const resetWarband = () => {
    setWarband([]);
    setSelectedTerrains([]);
    setSelectedScenarios([]);
  };

  const totalCost =
    warband.reduce((sum, u) => sum + u.cost, 0) +
    selectedTerrains.reduce((sum, t) => sum + t.cost, 0);

  const essenceCount = warband
    .flatMap((u) => u.essence)
    .reduce((acc, e) => {
      acc[e] = (acc[e] || 0) + 1;
      return acc;
    }, {});

  const harmonyCount = warband.filter((u) => u.notes.includes("Harmony")).length;
  const discordCount = warband.filter((u) => u.notes.includes("Discord")).length;

  // Group and sort units: Essence Weaver first, then alphabetical
  const groupedUnits = warband
    .slice()
    .sort((a, b) => {
      if (a.notes.includes("Essence Weaver") && !b.notes.includes("Essence Weaver")) return -1;
      if (!a.notes.includes("Essence Weaver") && b.notes.includes("Essence Weaver")) return 1;
      return a.name.localeCompare(b.name);
    })
    .reduce((acc, unit) => {
      if (!acc[unit.name]) acc[unit.name] = [];
      acc[unit.name].push(unit);
      return acc;
    }, {});

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Shroudfall Warband Builder</h1>

      <div className="flex gap-6">
        {/* Left column */}
        <div className="w-1/2 space-y-4">
          <select
            className="border p-2 rounded w-full"
            value={selectedFaction}
            onChange={(e) => {
              setSelectedFaction(e.target.value);
              resetWarband();
            }}
          >
            <option value="">Select Faction</option>
            {Object.keys(factions).map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>

          {selectedFaction && (
            <>
              <h2 className="text-xl font-semibold">Available Units:</h2>
              <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                {availableUnits.map((unit, idx) => (
                  <button
                    key={idx}
                    className="p-2 bg-blue-100 rounded hover:bg-blue-200 text-left"
                    onClick={() => addUnit(unit)}
                  >
                    {unit.name} ({unit.cost} pc)
                  </button>
                ))}
              </div>

              <h2 className="text-xl font-semibold mt-4">Terrain (max 3):</h2>
              <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                {terrains.map((terrain, idx) => (
                  <button
                    key={idx}
                    className="p-2 bg-green-100 rounded hover:bg-green-200 text-left"
                    onClick={() => addTerrain(terrain)}
                  >
                    {terrain.name} ({terrain.cost} pc)
                  </button>
                ))}
              </div>

              <h2 className="text-xl font-semibold mt-4">Scenarios (max 3):</h2>
              <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto">
                {scenarios.map((s, idx) => (
                  <button
                    key={idx}
                    className="p-2 bg-yellow-100 rounded hover:bg-yellow-200 text-left"
                    onClick={() => addScenario(s)}
                  >
                    {s.name}
                  </button>
                ))}
              </div>

              <button
                className="mt-4 px-4 py-2 bg-red-400 text-white rounded hover:bg-red-500 w-full"
                onClick={resetWarband}
              >
                Reset Warband
              </button>
            </>
          )}
        </div>

        {/* Right column */}
        <div className="w-1/2 space-y-4">
          {/* Warband */}
          {warband.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Your Warband:</h2>
              {Object.entries(groupedUnits).map(([unitName, units]) => (
                <div key={unitName} className="mb-2 border rounded p-2">
                  {units.map((unit, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center mb-1"
                    >
                      <span>
                        {unit.name} ({unit.cost} pc) — {idx + 1}/{units.length}
                      </span>
                      <button
                        className="text-red-500"
                        onClick={() => {
                          const unitIndex = warband.indexOf(unit);
                          if (unitIndex !== -1) removeUnit(unitIndex);
                        }}
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Terrain */}
          {selectedTerrains.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Selected Terrain:</h2>
              {selectedTerrains.map((t, idx) => (
                <div
                  key={idx}
                  className="flex justify-between border p-2 rounded mb-1"
                >
                  <span>{t.name}</span>
                  <button
                    className="text-red-500"
                    onClick={() => removeTerrain(idx)}
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Scenarios */}
          {selectedScenarios.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Selected Scenarios:</h2>
              {selectedScenarios.map((s, idx) => (
                <div
                  key={idx}
                  className="flex justify-between border p-2 rounded mb-1"
                >
                  <span>{s.name}</span>
                  <button
                    className="text-red-500"
                    onClick={() => removeScenario(idx)}
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Totals */}
          {warband.length > 0 || selectedTerrains.length > 0 ? (
            <div className="mt-4 p-4 border-t">
              <p>
                <strong>Total cost:</strong> {totalCost} pc
              </p>
              <p>
                <strong>Essence:</strong>{" "}
                {Object.entries(essenceCount)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(", ")}
              </p>
              {selectedFaction === "The Chosen of the Spirit Tree" && (
                <p>
                  <strong>Harmony:</strong> {harmonyCount} | <strong>Discord:</strong> {discordCount}
                </p>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
