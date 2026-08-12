import React, { useState, useEffect } from 'react';
import { MOCK_CATALOG_ITEMS, MockCatalogItem } from '../../../mocks/data';
import { NewTicketModal } from '../components/NewTicketModal';
import { apiClient } from '../../../lib/api-client';

export default function ClientCatalogPage() {
  const [selectedItem, setSelectedItem] = useState<MockCatalogItem | null>(null);
  const [catalogItems, setCatalogItems] = useState<MockCatalogItem[]>(MOCK_CATALOG_ITEMS);

  useEffect(() => {
    apiClient.get('/catalog/items')
      .then((items: any[]) => {
        if (Array.isArray(items) && items.length > 0) {
          const mapped: MockCatalogItem[] = items.map((i: any) => ({
            id: i.id,
            name: i.name,
            category: i.category_name || i.category || 'Geral',
            description: i.description || '',
            icon: i.icon || '🛠️',
            slaAmount: i.sla_amount || 2,
            slaType: i.sla_type || 'days',
          }));
          setCatalogItems(mapped);
        }
      })
      .catch(() => console.info('[Catálogo] API offline, exibindo catálogo local.'));
  }, []);

  // Group items by category
  const groupedItems = catalogItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MockCatalogItem[]>);


  return (
    <div className="space-y-6">
      {selectedItem && (
        <NewTicketModal
          initialTitle={selectedItem.name}
          initialCategory={selectedItem.category}
          initialType="Solicitação"
          onClose={() => setSelectedItem(null)}
        />
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">Catálogo de Serviços</h1>
        <p className="text-slate-500 dark:text-slate-400">Solicite serviços de TI de forma rápida e organizada.</p>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category}>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">{category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="group flex flex-col items-start text-left p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200 hover:-translate-y-[1.5px] active:translate-y-[0.5px]"
                >
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">{item.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{item.description}</p>
                  
                  <div className="mt-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700/50 text-xs font-medium text-slate-600 dark:text-slate-300">
                    SLA: {item.slaAmount} {item.slaType === 'days' ? (item.slaAmount === 1 ? 'dia' : 'dias') : (item.slaAmount === 1 ? 'hora' : 'horas')}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
