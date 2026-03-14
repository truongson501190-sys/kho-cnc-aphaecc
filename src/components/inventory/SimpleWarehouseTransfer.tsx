import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { WarehouseTransaction } from '@/types/inventory';
import { useAuth } from '@/hooks/useAuth';
import { Category, Warehouse, User } from '@/types/categories';

interface SimpleWarehouseTransferProps {
  onSubmit: (transaction: Omit<WarehouseTransaction, 'id' | 'createdAt'>) => void;
}

export function SimpleWarehouseTransfer({ onSubmit }: SimpleWarehouseTransferProps) {
  const { currentUser } = useAuth();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  const [formData, setFormData] = useState({
    ngayChuyenKho: new Date().toISOString().split('T')[0],
    chungLoai: '',
    soLuong: '',
    donVi: '',
    donGia: '',
    thanhTien: '0',
    khoXuat: '',
    khoNhap: '',
    nguoiChuyenKho: '',
    ghiChu: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      // Load categories - ONLY from localStorage, NO default data
      const savedCategories = localStorage.getItem('categoryTypes');
      if (savedCategories) {
        const parsedCategories = JSON.parse(savedCategories);
        if (Array.isArray(parsedCategories) && parsedCategories.length > 0) {
          setCategories(parsedCategories);
        }
      }

      // Load warehouses - ONLY from localStorage, NO default data
      const savedWarehouses = localStorage.getItem('warehouses');
      if (savedWarehouses) {
        const parsedWarehouses = JSON.parse(savedWarehouses);
        if (Array.isArray(parsedWarehouses) && parsedWarehouses.length > 0) {
          setWarehouses(parsedWarehouses);
        }
      }

      // Load users - ONLY from localStorage, NO default data
      const savedUsers = localStorage.getItem('users');
      if (savedUsers) {
        const parsedUsers = JSON.parse(savedUsers);
        if (Array.isArray(parsedUsers) && parsedUsers.length > 0) {
          setUsers(parsedUsers);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    
    // Auto-fill related fields when category is selected
    if (field === 'chungLoai') {
      const selectedCategory = categories.find(cat => cat.id === value);
      if (selectedCategory) {
        newData.donVi = selectedCategory.donVi;
        newData.donGia = selectedCategory.gia.toString();
      }
    }
    
    // Tự động tính thành tiền
    if (field === 'soLuong' || field === 'donGia') {
      const soLuong = parseFloat(field === 'soLuong' ? value : newData.soLuong) || 0;
      const donGia = parseFloat(field === 'donGia' ? value : newData.donGia) || 0;
      newData.thanhTien = (soLuong * donGia).toString();
    }
    
    setFormData(newData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.chungLoai || !formData.soLuong || !formData.khoXuat || !formData.khoNhap) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (formData.khoXuat === formData.khoNhap) {
      toast.error('Kho xuất và kho nhập không được giống nhau');
      return;
    }

    const selectedCategory = categories.find(cat => cat.id === formData.chungLoai);
    const transaction: Omit<WarehouseTransaction, 'id' | 'createdAt'> = {
      type: 'transfer',
      itemId: Date.now().toString(),
      itemName: selectedCategory?.tenChungLoai || formData.chungLoai,
      quantity: parseFloat(formData.soLuong),
      unit: formData.donVi,
      price: parseFloat(formData.donGia) || 0,
      totalValue: parseFloat(formData.thanhTien) || 0,
      fromLocation: formData.khoXuat,
      toLocation: formData.khoNhap,
      reason: 'Chuyển kho',
      referenceNumber: `CK${Date.now()}`,
      operator: currentUser?.name || formData.nguoiChuyenKho,
      status: 'pending',
      transactionDate: formData.ngayChuyenKho,
      notes: formData.ghiChu
    };
    
    onSubmit(transaction);
    
    // Reset form
    setFormData({
      ngayChuyenKho: new Date().toISOString().split('T')[0],
      chungLoai: '', soLuong: '', donVi: '', donGia: '', thanhTien: '0',
      khoXuat: '', khoNhap: '', nguoiChuyenKho: '', ghiChu: ''
    });

    toast.success('Đã tạo phiếu chuyển kho thành công!');
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-t-lg">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          🔄 Phiếu Chuyển Kho
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="bg-gray-50 p-6 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Ngày chuyển kho *</Label>
              <Input
                type="date"
                value={formData.ngayChuyenKho}
                onChange={(e) => handleInputChange('ngayChuyenKho', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium">Chủng loại *</Label>
              <Select value={formData.chungLoai} onValueChange={(value) => handleInputChange('chungLoai', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn chủng loại sản phẩm..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500">Chưa có chủng loại nào. Vui lòng thêm trong Quản lý danh mục.</div>
                  ) : (
                    categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.tenChungLoai}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Số lượng *</Label>
              <Input
                type="number"
                value={formData.soLuong}
                onChange={(e) => handleInputChange('soLuong', e.target.value)}
                placeholder="Nhập số lượng"
                min="0"
                step="0.01"
                required
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium">Đơn vị *</Label>
              <Input
                value={formData.donVi}
                onChange={(e) => handleInputChange('donVi', e.target.value)}
                placeholder="Tự động điền khi chọn chủng loại"
                readOnly
                className="bg-gray-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Đơn giá (VND) *</Label>
              <Input
                type="number"
                value={formData.donGia}
                onChange={(e) => handleInputChange('donGia', e.target.value)}
                placeholder="Tự động điền khi chọn chủng loại"
                min="0"
                step="0.01"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium">Thành tiền (VND)</Label>
              <Input
                value={formData.thanhTien}
                readOnly
                className="bg-gray-100"
                placeholder="0 VND"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Kho xuất *</Label>
              <Select value={formData.khoXuat} onValueChange={(value) => handleInputChange('khoXuat', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn kho xuất" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500">Chưa có kho nào. Vui lòng thêm trong Quản lý danh mục.</div>
                  ) : (
                    warehouses.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.tenKho}>
                        {warehouse.tenKho} ({warehouse.loaiKho})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Kho nhập *</Label>
              <Select value={formData.khoNhap} onValueChange={(value) => handleInputChange('khoNhap', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn kho nhập" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500">Chưa có kho nào. Vui lòng thêm trong Quản lý danh mục.</div>
                  ) : (
                    warehouses.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.tenKho}>
                        {warehouse.tenKho} ({warehouse.loaiKho})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Người chuyển kho</Label>
            <Select value={formData.nguoiChuyenKho} onValueChange={(value) => handleInputChange('nguoiChuyenKho', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn người chuyển kho..." />
              </SelectTrigger>
              <SelectContent>
                {users.length === 0 ? (
                  <div className="p-2 text-sm text-gray-500">Chưa có người dùng nào. Vui lòng thêm trong Quản lý danh mục.</div>
                ) : (
                  users.map((user) => (
                    <SelectItem key={user.id} value={user.hoTen}>
                      {user.hoTen} - {user.msnv}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">Ghi chú</Label>
            <Textarea
              value={formData.ghiChu}
              onChange={(e) => handleInputChange('ghiChu', e.target.value)}
              placeholder="Ghi chú thêm (tùy chọn)"
              rows={3}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button 
            type="submit" 
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 rounded-md"
          >
            🔄 Thêm Phiếu Chuyển Kho
          </Button>
        </div>
      </form>
    </div>
  );
}