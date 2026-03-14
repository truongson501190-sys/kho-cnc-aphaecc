import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { WarehouseTransaction } from '@/types/inventory';
import { useAuth } from '@/hooks/useAuth';
import { Category, Warehouse, User } from '@/types/categories';

interface ExactLayoutWarehouseImportProps {
  onSubmit: (transaction: Omit<WarehouseTransaction, 'id' | 'createdAt'>) => void;
}

export function ExactLayoutWarehouseImport({ onSubmit }: ExactLayoutWarehouseImportProps) {
  const { currentUser } = useAuth();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  const [formData, setFormData] = useState({
    ngayNhap: new Date().toISOString().split('T')[0],
    chungLoai: '',
    soLuong: '',
    donVi: '',
    donGia: '',
    thanhTien: '0',
    khoNhap: '',
    nguoiNhap: '',
    ghiChu: ''
  });

  const [dataList, setDataList] = useState<any[]>([]);
  const [showFilter, setShowFilter] = useState(false);

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
    
    if (field === 'soLuong' || field === 'donGia') {
      const soLuong = parseFloat(field === 'soLuong' ? value : newData.soLuong) || 0;
      const donGia = parseFloat(field === 'donGia' ? value : newData.donGia) || 0;
      newData.thanhTien = (soLuong * donGia).toString();
    }
    
    setFormData(newData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.chungLoai || !formData.soLuong || !formData.khoNhap) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    const newItem = {
      id: Date.now(),
      ...formData,
      createdAt: new Date().toLocaleString('vi-VN')
    };

    setDataList([...dataList, newItem]);

    const selectedCategory = categories.find(cat => cat.id === formData.chungLoai);
    const transaction: Omit<WarehouseTransaction, 'id' | 'createdAt'> = {
      type: 'import',
      itemId: Date.now().toString(),
      itemName: selectedCategory?.tenChungLoai || formData.chungLoai,
      quantity: parseFloat(formData.soLuong),
      unit: formData.donVi,
      price: parseFloat(formData.donGia) || 0,
      totalValue: parseFloat(formData.thanhTien) || 0,
      toLocation: formData.khoNhap,
      reason: 'Nhập kho',
      referenceNumber: `NK${Date.now()}`,
      operator: currentUser?.name || formData.nguoiNhap,
      status: 'pending',
      transactionDate: formData.ngayNhap,
      notes: formData.ghiChu
    };
    
    onSubmit(transaction);
    toast.success('Đã thêm phiếu nhập kho thành công!');
  };

  return (
    <div className="max-w-7xl mx-auto bg-white">
      {/* Header Lọc Và Chỉnh Sửa */}
      <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">✅ Lọc Và Chỉnh Sửa</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowFilter(!showFilter)}
            className="text-white hover:bg-white/20"
          >
            {showFilter ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showFilter ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
          </Button>
        </div>
      </div>

      {/* Phần Filter - Có thể ẩn/hiện */}
      {showFilter && (
        <div className="bg-gray-50 p-4 border-b">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <Label className="text-sm font-medium">Từ ngày</Label>
              <Input type="date" className="w-full" />
            </div>
            
            <div>
              <Label className="text-sm font-medium">Đến ngày</Label>
              <Input type="date" className="w-full" />
            </div>

            <div>
              <Label className="text-sm font-medium">Chủng loại</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.tenChungLoai}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Kho</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.tenKho}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium">Người dùng</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.hoTen}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Sắp xếp</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Mới nhất" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mới nhất</SelectItem>
                  <SelectItem value="oldest">Cũ nhất</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Hiển thị</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="25 bản ghi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25 bản ghi</SelectItem>
                  <SelectItem value="50">50 bản ghi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm">📋 Đặt lại</Button>
              <Button type="button" variant="outline" size="sm" className="bg-blue-50">📊 Chỉnh sửa</Button>
              <Button type="button" variant="outline" size="sm" className="bg-green-50">📤 Xuất Excel</Button>
            </div>
          </div>

          <div className="text-sm text-gray-600 mt-2">
            Hiển thị {dataList.length} bản ghi
          </div>
        </div>
      )}

      {/* Layout 2 cột: Form bên trái, Bảng bên phải */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {/* Cột trái: Form Phiếu Nhập Kho */}
        <div>
          <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-3 rounded-t-lg">
            <h3 className="text-lg font-semibold">📦 Phiếu Nhập Kho</h3>
            <div className="flex gap-2 mt-2">
              <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-xs">📤 Xuất Excel</Button>
              <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-xs">🖨️ In báo cáo</Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-b-lg space-y-4">
            <div className="text-right text-sm text-gray-500 mb-4">
              Chưa có dữ liệu
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Ngày nhập *</Label>
                <Input
                  type="date"
                  value={formData.ngayNhap}
                  onChange={(e) => handleInputChange('ngayNhap', e.target.value)}
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

              <div>
                <Label className="text-sm font-medium">Kho nhập</Label>
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
              
              <div>
                <Label className="text-sm font-medium">Người nhập</Label>
                <Select value={formData.nguoiNhap} onValueChange={(value) => handleInputChange('nguoiNhap', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn người nhập..." />
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

            <Button 
              type="submit" 
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              ➕ Thêm Phiếu Nhập
            </Button>
          </form>
        </div>

        {/* Cột phải: Bảng hiển thị dữ liệu */}
        <div>
          <div className="bg-white border rounded-lg">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Danh sách phiếu nhập</h3>
            </div>
            
            <div className="p-4">
              {dataList.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>Chưa có dữ liệu</p>
                  <p className="text-sm mt-2">Nhập thông tin vào form bên trái để hiển thị dữ liệu</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dataList.map((item, index) => (
                    <div key={item.id} className="bg-gray-50 p-3 rounded border">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><strong>STT:</strong> {index + 1}</div>
                        <div><strong>Ngày:</strong> {item.ngayNhap}</div>
                        <div><strong>Chủng loại:</strong> {categories.find(cat => cat.id === item.chungLoai)?.tenChungLoai || item.chungLoai}</div>
                        <div><strong>Số lượng:</strong> {item.soLuong} {item.donVi}</div>
                        <div><strong>Đơn giá:</strong> {Number(item.donGia).toLocaleString('vi-VN')} VND</div>
                        <div><strong>Thành tiền:</strong> {Number(item.thanhTien).toLocaleString('vi-VN')} VND</div>
                        <div><strong>Kho nhập:</strong> {item.khoNhap}</div>
                        <div><strong>Người nhập:</strong> {item.nguoiNhap}</div>
                        {item.ghiChu && (
                          <div className="col-span-2"><strong>Ghi chú:</strong> {item.ghiChu}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}