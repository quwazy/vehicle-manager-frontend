import './App.css'
import { Routes, Route, Navigate } from "react-router-dom";
import VehicleTable from "./components/VehicleTable/VehicleTable";
import { AddVehicle } from './components/AddVehicle/AddVehicle';

function App() {

  return (
    <Routes>
      <Route path='/' element={<VehicleTable />} />
      <Route path='/add' element={<AddVehicle />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
