import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { MapPin, ChevronRight } from 'lucide-react';
import SectionCard from '../components/SectionCard.jsx';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8585/api';

export default function Locations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_BASE_URL}/locations`);
        setLocations(data);
      } catch (err) {
        console.error('Failed to load locations', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, []);

  // Build tree in memory based on parentLocationId
  const tree = useMemo(() => {
    const byId = new Map();
    locations.forEach((l) => {
      byId.set(l.id, { ...l, children: [] });
    });
    const roots = [];
    byId.forEach((node) => {
      if (node.parentLocationId) {
        const parent = byId.get(node.parentLocationId);
        if (parent) parent.children.push(node);
      } else {
        roots.push(node);
      }
    });
    return roots;
  }, [locations]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <div className="h-12 w-12 border-2 border-black/60 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const renderNode = (node, depth = 0) => (
    <div key={node.id}>
      <div
        className="flex items-center gap-3 py-2 px-2 rounded-[5px] hover:bg-slate-50"
        style={{ marginLeft: depth * 18 }}
      >
        <MapPin className="w-6 h-6 text-slate-700" />
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 flex-1 min-w-0">
          <span className="text-[15px] font-medium text-slate-900 truncate">
            {node.code} – {node.name}
          </span>
          <span className="inline-flex items-center text-[11px] uppercase tracking-wide px-2 py-0.5 rounded-[5px] border border-black/10 text-slate-600 bg-white">
            {node.locationType}
          </span>
        </div>
        {node.children.length > 0 && (
          <ChevronRight className="w-4 h-4 text-slate-400" />
        )}
      </div>
      {node.children.map((child) => renderNode(child, depth + 1))}
    </div>
  );

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <MapPin className="w-8 h-8 text-slate-800" />
        <div>
          <h1 className="text-3xl md:text-[32px] font-semibold text-slate-900">
            Locations
          </h1>
          <p className="text-base text-slate-600">
            Hierarchy of storage locations across warehouses (Warehouse → Zone → Floor → Rack → Bin).
          </p>
        </div>
      </div>

      <SectionCard className="mt-2">
        {tree.length === 0 ? (
          <p className="text-[15px] text-slate-500">
            No locations found. Seed them using your backend tools.
          </p>
        ) : (
          <div className="space-y-1">
            {tree.map((root) => renderNode(root))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
