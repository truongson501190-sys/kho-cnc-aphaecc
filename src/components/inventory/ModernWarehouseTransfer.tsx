import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Trash2, ArrowRightLeft, Printer, Save, AlertTriangle } from 'lucide-react';
import { WarehouseTransaction, InventoryItem, WarehouseLocation } from '@/types/inventory';
import { useAuth } from '@/hooks/useAuth';

interface TransferItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  availableStock: number;
  price: number;
  totalValue: number;
}

interface ModernWarehouseTransferProps {
  onSubmit: (transaction: Omit<WarehouseTransaction, 'id' | 'createdAt'>) => void;
}

export function ModernWarehouseTransfer({ onSubmit }: ModernWarehouseTransferProps) {
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    referenceNumber: `CK${new Date().getFullYear()}${String(Date.now()).slice(-6)}`,
    transactionDate: new Date().toISOString().split('T')[0],
    fromLocation: '',
    toLocation: '',
    reason: 'Chuyển kho nội bộ',
    transportMethod: 'Xe nâng',
    receiverName: '',
    notes: '',
  });

  const [transferItems, setTransferItems] = useState<TransferItem[]>([
    { itemId: '', itemName: '', quantity: 0, unit: '', availableStock: 0, price: 0, totalValue: 0 }
  ]);

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [locations, setLocations] = useState<WarehouseLocation[]>([]);

  useEffect(() => {
    try {
      const savedItems = localStorage.getItem('inventoryItems');
      if (savedItems) {
        setInventoryItems(JSON.parse(savedItems));
      }

      const savedLocations = localStorage.getItem('warehouseLocations');
      if (savedLocations) {
        setLocations(JSON.parse(savedLocations));
      } else {
        const defaultLocations: WarehouseLocation[] = [
          { id: '1', name: 'Kho nguyên liệu A', code: 'WH-A', type: 'warehouse', isActive: true, createdAt: new Date().toISOString() },
          { id: '2', name: 'Kho thành phẩm B', code: 'WH-B', type: 'warehouse', isActive: true, createdAt: new Date().toISOString() },
          { id: '3', name: 'Kho phụ tùng C', code: 'WH-C', type: 'warehouse', isActive: true, createdAt: new Date().toISOString() },
          { id: '4', name: 'Kho dầu mỡ D', code: 'WH-D', type: 'warehouse', isActive: true, createdAt: new Date().toISOString() }
        ];
        setLocations(defaultLocations);
        localStorage.setItem('warehouseLocations', JSON.stringify(defaultLocations));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTransferItem = () => {
    setTransferItems(prev => [...prev, { itemId: '', itemName: '', quantity: 0, unit: '', availableStock: 0, price: 0, totalValue: 0 }]);
  };

  const removeTransferItem = (index: number) => {
    setTransferItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateTransferItem = (index: number, field: keyof TransferItem, value: string | number) => {
    setTransferItems(prev => prev.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value };
        
        if (field === 'itemId' && typeof value === 'string') {
          const selectedItem = inventoryItems.find(inv => inv.id === value);
          if (selectedItem) {
            updatedItem.itemName = selectedItem.name;
            updatedItem.unit = selectedItem.unit;
            updatedItem.availableStock = selectedItem.currentStock;
            updatedItem.price = selectedItem.price;
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

  const getTotalValue = () => transferItems.reduce((sum, item) => sum + item.totalValue, 0);
  const hasStockIssues = () => transferItems.some(item => item.quantity > item.availableStock && item.itemId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!formData.fromLocation || !formData.toLocation || !formData.receiverName) {
        toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }

      if (formData.fromLocation === formData.toLocation) {
        toast.error('Kho xuất và kho nhập không thể giống nhau');
        return;
      }

      const validItems = transferItems.filter(item => item.itemId && item.quantity > 0);
      if (validItems.length === 0) {
        toast.error('Vui lòng thêm ít nhất một mặt hàng');
        return;
      }

      const stockIssues = validItems.filter(item => item.quantity > item.availableStock);
      if (stockIssues.length > 0) {
        toast.error(`Không đủ tồn kho cho: ${stockIssues.map(item => item.itemName).join(', ')}`);
        return;
      }

      validItems.forEach(item => {
        const transaction: Omit<WarehouseTransaction, 'id' | 'createdAt'> = {
          type: 'transfer',
          itemId: item.itemId,
          itemName: item.itemName,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price,
          totalValue: item.totalValue,
          fromLocation: formData.fromLocation,
          toLocation: formData.toLocation,
          reason: `${formData.reason} - Người nhận: ${formData.receiverName}`,
          referenceNumber: formData.referenceNumber,
          operator: currentUser?.name || '',
          status: 'pending',
          transactionDate: formData.transactionDate,
          notes: `Phương tiện: ${formData.transportMethod}. ${formData.notes}`
        };
        
        onSubmit(transaction);
      });

      // Reset form
      setFormData({
        referenceNumber: `CK${new Date().getFullYear()}${String(Date.now()).slice(-6)}`,
        transactionDate: new Date().toISOString().split('T')[0],
        fromLocation: '', toLocation: '', reason: 'Chuyển kho nội bộ', 
        transportMethod: 'Xe nâng', receiverName: '', notes: '',
      });
      setTransferItems([{ itemId: '', itemName: '', quantity: 0, unit: '', availableStock: 0, price: 0, totalValue: 0 }]);

      toast.success('Đã tạo phiếu chuyển kho thành công!');
    } catch (error) {
      console.error('Error creating transfer:', error);
      toast.error('Lỗi khi tạo phiếu chuyển kho');
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white">
      {/* Header */}
      <div className="text-center border-b-2 border-gray-300 pb-4 mb-6 print:mb-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">CÔNG TY TNHH SẢN XUẤT ABC</h1>
        <p className="text-gray-600">Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM | ĐT: (028) 1234-5678</p>
        <div className="mt-4">
          <h2 className="text-xl font-bold text-purple-600 uppercase">PHIẾU CHUYỂN KHO</h2>
          <p className="text-sm text-gray-500">Warehouse Transfer Receipt</p>
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
              className="font-mono font-bold text-purple-600"
              required
            />
          </div>
          <div>
            <Label className="font-semibold">Ngày chuyển / Date</Label>
            <Input
              type="date"
              value={formData.transactionDate}
              onChange={(e) => handleInputChange('transactionDate', e.target.value)}
              required
            />
          </div>
          <div>
            <Label className="font-semibold">Người lập phiếu / Created by</Label>
            <Input
              value={currentUser?.name || ''}
              readOnly
              className="bg-gray-100 font-semibold"
            />
          </div>
        </div>

        {/* Transfer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-300 p-4 rounded">
          <div>
            <Label className="font-semibold">Kho xuất / From Warehouse *</Label>
            <Select value={formData.fromLocation} onValueChange={(value) => handleInputChange('fromLocation', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn kho xuất" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name} ({location.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="font-semibold">Kho nhập / To Warehouse *</Label>
            <Select value={formData.toLocation} onValueChange={(value) => handleInputChange('toLocation', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn kho nhập" />
              </SelectTrigger>
              <SelectContent>
                {locations.filter(loc => loc.id !== formData.fromLocation).map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name} ({location.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="font-semibold">Người nhận / Receiver *</Label>
            <Input
              value={formData.receiverName}
              onChange={(e) => handleInputChange('receiverName', e.target.value)}
              placeholder="Tên người nhận hàng"
              required
            />
          </div>
          <div>
            <Label className="font-semibold">Phương tiện vận chuyển / Transport</Label>
            <Select value={formData.transportMethod} onValueChange={(value) => handleInputChange('transportMethod', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Xe nâng">Xe nâng</SelectItem>
                <SelectItem value="Xe đẩy">Xe đẩy</SelectItem>
                <SelectItem value="Cần cẩu">Cần cẩu</SelectItem>
                <SelectItem value="Thủ công">Thủ công</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stock Warning */}
        {hasStockIssues() && (
          <div className="bg-red-50 border border-red-200 p-4 rounded flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-red-700 font-medium">Cảnh báo: Một số mặt hàng vượt quá tồn kho!</span>
          </div>
        )}

        {/* Items Table */}
        <div className="border border-gray-300 rounded">
          <div className="bg-gray-100 p-3 border-b border-gray-300">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-700">DANH SÁCH HÀNG HÓA CHUYỂN / TRANSFER ITEMS LIST</h3>
              <Button type="button" variant="outline" size="sm" onClick={addTransferItem}>
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
                  <th className="p-2 text-left font-semibold text-sm">TÊN HÀNG HÓA</th>
                  <th className="p-2 text-center font-semibold text-sm">TỒN KHO</th>
                  <th className="p-2 text-center font-semibold text-sm">SỐ LƯỢNG</th>
                  <th className="p-2 text-center font-semibold text-sm">ĐVT</th>
                  <th className="p-2 text-right font-semibold text-sm">ĐƠN GIÁ</th>
                  <th className="p-2 text-right font-semibold text-sm">THÀNH TIỀN</th>
                  <th className="p-2 text-center font-semibold text-sm print:hidden">THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {transferItems.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="p-2 text-center font-mono">{String(index + 1).padStart(2, '0')}</td>
                    <td className="p-2">
                      <Select 
                        value={item.itemId} 
                        onValueChange={(value) => updateTransferItem(index, 'itemId', value)}
                      >
                        <SelectTrigger className="border-0 shadow-none">
                          <SelectValue placeholder="Chọn hàng hóa" />
                        </SelectTrigger>
                        <SelectContent>
                          {inventoryItems.map((invItem) => (
                            <SelectItem key={invItem.id} value={invItem.id}>
                              {invItem.name} ({invItem.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-2 text-center">
                      <span className={`font-mono font-semibold ${
                        item.quantity > item.availableStock && item.itemId ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {item.availableStock}
                      </span>
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateTransferItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className={`text-center border-0 shadow-none ${
                          item.quantity > item.availableStock && item.itemId ? 'bg-red-50 text-red-600' : ''
                        }`}
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
                        onChange={(e) => updateTransferItem(index, 'price', parseFloat(e.target.value) || 0)}
                        className="text-right border-0 shadow-none font-mono"
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="p-2 text-right font-mono font-semibold">
                      {item.totalValue.toLocaleString('vi-VN')}
                    </td>
                    <td className="p-2 text-center print:hidden">
                      {transferItems.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTransferItem(index)}
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
                  <td colSpan={6} className="p-3 text-right font-bold">TỔNG GIÁ TRỊ / TOTAL VALUE:</td>
                  <td className="p-3 text-right font-bold text-lg font-mono text-purple-600">
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
            placeholder="Ghi chú thêm về việc chuyển kho..."
            rows={3}
            className="mt-2"
          />
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-4 gap-6 text-center mt-8 print:mt-12">
          <div>
            <p className="font-semibold mb-16">NGƯỜI LẬP PHIẾU</p>
            <p className="border-t border-gray-400 pt-2">{currentUser?.name}</p>
          </div>
          <div>
            <p className="font-semibold mb-16">THỦ KHO XUẤT</p>
            <p className="border-t border-gray-400 pt-2">................................</p>
          </div>
          <div>
            <p className="font-semibold mb-16">THỦ KHO NHẬP</p>
            <p className="border-t border-gray-400 pt-2">................................</p>
          </div>
          <div>
            <p className="font-semibold mb-16">NGƯỜI NHẬN</p>
            <p className="border-t border-gray-400 pt-2">{formData.receiverName}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8 print:hidden">
          <Button 
            type="submit" 
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-lg py-3"
            disabled={hasStockIssues()}
          >
            <Save className="w-5 h-5 mr-2" />
            Lưu Phiếu Chuyển Kho
          </Button>
          <Button type="button" variant="outline" onClick={() => window.print()} className="px-8">
            <Printer className="w-5 h-5 mr-2" />
            In Phiếu
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              setFormData({
                referenceNumber: `CK${new Date().getFullYear()}${String(Date.now()).slice(-6)}`,
                transactionDate: new Date().toISOString().split('T')[0],
                fromLocation: '', toLocation: '', reason: 'Chuyển kho nội bộ', 
                transportMethod: 'Xe nâng', receiverName: '', notes: '',
              });
              setTransferItems([{ itemId: '', itemName: '', quantity: 0, unit: '', availableStock: 0, price: 0, totalValue: 0 }]);
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