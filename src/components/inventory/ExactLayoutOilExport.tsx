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
import { Category, Machine, User } from '@/types/categories';

interface ExactLayoutOilExportProps {
  onSubmit: (transaction: Omit<WarehouseTransaction, 'id' | 'createdAt'>) => void;
}

export function ExactLayoutOilExport({ onSubmit }: ExactLayoutOilExportProps) {
  const { currentUser } = useAuth();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  const [formData, setFormData] = useState({
    ngayXuat: new Date().toISOString().split('T')[0],
    loaiDau: '',
    soLuong: '',
    donVi: '',
    donGia: '',
    thanhTien: '0',
    mayMoc: '',
    nguoiVanHanh: '',
    ghiChu: ''
  });

  const [dataList, setDataList] = useState<any[]>([]);
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      // Load categories - ONLY oil-related from localStorage, NO default data
      const savedCategories = localStorage.getItem('categoryTypes');
      if (savedCategories) {
        const parsedCategories = JSON.parse(savedCategories);
        if (Array.isArray(parsedCategories) && parsedCategories.length > 0) {
          // Filter only oil-related categories
          setCategories(parsedCategories.filter(cat => 
            cat.tenChungLoai.toLowerCase().includes('dầu') || 
            cat.tenChungLoai.toLowerCase().includes('oil') ||
            cat.tenChungLoai.toLowerCase().includes('mỡ')
          ));
        }
      }

      // Load machines - ONLY from localStorage, NO default data
      const savedMachines = localStorage.getItem('machines');
      if (savedMachines) {
        const parsedMachines = JSON.parse(savedMachines);
        if (Array.isArray(parsedMachines) && parsedMachines.length > 0) {
          setMachines(parsedMachines);
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
    if (field === 'loaiDau') {
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
    
    if (!formData.loaiDau || !formData.soLuong || !formData.mayMoc) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    const newItem = {
      id: Date.now(),
      ...formData,
      createdAt: new Date().toLocaleString('vi-VN')
    };

    setDataList([...dataList, newItem]);

    const selectedCategory = categories.find(cat => cat.id === formData.loaiDau);
    const selectedMachine = machines.find(machine => machine.id === formData.mayMoc);
    
    const transaction: Omit<WarehouseTransaction, 'id' | 'createdAt'> = {
      type: 'oil_export',
      itemId: Date.now().toString(),
      itemName: selectedCategory?.tenChungLoai || formData.loaiDau,
      quantity: parseFloat(formData.soLuong),
      unit: formData.donVi,
      price: parseFloat(formData.donGia) || 0,
      totalValue: parseFloat(formData.thanhTien) || 0,
      reason: `Xuất dầu cho máy ${selectedMachine?.tenMay || formData.mayMoc}`,
      referenceNumber: `DM${Date.now()}`,
      operator: currentUser?.name || formData.nguoiVanHanh,
      status: 'pending',
      transactionDate: formData.ngayXuat,
      notes: formData.ghiChu,
      machineId: formData.mayMoc
    };
    
    onSubmit(transaction);
    toast.success('Đã thêm phiếu xuất dầu thành công!');
  };

  return (
    <div className="max-w-7xl mx-auto bg-white">
      {/* Header Lọc Và Chỉnh Sửa */}
      <div className="bg-gradient-to-r from-orange-400 to-yellow-500 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">🛢️ Phiếu Xuất Dầu Mỡ</h2>
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
              <Label className="text-sm font-medium">Loại dầu</Label>
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
              <Label className="text-sm font-medium">Máy móc</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {machines.map((machine) => (
                    <SelectItem key={machine.id} value={machine.id}>
                      {machine.tenMay}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-sm text-gray-600 mt-2">
            Hiển thị {dataList.length} bản ghi
          </div>
        </div>
      )}

      {/* Layout 2 cột: Form bên trái, Bảng bên phải */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {/* Cột trái: Form Phiếu Xuất Dầu */}
        <div>
          <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white p-3 rounded-t-lg">
            <h3 className="text-lg font-semibold">🛢️ Phiếu Xuất Dầu Mỡ</h3>
          </div>

          <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-b-lg space-y-4">
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Ngày xuất *</Label>
                <Input
                  type="date"
                  value={formData.ngayXuat}
                  onChange={(e) => handleInputChange('ngayXuat', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium">Loại dầu *</Label>
                <Select value={formData.loaiDau} onValueChange={(value) => handleInputChange('loaiDau', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại dầu..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length === 0 ? (
                      <div className="p-2 text-sm text-gray-500">Chưa có loại dầu nào. Vui lòng thêm trong Quản lý danh mục.</div>
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
                  placeholder="Tự động điền khi chọn loại dầu"
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
                  placeholder="Tự động điền khi chọn loại dầu"
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
                <Label className="text-sm font-medium">Máy móc *</Label>
                <Select value={formData.mayMoc} onValueChange={(value) => handleInputChange('mayMoc', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn máy móc..." />
                  </SelectTrigger>
                  <SelectContent>
                    {machines.length === 0 ? (
                      <div className="p-2 text-sm text-gray-500">Chưa có máy móc nào. Vui lòng thêm trong Quản lý danh mục.</div>
                    ) : (
                      machines.map((machine) => (
                        <SelectItem key={machine.id} value={machine.id}>
                          {machine.tenMay} ({machine.maMay})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Người vận hành</Label>
                <Select value={formData.nguoiVanHanh} onValueChange={(value) => handleInputChange('nguoiVanHanh', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn người vận hành..." />
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
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              🛢️ Thêm Phiếu Xuất Dầu
            </Button>
          </form>
        </div>

        {/* Cột phải: Bảng hiển thị dữ liệu */}
        <div>
          <div className="bg-white border rounded-lg">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Danh sách phiếu xuất dầu</h3>
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
                        <div><strong>Ngày:</strong> {item.ngayXuat}</div>
                        <div><strong>Loại dầu:</strong> {categories.find(cat => cat.id === item.loaiDau)?.tenChungLoai || item.loaiDau}</div>
                        <div><strong>Số lượng:</strong> {item.soLuong} {item.donVi}</div>
                        <div><strong>Đơn giá:</strong> {Number(item.donGia).toLocaleString('vi-VN')} VND</div>
                        <div><strong>Thành tiền:</strong> {Number(item.thanhTien).toLocaleString('vi-VN')} VND</div>
                        <div><strong>Máy móc:</strong> {machines.find(machine => machine.id === item.mayMoc)?.tenMay || item.mayMoc}</div>
                        <div><strong>Người vận hành:</strong> {item.nguoiVanHanh}</div>
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