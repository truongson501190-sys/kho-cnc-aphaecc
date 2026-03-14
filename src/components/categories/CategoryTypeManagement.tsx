import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { Category } from '@/types/categories';

export function CategoryTypeManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    tenChungLoai: '',
    donVi: '',
    gia: 0,
    ghiChu: ''
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    try {
      const saved = localStorage.getItem('categoryTypes');
      if (saved) {
        setCategories(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const saveCategories = (updatedCategories: Category[]) => {
    setCategories(updatedCategories);
    localStorage.setItem('categoryTypes', JSON.stringify(updatedCategories));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCategory) {
      const updatedCategories = categories.map(category =>
        category.id === editingCategory.id
          ? { ...category, ...formData }
          : category
      );
      saveCategories(updatedCategories);
    } else {
      const newCategory: Category = {
        id: Date.now().toString(),
          ...formData,
        createdAt: new Date().toISOString()
      };
      saveCategories([...categories, newCategory]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      tenChungLoai: '',
      donVi: '',
      gia: 0,
      ghiChu: ''
    });
    setEditingCategory(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      tenChungLoai: category.tenChungLoai,
      donVi: category.donVi,
      gia: category.gia,
      ghiChu: category.ghiChu ?? ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa chủng loại này?')) {
      const updatedCategories = categories.filter(category => category.id !== id);
      saveCategories(updatedCategories);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Package className="w-6 h-6 text-purple-600" />
            Quản Lý Chủng Loại
          </h2>
          <p className="text-gray-600 mt-1">Quản lý chủng loại sản phẩm, đơn vị và giá</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Thêm Chủng Loại Mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Chỉnh Sửa Chủng Loại' : 'Thêm Chủng Loại Mới'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="tenChungLoai">Tên Chủng Loại *</Label>
                <Input
                  id="tenChungLoai"
                  value={formData.tenChungLoai}
                  onChange={(e) => setFormData({...formData, tenChungLoai: e.target.value})}
                  placeholder="Nhập tên chủng loại"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="donVi">Đơn Vị *</Label>
                <Input
                  id="donVi"
                  value={formData.donVi}
                  onChange={(e) => setFormData({...formData, donVi: e.target.value})}
                  placeholder="VD: kg, m, cái, lít..."
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="gia">Giá (VND) *</Label>
                <Input
                  id="gia"
                  type="number"
                  value={formData.gia}
                  onChange={(e) => setFormData({...formData, gia: Number(e.target.value)})}
                  placeholder="Nhập giá"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="ghiChu">Ghi Chú</Label>
                <Textarea
                  id="ghiChu"
                  value={formData.ghiChu}
                  onChange={(e) => setFormData({...formData, ghiChu: e.target.value})}
                  placeholder="Nhập ghi chú (tùy chọn)"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Hủy
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                  {editingCategory ? 'Cập Nhật' : 'Thêm Chủng Loại'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Danh Sách Chủng Loại</span>
            <Badge variant="secondary">{categories.length} chủng loại</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên Chủng Loại</TableHead>
                  <TableHead>Đơn Vị</TableHead>
                  <TableHead>Giá</TableHead>
                  <TableHead>Ghi Chú</TableHead>
                  <TableHead>Ngày Tạo</TableHead>
                  <TableHead className="text-right">Thao Tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Chưa có chủng loại nào. Nhấn "Thêm Chủng Loại Mới" để bắt đầu.
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.tenChungLoai}</TableCell>
                      <TableCell>{category.donVi}</TableCell>
                      <TableCell>{formatCurrency(category.gia)}</TableCell>
                      <TableCell className="max-w-xs truncate">{category.ghiChu ?? ''}</TableCell>
                      <TableCell>{new Date(category.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(category)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(category.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}