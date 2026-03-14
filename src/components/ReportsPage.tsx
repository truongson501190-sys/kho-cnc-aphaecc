import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  Factory, 
  Calendar,
  Download,
  Filter,
  Eye,
  Plus
} from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { WarehouseTransaction } from '@/types/inventory';

interface ReportsPageProps {
  warehouseTransactions: WarehouseTransaction[];
}

export function ReportsPage({ warehouseTransactions }: ReportsPageProps) {
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: new Date().toISOString().split('T')[0]
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Filter data based on selected criteria
  const filteredWarehouseTransactions = useMemo(() => {
    return warehouseTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.transactionDate);
      const startDate = dateFilter.startDate ? new Date(dateFilter.startDate) : null;
      const endDate = dateFilter.endDate ? new Date(dateFilter.endDate) : null;

      const dateMatch = (!startDate || transactionDate >= startDate) && 
                       (!endDate || transactionDate <= endDate);
      const typeMatch = typeFilter === 'all' || transaction.type === typeFilter;

      return dateMatch && typeMatch;
    });
  }, [warehouseTransactions, dateFilter, typeFilter]);

  // Calculate statistics
  const warehouseStats = useMemo(() => {
    const transactions = filteredWarehouseTransactions;
    const totalValue = transactions.reduce((sum, t) => sum + (t.totalValue || 0), 0);
    
    return {
      totalTransactions: transactions.length,
      totalValue,
      imports: transactions.filter(t => t.type === 'import').length,
      exports: transactions.filter(t => t.type === 'export').length,
      transfers: transactions.filter(t => t.type === 'transfer').length,
      oilExports: transactions.filter(t => t.type === 'oil_export').length,
    };
  }, [filteredWarehouseTransactions]);

  // Group data by date for trends
  const warehouseTrends = useMemo(() => {
    const grouped = filteredWarehouseTransactions.reduce((acc, transaction) => {
      const date = transaction.transactionDate;
      if (!acc[date]) {
        acc[date] = { date, count: 0, value: 0 };
      }
      acc[date].count++;
      acc[date].value += transaction.totalValue || 0;
      return acc;
    }, {} as Record<string, { date: string; count: number; value: number }>);
    const arr = Object.values(grouped) as { date: string; count: number; value: number }[];
    return arr.sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredWarehouseTransactions]);

  const handleExportData = () => {
    const data = {
      warehouseTransactions: filteredWarehouseTransactions,
      exportDate: new Date().toISOString(),
      filters: { dateFilter, typeFilter }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bao-cao-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Báo Cáo Tổng Hợp
          </CardTitle>

          <div className="flex items-center gap-2">
            <Button onClick={handleExportData} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Xuất dữ liệu
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Bộ Lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="startDate">Từ ngày</Label>
              <Input
                id="startDate"
                type="date"
                value={dateFilter.startDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Đến ngày</Label>
              <Input
                id="endDate"
                type="date"
                value={dateFilter.endDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="typeFilter">Loại giao dịch kho</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="import">Nhập kho</SelectItem>
                  <SelectItem value="export">Xuất kho</SelectItem>
                  <SelectItem value="transfer">Chuyển kho</SelectItem>
                  <SelectItem value="oil_export">Xuất dầu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleExportData} className="w-full flex items-center gap-2">
                <Download className="w-4 h-4" />
                Xuất dữ liệu
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="warehouse">Kho hàng</TabsTrigger>
          <TabsTrigger value="trends">Xu hướng</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Tổng giao dịch kho</p>
                    <p className="text-3xl font-bold">{warehouseStats.totalTransactions}</p>
                  </div>
                  <Package className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Nhập kho</p>
                    <p className="text-3xl font-bold">{warehouseStats.imports}</p>
                  </div>
                  <Package className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Giá trị kho</p>
                    <p className="text-2xl font-bold">{warehouseStats.totalValue.toLocaleString('vi-VN')}</p>
                    <p className="text-purple-100 text-xs">VND</p>
                  </div>
                  <Package className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Warehouse Details */}
        <TabsContent value="warehouse" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-700">
                  Thống kê theo loại
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Nhập kho:</span>
                  <Badge variant="default">{warehouseStats.imports}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Xuất kho:</span>
                  <Badge variant="destructive">{warehouseStats.exports}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Chuyển kho:</span>
                  <Badge variant="secondary">{warehouseStats.transfers}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Xuất dầu:</span>
                  <Badge variant="outline">{warehouseStats.oilExports}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-700">
                  Giao dịch gần đây
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {filteredWarehouseTransactions.slice(-10).reverse().map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{transaction.itemName}</p>
                        <p className="text-sm text-gray-600">
                          {transaction.quantity} {transaction.unit}
                        </p>
                        <p className="text-xs text-gray-500">{transaction.transactionDate}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          transaction.type === 'import' ? 'default' : 
                          transaction.type === 'export' ? 'destructive' : 
                          transaction.type === 'transfer' ? 'secondary' : 'outline'
                        }>
                          {transaction.type === 'import' ? 'Nhập' : 
                           transaction.type === 'export' ? 'Xuất' : 
                           transaction.type === 'transfer' ? 'Chuyển' : 'Xuất dầu'}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          {transaction.totalValue?.toLocaleString('vi-VN')} VND
                        </p>
                      </div>
                    </div>
                  ))}
                  {filteredWarehouseTransactions.length === 0 && (
                    <p className="text-center text-gray-500 py-4">Không có dữ liệu</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-700">
                  Xu hướng kho hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {warehouseTrends.map((trend) => (
                    <div key={trend.date} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium">{new Date(trend.date).toLocaleDateString('vi-VN')}</p>
                        <p className="text-sm text-gray-600">{trend.count} giao dịch</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          {trend.value.toLocaleString('vi-VN')}
                        </p>
                        <p className="text-xs text-gray-500">VND</p>
                      </div>
                    </div>
                  ))}
                  {warehouseTrends.length === 0 && (
                    <p className="text-center text-gray-500 py-4">Không có dữ liệu</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}