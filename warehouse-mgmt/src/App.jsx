import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';

import Dashboard from './pages/Dashboard.jsx';
import Items from './pages/Items.jsx';
import Warehouses from './pages/Warehouses.jsx';
import Locations from './pages/Locations.jsx';
import RfidTags from './pages/RfidTags.jsx';
import SupplierGateIn from './pages/SupplierGateIn.jsx';
import InternalTransfer from './pages/InternalTransfer.jsx';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/items" element={<Items />} />
          <Route path="/warehouses" element={<Warehouses />} />
          <Route path="/locations" element={<Locations />} />
          <Route path="/rfid-tags" element={<RfidTags />} />
          <Route path="/supplier-gate-in" element={<SupplierGateIn />} />
          <Route path="/internal-transfer" element={<InternalTransfer />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
