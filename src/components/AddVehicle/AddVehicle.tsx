import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import VehicleService from "../../services/VehicleService";
import type { CreateVehicleDto } from "../../services/VehicleService";
import "./AddVehicle.css";

const DEFAULT: CreateVehicleDto = {
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
  const [form, setForm] = useState<CreateVehicleDto>({ ...DEFAULT });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverMessage, setServerMessage] = useState<ServerMessage | null>(null);
  const navigate = useNavigate();

  const fuelOptions: string[] = ["PETROL", "DIESEL", "HYBRID"];

  const validate = (): boolean => {
    const e: Record<string, string> = {};

    if (!form.fuel) 
      e.fuel = "Fuel must be selected";

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
    else if (typeof form.cubicCapacity === "string" && !/^\d+$/.test(form.cubicCapacity)) {
      e.cubicCapacity = "Cubic capacity must be a valid number";
    } else if (form.cubicCapacity <= 999)
      e.cubicCapacity = "Cubic capacity must be above 999";
    else if (form.cubicCapacity > 9999)
      e.cubicCapacity = "Cubic capacity cannot exceed 9,999";

    if (form.mileage === null) {
      e.mileage = "Mileage cannot be empty";
    } else if (typeof form.mileage === "string" && !/^\d+$/.test(form.mileage)) {
      e.mileage = "Mileage must be a valid number";
    } else if (Number(form.mileage) < 0) {
      e.mileage = "Mileage cannot be negative";
    } else if (Number(form.mileage) > 9999999) {
      e.mileage = "Mileage cannot exceed 9,999,999 km";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onChange =
    (key: keyof CreateVehicleDto) =>
    (ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const val = ev.target.value;
      setForm((s) => ({ ...s, [key]: val }));
    };

  const handleSubmit = async (ev?: React.FormEvent) => {
    ev?.preventDefault();
    setServerMessage(null);

    if (!validate()) 
      return;

    const payload : CreateVehicleDto = {
      model: form.model.trim(),
      firstRegistrationYear: form.firstRegistrationYear.trim(),
      cubicCapacity: form.cubicCapacity,
      fuel: form.fuel,
      mileage: form.mileage,
    };

    try {
      await VehicleService.createVehicle(payload);

      setForm({ ...DEFAULT });  //empty form
      setErrors({});            //clear errors
      setServerMessage({        //server success message
        text: "Vehicle saved successfully.",
        type: "success",
      });
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
          }}>
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
