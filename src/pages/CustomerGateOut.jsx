import { useState } from 'react';
import { ArrowRightLeft, Plus } from 'lucide-react';
import SectionCard from '../components/SectionCard';

export default function InternalTransfer() {
  const [transfers, setTransfers] = useState([]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-black">Internal Transfer</h1>
          <p className="text-black/70">Move inventory between locations</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-[5px] hover:bg-black/80">
          <Plus className="w-4 h-4" />
          New Transfer
        </button>
      </div>

      <SectionCard>
        <div className="text-center py-20">
          <ArrowRightLeft className="w-16 h-16 mx-auto text-black/20 mb-4" />
          <h3 className="text-lg font-medium text-black mb-2">No Transfers Yet</h3>
          <p className="text-black/60 mb-6">Create your first internal transfer</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-[5px] hover:bg-blue-700">
            Create Transfer
          </button>
        </div>
      </SectionCard>
    </div>
  );
}
