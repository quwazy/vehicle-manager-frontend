import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AddVehicle.css";

type FuelOption = "PETROL" | "DIESEL" | "HYBRID" | string;

interface CreateVehicleDTO {
  model: string;
  firstRegistrationYear: string;
  cubicCapacity: number | null;
  fuel: FuelOption;
  mileage: number | null;
}

const DEFAULT: CreateVehicleDTO = {
  model: "",
  firstRegistrationYear: "",
  cubicCapacity: null,
  fuel: "",
  mileage: null,
}

interface ServerMessage {
  text: string;
  type: "success" | "error";
}

export const AddVehicle: React.FC = () => {
  const [form, setForm] = useState<CreateVehicleDTO>({ ...DEFAULT });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverMessage, setServerMessage] = useState<ServerMessage | null>(null);
  const navigate = useNavigate();

  const fuelOptions: FuelOption[] = ["PETROL", "DIESEL", "HYBRID"];

  const validate = (): boolean => {
    const e: Record<string, string> = {};

    if (!form.fuel) 
      e.fuel = "Fuel cannot be null";

    if (!form.model.trim()) 
      e.model = "Model cannot be empty";
    else if (form.model.trim().length > 40)
      e.model = "Model cannot exceed 40 characters";

    if (!form.firstRegistrationYear.trim())
      e.firstRegistrationYear = "First registration year cannot be empty";
    else if (!/^\d{4}$/.test(form.firstRegistrationYear.trim())) {
      e.firstRegistrationYear = "Enter a 4-digit year (e.g. 2023)";
    } else {
      const year = Number(form.firstRegistrationYear.trim());
      if (year < 1885 || year > 2026) {
        e.firstRegistrationYear = "Year must be between 1885 and 2026";
      }
    }

    if (form.cubicCapacity === null || Number.isNaN(form.cubicCapacity))
      e.cubicCapacity = "Cubic capacity cannot be empty";
    else if (form.cubicCapacity <= 999)
      e.cubicCapacity = "Cubic capacity must be above 999 cc";
    else if (form.cubicCapacity > 9999)
      e.cubicCapacity = "Cubic capacity cannot exceed 9,999 cc";

    if (form.mileage === null || Number.isNaN(form.mileage))
      e.mileage = "Mileage cannot be empty";
    else if (form.mileage < 0) 
      e.mileage = "Mileage cannot be negative";
    else if (form.mileage > 9999999)
      e.mileage = "Mileage cannot exceed 9,999,999 km";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onChange =
    (key: keyof CreateVehicleDTO) =>
    (ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const val = ev.target.value;
      if (key === "cubicCapacity" || key === "mileage") {
        // convert to number or null if empty
        setForm((s) => ({ ...s, [key]: val === "" ? null : Number(val) }));
      } else {
        setForm((s) => ({ ...s, [key]: val }));
      }
    };

  const handleSubmit = async (ev?: React.FormEvent) => {
    ev?.preventDefault();
    setServerMessage(null);

    if (!validate()) return;

    const payload = {
      model: form.model.trim(),
      firstRegistrationYear: form.firstRegistrationYear.trim(),
      cubicCapacity: form.cubicCapacity,
      fuel: form.fuel,
      mileage: form.mileage,
    };

    try {
      const resp = await axios.post(
        "http://localhost:8080/api/vehicles/add",
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      setForm({ ...DEFAULT });
      setErrors({});
      setServerMessage({
        text: "Vehicle saved successfully.",
        type: "success",
      });
      console.log("Saved", resp.data);
    } catch (err: any) {
      if (err.response?.data) {
        const status = err.response.status;
        const error =
          typeof err.response.data === "string"
            ? err.response.data
            : err.response.data.error || JSON.stringify(err.response.data);
        setServerMessage({
          text: `Error ${status}: ${error}`,
          type: "error",
        });
      } else {
        setServerMessage({
          text: "Network error or server unreachable.",
          type: "error",
        });
      }
    }
  };

  return (
    <div className="add-vehicle-page">
      <div className="add-vehicle-header">
        <h1>New vehicle</h1>
        <button
          className="btn-save"
          onClick={() => {
            navigate("/");
          }}
        >
          Home
        </button>
      </div>

      <form className="add-vehicle-form" onSubmit={handleSubmit} noValidate>
        <div className="form-row">
          <div className="form-group">
            <input
              placeholder="Model"
              value={form.model}
              onChange={onChange("model")}
              className={errors.model ? "invalid" : ""}
            />
            {errors.model && <div className="error-text">{errors.model}</div>}
          </div>

          <div className="form-group">
            <input
              placeholder="First registration year"
              value={form.firstRegistrationYear}
              onChange={onChange("firstRegistrationYear")}
              className={errors.firstRegistrationYear ? "invalid" : ""}
            />
            {errors.firstRegistrationYear && (
              <div className="error-text">{errors.firstRegistrationYear}</div>
            )}
          </div>

          <div className="form-group">
            <input
              placeholder="Cubic capacity"
              value={form.cubicCapacity ?? ""}
              onChange={onChange("cubicCapacity")}
              className={errors.cubicCapacity ? "invalid" : ""}
            />
            {errors.cubicCapacity && (
              <div className="error-text">{errors.cubicCapacity}</div>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <select
              value={form.fuel}
              onChange={onChange("fuel")}
              className={`input-like${errors.fuel ? " invalid" : ""}`}
            >
              <option value="" disabled hidden className="placeholder-option">
                Fuel
              </option>
              {fuelOptions.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            {errors.fuel && <div className="error-text">{errors.fuel}</div>}
          </div>

          <div className="form-group">
            <input
              placeholder="Mileage"
              value={form.mileage ?? ""}
              onChange={onChange("mileage")}
              className={errors.mileage ? "invalid" : ""}
            />
            {errors.mileage && (
              <div className="error-text">{errors.mileage}</div>
            )}
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-save btn-save-inline">
            Save
          </button>
        </div>
      </form>

      {serverMessage && (
        <div
          className={`server-message${
            serverMessage.type === "error" ? " error" : ""
          }`}
        >
          {serverMessage.text}
        </div>
      )}
    </div>
  );
};

export default AddVehicle;
