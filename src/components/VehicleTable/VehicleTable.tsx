import React, { useEffect, useState } from "react";
import axios from "axios";
import "./VehicleTable.css";

interface Vehicle {
  id: number;
  model: string;
  firstRegistrationYear: string;
  cubicCapacity: number;
  fuel: string;
  mileage: number;
}

export const VehicleTable: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Get all vehicles from the backend
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        setError(null);
        const resp = await axios.get<Vehicle[]>(
          "http://localhost:8080/api/vehicles/all"
        );
        setVehicles(resp.data);
      } catch (err: any) {
        console.error("Error fetching vehicles:", err);
        setError(err?.message || "Failed to load vehicles");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  return (
    <div className="vehicle-page">
      <div className="vehicle-header">
        <h1>Vehicle data</h1>
        <button
          className="btn-new"
          onClick={() => {
            alert("Open create vehicle form (implement routing/modal).");
          }}
        >
          + New
        </button>
      </div>
      <div className="table-wrapper">
        {loading ? (
          <div className="status">Loading...</div>
        ) : error ? (
          <div className="status error">Error: {error}</div>
        ) : (
          <table className="vehicle-table" cellSpacing={0}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Model</th>
                <th>First Registration Year</th>
                <th>Cubic Capacity</th>
                <th>Fuel</th>
                <th>Mileage</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {vehicles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="no-data">
                    No vehicles found.
                  </td>
                </tr>
              ) : (
                vehicles.map((v) => (
                  <tr key={v.id}>
                    <td>{v.id}</td>
                    <td>{v.model}</td>
                    <td>{v.firstRegistrationYear}</td>
                    <td>{v.cubicCapacity}</td>
                    <td>{v.fuel}</td>
                    <td>{v.mileage}</td>
                    <td>
                      <button
                        className="btn-delete"
                        onClick={() => {
                          alert("Open delete vehicle confirmation (implement routing/modal).");
                        }}
                        title="Delete"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default VehicleTable;
