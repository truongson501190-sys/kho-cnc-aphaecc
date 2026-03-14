import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export const QuanLyDanhMuc: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Quản Lý Danh Mục</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Chức năng Quản Lý Danh Mục
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chức năng đang phát triển
            </h3>
            <p className="text-gray-500">
              Tính năng quản lý danh mục sẽ được triển khai trong phiên bản tiếp theo.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};