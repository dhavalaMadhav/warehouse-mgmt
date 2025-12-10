import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import OfflineIndicator from './components/OfflineIndicator';

// Pages
import Dashboard from './pages/Dashboard';
import Items from './pages/Items';
import Warehouses from './pages/Warehouses';
import Locations from './pages/Locations';
import RfidTags from './pages/RfidTags';
import SupplierGateIn from './pages/SupplierGateIn';
import CustomerGateOut from './pages/CustomerGateOut';
import InternalTransfer from './pages/InternalTransfer';
import PickOrders from './pages/PickOrders';
import PackOrders from './pages/PackOrders';
import BinManagement from './pages/BinManagement';
import Analytics from './pages/Analytics';
import SearchAssistant from './pages/SearchAssistant';
import AuditTrail from './pages/AuditTrail';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <OfflineIndicator />
      
      <Layout>
        <Routes>
          {/* Main Dashboard */}
          <Route path="/" element={<Dashboard />} />
          
          {/* Master Data */}
          <Route path="/items" element={<Items />} />
          <Route path="/warehouses" element={<Warehouses />} />
          <Route path="/locations" element={<Locations />} />
          <Route path="/rfid-tags" element={<RfidTags />} />
          
          {/* Transactions */}
          <Route path="/supplier-gate-in" element={<SupplierGateIn />} />
          <Route path="/customer-gate-out" element={<CustomerGateOut />} />
          <Route path="/internal-transfer" element={<InternalTransfer />} />
          
          {/* Operations */}
          <Route path="/pick-orders" element={<PickOrders />} />
          <Route path="/pack-orders" element={<PackOrders />} />
          <Route path="/bin-management" element={<BinManagement />} />
          
          {/* Analytics & Search - NO PROTECTION */}
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/search" element={<SearchAssistant />} />
          
          {/* Admin - NO PROTECTION */}
          <Route path="/audit-trail" element={<AuditTrail />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
