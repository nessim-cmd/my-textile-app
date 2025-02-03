"use client";
import { useState } from 'react';

interface Accessory {
  id: string;
  name: string;
  total: number;
  used: number;
}

interface Lotto {
  id: string;
  name: string;
  accessories: {
    id: string;
    quantity: number;
  }[];
}

interface Model {
  id: string;
  name: string;
  client: string;
  accessories: Accessory[];
  lottos: Lotto[];
}

export default function ModelManager() {
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [newModel, setNewModel] = useState({
    name: '',
    client: '',
    accessories: [{ id: crypto.randomUUID(), name: '', quantity: 0 }]
  });
  const [newLotto, setNewLotto] = useState({
    name: '',
    accessories: {} as Record<string, number>
  });

  // Create new model
  const createModel = () => {
    const model: Model = {
      id: crypto.randomUUID(),
      name: newModel.name,
      client: newModel.client,
      accessories: newModel.accessories.map(a => ({
        id: a.id,
        name: a.name,
        total: a.quantity,
        used: 0
      })),
      lottos: []
    };
    setModels([...models, model]);
    setNewModel({
      name: '',
      client: '',
      accessories: [{ id: crypto.randomUUID(), name: '', quantity: 0 }]
    });
  };

  // Add accessory to new model
  const addAccessoryField = () => {
    setNewModel(prev => ({
      ...prev,
      accessories: [...prev.accessories, { id: crypto.randomUUID(), name: '', quantity: 0 }]
    }));
  };

  // Create new lotto
  const createLotto = () => {
    if (!selectedModelId) return;
    
    const model = models.find(m => m.id === selectedModelId);
    if (!model) return;

    // Validate quantities
    const isValid = model.accessories.every(acc => {
      const allocated = Object.values(newLotto.accessories)
        .reduce((sum, qty) => sum + (qty || 0), 0);
      return (acc.used + allocated) <= acc.total;
    });

    if (!isValid) {
      alert('Cannot allocate more than total quantity!');
      return;
    }

    const lotto: Lotto = {
      id: crypto.randomUUID(),
      name: newLotto.name,
      accessories: Object.entries(newLotto.accessories)
        .filter(([_, qty]) => qty > 0)
        .map(([id, quantity]) => ({ id, quantity }))
    };

    const updatedModels = models.map(m => m.id === selectedModelId ? {
      ...m,
      lottos: [...m.lottos, lotto],
      accessories: m.accessories.map(acc => ({
        ...acc,
        used: acc.used + (newLotto.accessories[acc.id] || 0)
      }))
    } : m);

    setModels(updatedModels);
    setNewLotto({ name: '', accessories: {} });
  };

  const selectedModel = models.find(m => m.id === selectedModelId);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Model Creation Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Create New Model</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Model Name"
            className="p-2 border rounded"
            value={newModel.name}
            onChange={e => setNewModel({ ...newModel, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Client Name"
            className="p-2 border rounded"
            value={newModel.client}
            onChange={e => setNewModel({ ...newModel, client: e.target.value })}
          />
        </div>
        
        <h3 className="text-lg font-semibold mb-2">Accessories</h3>
        {newModel.accessories.map((acc, index) => (
          <div key={acc.id} className="flex gap-4 mb-2">
            <input
              type="text"
              placeholder="Accessory Name"
              className="p-2 border rounded flex-1"
              value={acc.name}
              onChange={e => {
                const accessories = [...newModel.accessories];
                accessories[index].name = e.target.value;
                setNewModel({ ...newModel, accessories });
              }}
            />
            <input
              type="number"
              placeholder="Quantity"
              className="p-2 border rounded w-32"
              value={acc.quantity}
              onChange={e => {
                const accessories = [...newModel.accessories];
                accessories[index].quantity = parseInt(e.target.value) || 0;
                setNewModel({ ...newModel, accessories });
              }}
            />
          </div>
        ))}
        <button
          onClick={addAccessoryField}
          className="mt-2 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          + Add Accessory
        </button>
        
        <button
          onClick={createModel}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Create Model
        </button>
      </div>

      {/* Model Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">Models</h2>
            <div className="space-y-2">
              {models.map(model => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModelId(model.id)}
                  className={`w-full text-left p-3 rounded-lg ${
                    selectedModelId === model.id 
                      ? 'bg-blue-100 border-blue-500' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <h3 className="font-medium">{model.name}</h3>
                  <p className="text-sm text-gray-600">{model.client}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Model Management */}
        {selectedModel && (
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">{selectedModel.name}</h2>
              
              {/* Accessories Summary */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Accessories</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedModel.accessoires.map(acc => (
                    <div key={acc.id} className="border p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{acc.name}</span>
                        <span className={`text-sm ${
                          acc.used > acc.total ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {acc.total - acc.used} remaining
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(acc.used / acc.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lotto Creation */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Create New Lotto</h3>
                <input
                  type="text"
                  placeholder="Lotto Name"
                  className="w-full p-2 border rounded mb-4"
                  value={newLotto.name}
                  onChange={e => setNewLotto({ ...newLotto, name: e.target.value })}
                />
                
                <div className="space-y-2">
                  {selectedModel.accessoires.map(acc => (
                    <div key={acc.id} className="flex items-center gap-4">
                      <label className="w-32">{acc.name}</label>
                      <input
                        type="number"
                        min="0"
                        max={acc.total - acc.used}
                        className="p-2 border rounded flex-1"
                        value={newLotto.accessories[acc.id] || 0}
                        onChange={e => setNewLotto({
                          ...newLotto,
                          accessories: {
                            ...newLotto.accessories,
                            [acc.id]: parseInt(e.target.value) || 0
                          }
                        })}
                      />
                      <span className="text-sm text-gray-600">
                        Max: {acc.total - acc.used}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={createLotto}
                  className="mt-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                >
                  Create Lotto
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}