import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { MapPin, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import SectionCard from '../components/SectionCard.jsx';
import BinCard from '../components/BinCard.jsx';

export default function BinManagement() {
  const [bins, setBins] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [binsRes, itemsRes] = await Promise.all([
        api.get('/locations?type=BIN'),
        api.get('/inventory'),
      ]);
      setBins(binsRes.data);
      setItems(itemsRes.data);
    } catch (err) {
      console.error('Failed to load bins');
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const itemId = result.draggableId;
    const sourceBinId = result.source.droppableId;
    const destBinId = result.destination.droppableId;

    if (sourceBinId === destBinId) return;

    const item = items.find(i => i.id.toString() === itemId);
    const destBin = bins.find(b => b.id.toString() === destBinId);

    // Check capacity
    if (destBin.currentCapacity + item.quantity > destBin.maxCapacity) {
      toast.error('Destination bin is full!');
      return;
    }

    try {
      await api.post('/inventory/move', {
        itemId: item.id,
        fromLocationId: sourceBinId,
        toLocationId: destBinId,
        quantity: item.quantity,
      });

      toast.success(`Moved ${item.itemCode} to ${destBin.code}`);
      loadData(); // Refresh
    } catch (err) {
      toast.error('Failed to move item');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold text-black mb-2">Bin Management</h1>
      <p className="text-black/70 mb-6">
        Drag items between bins to reorganize warehouse
      </p>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid gap-6 md:grid-cols-3">
          {bins.map(bin => {
            const binItems = items.filter(i => i.locationId === bin.id);
            
            return (
              <Droppable key={bin.id} droppableId={bin.id.toString()}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <SectionCard>
                      <BinCard 
                        bin={{ ...bin, currentCapacity: binItems.reduce((s, i) => s + i.quantity, 0) }}
                        isDragOver={snapshot.isDraggingOver}
                      />

                      <div className="mt-4 space-y-2">
                        {binItems.map((item, index) => (
                          <Draggable
                            key={item.id}
                            draggableId={item.id.toString()}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`p-3 border border-black/10 rounded-[5px] bg-white ${
                                  snapshot.isDragging ? 'shadow-lg scale-105' : ''
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <Package className="w-4 h-4 text-slate-600" />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-black truncate">
                                      {item.itemCode}
                                    </div>
                                    <div className="text-xs text-black/60">
                                      Qty: {item.quantity}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>

                      {binItems.length === 0 && (
                        <div className="mt-4 text-center text-sm text-black/50">
                          Drop items here
                        </div>
                      )}
                    </SectionCard>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
