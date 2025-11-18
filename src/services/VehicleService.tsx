import axios from "axios";

const vehicleController : string = import.meta.env.VITE_API_BASE_URL+"/vehicles";

if (!vehicleController) {
  console.warn("VITE_API_BASE_URL is not defined in .env!");
}

interface VehicleDto {
  id: number;
  model: string;
  firstRegistrationYear: string;
  cubicCapacity: number;
  fuel: string;
  mileage: number;
}

interface CreateVehicleDto {
  model: string;
  firstRegistrationYear: string;
  cubicCapacity: number | null;
  fuel: "PETROL" | "DIESEL" | "HYBRID" | string;
  mileage: number | null;
}

export type { VehicleDto, CreateVehicleDto };

const VehicleService = {
    getAllVehicles: async (): Promise<VehicleDto[]> => {
        const response = await axios.get(`${vehicleController}/all`);
        return response.data;
    },

    createVehicle: async (vehicle: CreateVehicleDto): Promise<VehicleDto> => {
        const response = await axios.post(
            `${vehicleController}/add`,
            vehicle,
            { headers: { "Content-Type": "application/json" } }
        );
        return response.data;
    },

    deleteVehicle: async (id: number): Promise<void> => {
        const response = await axios.delete(`${vehicleController}/remove/${id}`);
        return response.data;
    }
}

export default VehicleService;
