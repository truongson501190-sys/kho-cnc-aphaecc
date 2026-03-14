import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRightLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from "../components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type TransferVoucher = {
  id: string;
  voucherNo: string;
  from: string;
  to: string;
  createdAt: string;
  status: 'draft' | 'sent' | 'completed';
};

const SAMPLE_VOUCHERS: TransferVoucher[] = [
  { id: '1', voucherNo: 'TK-0001', from: 'Kho A', to: 'Kho B', createdAt: new Date().toISOString(), status: 'completed' },
  { id: '2', voucherNo: 'TK-0002', from: 'Kho B', to: 'Kho C', createdAt: new Date().toISOString(), status: 'sent' },
  { id: '3', voucherNo: 'TK-0003', from: 'Kho A', to: 'Kho C', createdAt: new Date().toISOString(), status: 'draft' },
];

export const ChuyenKho: React.FC = () => {
  const [vouchers, setVouchers] = useState<TransferVoucher[]>([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  useEffect(() => {
    // Load from localStorage if present, otherwise seed sample data
    const raw = localStorage.getItem('transferVouchers');
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as TransferVoucher[];
        setVouchers(parsed);
      } catch (e) {
        setVouchers(SAMPLE_VOUCHERS);
        localStorage.setItem('transferVouchers', JSON.stringify(SAMPLE_VOUCHERS));
      }
    } else {
      setVouchers(SAMPLE_VOUCHERS);
      localStorage.setItem('transferVouchers', JSON.stringify(SAMPLE_VOUCHERS));
    }
  }, []);

  const filtered = useMemo(() => {
    let list = vouchers;

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(v =>
        v.voucherNo.toLowerCase().includes(q) ||
        v.from.toLowerCase().includes(q) ||
        v.to.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      list = list.filter(v => v.status === statusFilter);
    }

    if (fromDate) {
      const f = new Date(fromDate).getTime();
      list = list.filter(v => new Date(v.createdAt).getTime() >= f);
    }

    if (toDate) {
      const t = new Date(toDate).getTime() + 24 * 60 * 60 * 1000 - 1;
      list = list.filter(v => new Date(v.createdAt).getTime() <= t);
    }

    return list;
  }, [query, vouchers]);

  const handleCreate = () => {
    const next: TransferVoucher = {
      id: Date.now().toString(),
      voucherNo: `TK-${(Math.random() * 9000 + 1000) | 0}`,
      from: 'Kho A',
      to: 'Kho B',
      createdAt: new Date().toISOString(),
      status: 'draft',
    };
    const nextList = [next, ...vouchers];
    setVouchers(nextList);
    localStorage.setItem('transferVouchers', JSON.stringify(nextList));
  };

  const handleDelete = (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa phiếu này không?')) return;
    const next = vouchers.filter(v => v.id !== id);
    setVouchers(next);
    localStorage.setItem('transferVouchers', JSON.stringify(next));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Chuyển Kho</h1>
        <div className="flex items-center gap-3">
          <Input placeholder="Tìm theo Mã phiếu / Kho" value={query} onChange={e => setQuery(e.target.value)} className="w-72" />
          <select className="rounded-md border px-3 py-2" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="completed">Completed</option>
          </select>
          <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="w-40" />
          <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="w-40" />
          <Button onClick={handleCreate} size="sm">Tạo phiếu mới</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5" />
            Danh sách phiếu chuyển kho
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <ArrowRightLeft className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy phiếu nào</h3>
              <p className="text-gray-500">Thử thay đổi từ khóa tìm kiếm hoặc tạo phiếu mới.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <tr>
                  <TableHead>Mã phiếu</TableHead>
                  <TableHead>Kho xuất</TableHead>
                  <TableHead>Kho nhận</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Hành động</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {filtered.map(v => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{v.voucherNo}</TableCell>
                    <TableCell>{v.from}</TableCell>
                    <TableCell>{v.to}</TableCell>
                    <TableCell>{new Date(v.createdAt).toLocaleString()}</TableCell>
                    <TableCell className="capitalize">
                      <span className={
                        `inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          v.status === 'completed' ? 'bg-green-100 text-green-800' : v.status === 'sent' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                        }`
                      }>{v.status}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => alert('Xem phiếu: ' + v.voucherNo)}>Xem</Button>
                        <Button size="sm" onClick={() => alert('Chức năng chỉnh sửa chưa triển khai')}>Sửa</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(v.id)}>Xóa</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};