import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Trash2, Package, FileText, Printer, Save } from 'lucide-react';
import { WarehouseTransaction } from '@/types/inventory';
import { useAuth } from '@/hooks/useAuth';
import { Category, Machine, User } from '@/types/categories';

interface OilExportItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  price: number;
  totalValue: number;
  machineId: string;
  machineName: string;
}

interface ModernOilExportProps {
  onSubmit: (transaction: Omit<WarehouseTransaction, 'id' | 'createdAt'>) => void;
}

export function ModernOilExport({ onSubmit }: ModernOilExportProps) {
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    referenceNumber: `DM${new Date().getFullYear()}${String(Date.now()).slice(-6)}`,
    transactionDate: new Date().toISOString().split('T')[0],
    operator: '',
    reason: 'Xuất dầu cho máy móc',
    notes: '',
    status: 'draft' as const,
  });

  const [oilExportItems, setOilExportItems] = useState<OilExportItem[]>([
    { itemId: '', itemName: '', quantity: 0, unit: '', price: 0, totalValue: 0, machineId: '', machineName: '' }
  ]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Load data from localStorage only - NO default data
    try {
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

      const savedMachines = localStorage.getItem('machines');
      if (savedMachines) {
        const parsedMachines = JSON.parse(savedMachines);
        if (Array.isArray(parsedMachines) && parsedMachines.length > 0) {
          setMachines(parsedMachines);
        }
      }

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
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addOilExportItem = () => {
    setOilExportItems(prev => [...prev, { itemId: '', itemName: '', quantity: 0, unit: '', price: 0, totalValue: 0, machineId: '', machineName: '' }]);
  };

  const removeOilExportItem = (index: number) => {
    setOilExportItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateOilExportItem = (index: number, field: keyof OilExportItem, value: string | number) => {
    setOilExportItems(prev => prev.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value };
        
        if (field === 'itemId' && typeof value === 'string') {
          const selectedCategory = categories.find(cat => cat.id === value);
          if (selectedCategory) {
            updatedItem.itemName = selectedCategory.tenChungLoai;
            updatedItem.unit = selectedCategory.donVi;
            updatedItem.price = selectedCategory.gia;
          }
        }

        if (field === 'machineId' && typeof value === 'string') {
          const selectedMachine = machines.find(machine => machine.id === value);
          if (selectedMachine) {
            updatedItem.machineName = selectedMachine.tenMay;
          }
        }
        
        if (field === 'quantity' || field === 'price') {
          updatedItem.totalValue = updatedItem.quantity * updatedItem.price;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const getTotalValue = () => oilExportItems.reduce((sum, item) => sum + item.totalValue, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!formData.operator) {
        toast.error('Vui lòng chọn người vận hành');
        return;
      }

      const validItems = oilExportItems.filter(item => item.itemId && item.quantity > 0 && item.machineId);
      if (validItems.length === 0) {
        toast.error('Vui lòng thêm ít nhất một mặt hàng với máy móc');
        return;
      }

      validItems.forEach(item => {
        const transaction: Omit<WarehouseTransaction, 'id' | 'createdAt'> = {
          type: 'oil_export',
          itemId: item.itemId,
          itemName: item.itemName,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price,
          totalValue: item.totalValue,
          reason: `${formData.reason} - Máy: ${item.machineName}`,
          referenceNumber: formData.referenceNumber,
          operator: formData.operator,
          status: 'pending',
          transactionDate: formData.transactionDate,
          notes: formData.notes,
          machineId: item.machineId
        };
        
        onSubmit(transaction);
      });

      // Reset form
      setFormData({
        referenceNumber: `DM${new Date().getFullYear()}${String(Date.now()).slice(-6)}`,
        transactionDate: new Date().toISOString().split('T')[0],
        operator: '', reason: 'Xuất dầu cho máy móc', notes: '', status: 'draft',
      });
      setOilExportItems([{ itemId: '', itemName: '', quantity: 0, unit: '', price: 0, totalValue: 0, machineId: '', machineName: '' }]);

      toast.success('Đã tạo phiếu xuất dầu thành công!');
    } catch (error) {
      console.error('Error creating oil export:', error);
      toast.error('Lỗi khi tạo phiếu xuất dầu');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto bg-white">
      {/* Header - Company Info */}
      <div className="text-center border-b-2 border-gray-300 pb-4 mb-6 print:mb-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">CÔNG TY TNHH SẢN XUẤT ABC</h1>
        <p className="text-gray-600">Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM | ĐT: (028) 1234-5678</p>
        <div className="mt-4">
          <h2 className="text-xl font-bold text-orange-600 uppercase">PHIẾU XUẤT DẦU MỠ</h2>
          <p className="text-sm text-gray-500">Oil Export Receipt</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Document Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-gray-300 p-4 rounded">
          <div>
            <Label className="font-semibold">Số phiếu / Receipt No.</Label>
            <Input
              value={formData.referenceNumber}
              onChange={(e) => handleInputChange('referenceNumber', e.target.value)}
              className="font-mono font-bold text-orange-600"
              required
            />
          </div>
          <div>
            <Label className="font-semibold">Ngày xuất / Date</Label>
            <Input
              type="date"
              value={formData.transactionDate}
              onChange={(e) => handleInputChange('transactionDate', e.target.value)}
              required
            />
          </div>
          <div>
            <Label className="font-semibold">Người vận hành / Operator</Label>
            <Select value={formData.operator} onValueChange={(value) => handleInputChange('operator', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn người vận hành" />
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
        </div>

        {/* Items Table */}
        <div className="border border-gray-300 rounded">
          <div className="bg-gray-100 p-3 border-b border-gray-300">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-700">DANH SÁCH DẦU MỠ / OIL LIST</h3>
              <Button type="button" variant="outline" size="sm" onClick={addOilExportItem}>
                <Plus size={16} className="mr-1" />
                Thêm dòng
              </Button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-300">
                  <th className="p-2 text-left font-semibold text-sm">STT</th>
                  <th className="p-2 text-left font-semibold text-sm">LOẠI DẦU</th>
                  <th className="p-2 text-left font-semibold text-sm">MÁY MÓC</th>
                  <th className="p-2 text-center font-semibold text-sm">SỐ LƯỢNG</th>
                  <th className="p-2 text-center font-semibold text-sm">ĐVT</th>
                  <th className="p-2 text-right font-semibold text-sm">ĐƠN GIÁ</th>
                  <th className="p-2 text-right font-semibold text-sm">THÀNH TIỀN</th>
                  <th className="p-2 text-center font-semibold text-sm print:hidden">THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {oilExportItems.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="p-2 text-center font-mono">{String(index + 1).padStart(2, '0')}</td>
                    <td className="p-2">
                      <Select 
                        value={item.itemId} 
                        onValueChange={(value) => updateOilExportItem(index, 'itemId', value)}
                      >
                        <SelectTrigger className="border-0 shadow-none">
                          <SelectValue placeholder="Chọn loại dầu" />
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
                    </td>
                    <td className="p-2">
                      <Select 
                        value={item.machineId} 
                        onValueChange={(value) => updateOilExportItem(index, 'machineId', value)}
                      >
                        <SelectTrigger className="border-0 shadow-none">
                          <SelectValue placeholder="Chọn máy móc" />
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
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateOilExportItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="text-center border-0 shadow-none"
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <span className="text-sm font-mono">{item.unit}</span>
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        value={item.price}
                        onChange={(e) => updateOilExportItem(index, 'price', parseFloat(e.target.value) || 0)}
                        className="text-right border-0 shadow-none font-mono"
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="p-2 text-right font-mono font-semibold">
                      {item.totalValue.toLocaleString('vi-VN')}
                    </td>
                    <td className="p-2 text-center print:hidden">
                      {oilExportItems.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOilExportItem(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {/* Total Row */}
                <tr className="bg-gray-50 border-t-2 border-gray-400">
                  <td colSpan={6} className="p-3 text-right font-bold">TỔNG CỘNG / TOTAL:</td>
                  <td className="p-3 text-right font-bold text-lg font-mono text-orange-600">
                    {getTotalValue().toLocaleString('vi-VN')} VND
                  </td>
                  <td className="print:hidden"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes */}
        <div className="border border-gray-300 p-4 rounded">
          <Label className="font-semibold">Ghi chú / Notes</Label>
          <Textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Ghi chú thêm về phiếu xuất dầu..."
            rows={3}
            className="mt-2"
          />
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-3 gap-8 text-center mt-8 print:mt-12">
          <div>
            <p className="font-semibold mb-16">NGƯỜI LẬP PHIẾU</p>
            <p className="border-t border-gray-400 pt-2">{currentUser?.name}</p>
          </div>
          <div>
            <p className="font-semibold mb-16">THỦ KHO</p>
            <p className="border-t border-gray-400 pt-2">................................</p>
          </div>
          <div>
            <p className="font-semibold mb-16">NGƯỜI VẬN HÀNH</p>
            <p className="border-t border-gray-400 pt-2">{formData.operator}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8 print:hidden">
          <Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700 text-lg py-3">
            <Save className="w-5 h-5 mr-2" />
            Lưu Phiếu Xuất Dầu
          </Button>
          <Button type="button" variant="outline" onClick={handlePrint} className="px-8">
            <Printer className="w-5 h-5 mr-2" />
            In Phiếu
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              setFormData({
                referenceNumber: `DM${new Date().getFullYear()}${String(Date.now()).slice(-6)}`,
                transactionDate: new Date().toISOString().split('T')[0],
                operator: '', reason: 'Xuất dầu cho máy móc', notes: '', status: 'draft',
              });
              setOilExportItems([{ itemId: '', itemName: '', quantity: 0, unit: '', price: 0, totalValue: 0, machineId: '', machineName: '' }]);
            }}
            className="px-8"
          >
            Làm mới
          </Button>
        </div>
      </form>

      {/* Print Styles */}
      <style>{`
          @media print {
          body { font-size: 12px; }
          .print\\:hidden { display: none !important; }
          .print\\:mb-4 { margin-bottom: 1rem !important; }
          .print\\:mt-12 { margin-top: 3rem !important; }
          table { page-break-inside: avoid; }
          tr { page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}