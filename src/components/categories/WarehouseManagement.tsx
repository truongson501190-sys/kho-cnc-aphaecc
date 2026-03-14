import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Search, Plus, Edit2, Trash2, Package } from 'lucide-react';
import { Warehouse } from '@/types/categories';

export function WarehouseManagement() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    tenKho: '',
    ghiChu: ''
  });

  useEffect(() => {
    loadWarehouses();
  }, []);

  const loadWarehouses = () => {
    try {
      const saved = localStorage.getItem('warehouses');
      if (saved) {
        setWarehouses(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading warehouses:', error);
    }
  };

  const saveWarehouses = (newWarehouses: Warehouse[]) => {
    try {
      localStorage.setItem('warehouses', JSON.stringify(newWarehouses));
      setWarehouses(newWarehouses);
    } catch (error) {
      console.error('Error saving warehouses:', error);
      toast.error('Lỗi khi lưu dữ liệu');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.tenKho.trim()) {
      toast.error('Vui lòng điền tên kho');
      return;
    }

    if (editingId) {
      // Update existing warehouse
      const updatedWarehouses = warehouses.map(warehouse =>
        warehouse.id === editingId
          ? { ...warehouse, ...formData }
          : warehouse
      );
      saveWarehouses(updatedWarehouses);
      toast.success('Đã cập nhật kho thành công');
      setEditingId(null);
    } else {
      // Add new warehouse
      const newWarehouse: Warehouse = {
        id: Date.now().toString(),
        tenKho: formData.tenKho.trim(),
        ghiChu: formData.ghiChu.trim(),
        createdAt: new Date().toISOString()
      };
      saveWarehouses([...warehouses, newWarehouse]);
      toast.success('Đã thêm kho mới thành công');
    }

    // Reset form
    setFormData({
      tenKho: '',
      ghiChu: ''
    });
  };

  const handleEdit = (warehouse: Warehouse) => {
    setFormData({
      tenKho: warehouse.tenKho,
      ghiChu: warehouse.ghiChu || ''
    });
    setEditingId(warehouse.id);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa kho này?')) {
      const updatedWarehouses = warehouses.filter(warehouse => warehouse.id !== id);
      saveWarehouses(updatedWarehouses);
      toast.success('Đã xóa kho thành công');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      tenKho: '',
      ghiChu: ''
    });
  };

  const filteredWarehouses = warehouses.filter(warehouse =>
    warehouse.tenKho.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (warehouse.ghiChu && warehouse.ghiChu.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý Kho</h2>
          <p className="text-gray-600">Quản lý thông tin các kho hàng trong hệ thống</p>
        </div>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          <Package className="w-4 h-4 mr-1" />
          {warehouses.length} kho
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form thêm/sửa kho */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                {editingId ? 'Chỉnh sửa kho' : 'Thêm kho mới'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="tenKho">Tên kho *</Label>
                  <Input
                    id="tenKho"
                    value={formData.tenKho}
                    onChange={(e) => setFormData({ ...formData, tenKho: e.target.value })}
                    placeholder="Nhập tên kho"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="ghiChu">Ghi chú</Label>
                  <Textarea
                    id="ghiChu"
                    value={formData.ghiChu}
                    onChange={(e) => setFormData({ ...formData, ghiChu: e.target.value })}
                    placeholder="Nhập ghi chú (tùy chọn)"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingId ? 'Cập nhật' : 'Thêm kho'}
                  </Button>
                  {editingId && (
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Hủy
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Danh sách kho */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Danh sách kho</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Tìm kiếm kho..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredWarehouses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {warehouses.length === 0 ? (
                    <>
                      <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Chưa có kho nào</p>
                      <p className="text-sm">Thêm kho đầu tiên để bắt đầu</p>
                    </>
                  ) : (
                    <p>Không tìm thấy kho phù hợp</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredWarehouses.map((warehouse) => (
                    <div
                      key={warehouse.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{warehouse.tenKho}</h3>
                        {warehouse.ghiChu && (
                          <p className="text-sm text-gray-500">
                            {warehouse.ghiChu}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(warehouse)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(warehouse.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}