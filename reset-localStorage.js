reset-localStorage.js
// Reset all localStorage data and create fresh data
console.log('🗑️ Clearing all localStorage...');
localStorage.clear();

// Create fresh users data
const users = [
  {
    msnv: 'ADM001',
    fullName: 'Nguyễn Văn Admin',
    department: 'Admin',
    position: 'Quản trị viên hệ thống',
    role: 'Admin',
    status: 'active',
    permissions: {
      'kho-tong': { view: true, add: true, edit: true, delete: true, approve: true, export: true },
      'kho-co-khi': { view: true, add: true, edit: true, delete: true, approve: true, export: true },
      'kho-cnc': { view: true, add: true, edit: true, delete: true, approve: true, export: true },
      'kho-dau': { view: true, add: true, edit: true, delete: true, approve: true, export: true },
      'bao-cao-tong-hop': { view: true, add: true, edit: true, delete: true, approve: true, export: true }
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    msnv: 'CNC001',
    fullName: 'Trần Văn Công',
    department: 'Tổ CNC',
    position: 'Thợ CNC',
    role: 'User',
    status: 'active',
    permissions: {
      'kho-tong': { view: false, add: false, edit: false, delete: false, approve: false, export: false },
      'kho-co-khi': { view: false, add: false, edit: false, delete: false, approve: false, export: false },
      'kho-cnc': { view: false, add: false, edit: false, delete: false, approve: false, export: false },
      'kho-dau': { view: false, add: false, edit: false, delete: false, approve: false, export: false },
      'bao-cao-tong-hop': { view: false, add: false, edit: false, delete: false, approve: false, export: false }
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Create userRecords for authentication
const userRecords = [
  {
    id: '1',
    msnv: 'ADM001',
    fullName: 'Nguyễn Văn Admin',
    department: 'Admin',
    position: 'Quản trị viên hệ thống',
    role: 'Admin',
    status: true,
    passwordHash: btoa('admin123'),
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    msnv: 'CNC001',
    fullName: 'Trần Văn Công',
    department: 'Tổ CNC',
    position: 'Thợ CNC',
    role: 'User',
    status: true,
    passwordHash: btoa('123456'),
    createdAt: new Date().toISOString()
  }
];

localStorage.setItem('users', JSON.stringify(users));
localStorage.setItem('userRecords', JSON.stringify(userRecords));

console.log('✅ Fresh data created!');
console.log('🔑 Test accounts:');
console.log('- ADM001 / admin123');
console.log('- CNC001 / 123456');

// Test login function
function testLogin(msnv, password) {
  console.log(`🔐 Testing login: ${msnv} / ${password}`);
  
  const userRecords = JSON.parse(localStorage.getItem('userRecords') || '[]');
  const foundUser = userRecords.find(u => u.msnv === msnv && u.status === true);
  
  if (foundUser) {
    const expectedPassword = atob(foundUser.passwordHash);
    if (password === expectedPassword) {
      console.log(`✅ Login SUCCESS for ${msnv}`);
      return true;
    } else {
      console.log(`❌ Wrong password. Expected: ${expectedPassword}, Got: ${password}`);
    }
  } else {
    console.log(`❌ User not found or inactive: ${msnv}`);
  }
  return false;
}

// Test both accounts
testLogin('ADM001', 'admin123');
testLogin('CNC001', '123456');
