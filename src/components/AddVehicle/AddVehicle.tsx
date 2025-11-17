import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AddVehicle.css";

type FuelOption = "PETROL" | "DIESEL" | "ELECTRIC" | "HYBRID" | string;

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
};

export const AddVehicle: React.FC = () => {
  const [form, setForm] = useState<CreateVehicleDTO>({ ...DEFAULT });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const fuelOptions: FuelOption[] = ["PETROL", "DIESEL", "ELECTRIC", "HYBRID"];

  const validate = (): boolean => {
    const e: Record<string, string> = {};

    if (!form.model.trim()) e.model = "Model cannot be empty";
    if (!form.firstRegistrationYear.trim())
      e.firstRegistrationYear = "First registration year cannot be empty";
    // optionally: validate it's a year (simple)
    if (
      form.firstRegistrationYear.trim() &&
      !/^\d{4}$/.test(form.firstRegistrationYear.trim())
    ) {
      e.firstRegistrationYear = "Enter a 4-digit year (e.g. 2023)";
    }

    if (form.cubicCapacity === null || Number.isNaN(form.cubicCapacity))
      e.cubicCapacity = "Cubic capacity cannot be empty";
    else if (form.cubicCapacity <= 0)
      e.cubicCapacity = "Cubic capacity must be positive";

    if (!form.fuel) e.fuel = "Fuel cannot be null";

    if (form.mileage === null || Number.isNaN(form.mileage))
      e.mileage = "Mileage cannot be empty";
    else if (form.mileage < 0) 
      e.mileage = "Mileage cannot be negative";

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
      setSubmitting(true);
      const resp = await axios.post(
        "http://localhost:8080/api/vehicles/add",
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      // success handling: clear form and show message
      setForm({ ...DEFAULT });
      setErrors({});
      setServerMessage("Vehicle saved successfully.");
      // optionally: emit event or call parent to refresh list
      console.log("Saved", resp.data);
    } catch (err: any) {
      console.error(err);
      // Try to show useful message
      if (err.response?.data) {
        // If backend returns validation errors in a specific shape, map here
        const msg =
          typeof err.response.data === "string"
            ? err.response.data
            : JSON.stringify(err.response.data);
        setServerMessage("Server error: " + msg);
      } else {
        setServerMessage("Network error or server unreachable.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-vehicle-page">
      <div className="add-vehicle-header">
        <h1>New vehicle</h1>
        <button
          className="btn-save"
          onClick={() => { navigate("/") }}
          title="Home"
        >
          Save
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
              // type="number"
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
              <option value="" disabled hidden className="placeholder-option">Fuel</option>
              {fuelOptions.map((f) => (
                <option key={f} value={f}>
                  {f.charAt(0) + f.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
            {errors.fuel && <div className="error-text">{errors.fuel}</div>}
          </div>

          <div className="form-group">
            <input
              placeholder="Mileage"
              // type="number"
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
          <button
            type="submit"
            className="btn-save btn-save-inline"
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save"}
          </button>
        </div>
      </form>

      {serverMessage && <div className="server-message">{serverMessage}</div>}
    </div>
  );
};

export default AddVehicle;
