import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Settings, Package, Warehouse } from 'lucide-react';
import { CategoryTypeManagement } from './CategoryTypeManagement';
import { WarehouseManagement } from './WarehouseManagement';

export function CategoryManagementTabs() {
  const [activeTab, setActiveTab] = useState('categories');

  const tabs = [
    {
      id: 'categories',
      label: 'Chủng Loại',
      icon: Package,
      color: 'text-purple-600',
      component: CategoryTypeManagement
    },
    {
      id: 'warehouses',
      label: 'Kho',
      icon: Warehouse,
      color: 'text-orange-600',
      component: WarehouseManagement
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Quản Lý Danh Mục
        </h1>
        <p className="text-gray-600">
          Quản lý danh mục hàng hóa và thiết bị trong hệ thống CNC-CK
        </p>
      </div>

      {/* Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Danh Mục Hệ Thống
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <Icon className={`w-4 h-4 ${tab.color}`} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {tabs.map((tab) => {
              const Component = tab.component;
              return (
                <TabsContent key={tab.id} value={tab.id} className="mt-0">
                  <Component />
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Card key={tab.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab(tab.id)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{tab.label}</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <Icon className={`w-8 h-8 ${tab.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}