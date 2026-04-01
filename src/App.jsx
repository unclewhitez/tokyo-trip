import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';
import { Wallet, PieChart as PieChartIcon, Train, Coffee, Utensils, Beer, Ticket, CreditCard, Banknote, Calendar, Plus, Trash2, Settings, ListTodo, ReceiptText, ShoppingBag, ShoppingCart, Gift } from 'lucide-react';

// --- ข้อมูลพื้นฐาน ---
const plannedExpensesData = [
  { id: 'p1', day: 'Day 1', category: 'Transport', item: 'Narita to Kuramae', cost: 1350, method: 'Suica' },
  { id: 'p2', day: 'Day 1', category: 'Food', item: 'Lunch + Dinner + Snacks', cost: 3800, method: 'Cash' },
  { id: 'p3', day: 'Day 1', category: 'Coffee', item: 'Morning coffee', cost: 700, method: 'Cash' },
  { id: 'p4', day: 'Day 1', category: 'Beer', item: 'Asahi Sky Room', cost: 1800, method: 'Credit Card' },
  { id: 'p5', day: 'Day 2', category: 'Coffee', item: 'Morning', cost: 700, method: 'Cash' },
  { id: 'p6', day: 'Day 2', category: 'Transport', item: 'Local trains', cost: 510, method: 'Suica' },
  { id: 'p7', day: 'Day 2', category: 'Ticket', item: 'Museum entries', cost: 1400, method: 'Cash' },
  { id: 'p8', day: 'Day 2', category: 'Food', item: 'Meals + snack', cost: 2600, method: 'Cash' },
  { id: 'p9', day: 'Day 2', category: 'Coffee', item: 'Afternoon', cost: 1200, method: 'Cash' },
  { id: 'p10', day: 'Day 2', category: 'Beer', item: 'Craft beer', cost: 4000, method: 'Travel Card' },
  { id: 'p11', day: 'Day 3', category: 'Transport', item: 'Shibuya', cost: 500, method: 'Suica' },
  { id: 'p12', day: 'Day 3', category: 'Food', item: 'Festival + Dinner', cost: 4500, method: 'Cash' },
  { id: 'p13', day: 'Day 3', category: 'Coffee', item: 'Morning', cost: 700, method: 'Cash' },
  { id: 'p14', day: 'Day 3', category: 'Other', item: 'Pre-run snacks', cost: 200, method: 'Suica' },
  { id: 'p15', day: 'Day 4', category: 'Transport', item: 'All day', cost: 630, method: 'Suica' },
  { id: 'p16', day: 'Day 4', category: 'Food', item: 'Meals', cost: 1200, method: 'Cash' },
  { id: 'p17', day: 'Day 4', category: 'Coffee', item: 'Specialty', cost: 1500, method: 'Cash' },
  { id: 'p18', day: 'Day 4', category: 'Activity', item: 'Gachapon', cost: 1200, method: 'Cash' },
  { id: 'p19', day: 'Day 4', category: 'Beer', item: 'Craft beer', cost: 4000, method: 'Travel Card' },
  { id: 'p20', day: 'Day 5', category: 'Transport', item: 'To Narita', cost: 1350, method: 'Suica' },
  { id: 'p21', day: 'Day 5', category: 'Coffee', item: 'Morning', cost: 700, method: 'Cash' }
];

const initialActualExpenses = [
  { id: 1, day: 'Day 1', category: 'Transport', item: 'เติมเงิน Suica ที่นาริตะ', cost: 5000, method: 'Cash' },
  { id: 2, day: 'Day 1', category: 'Food', item: 'ราเมนข้อสอบมื้อแรก', cost: 1500, method: 'Suica' },
  { id: 3, day: 'Day 1', category: 'Coffee', item: 'กาแฟ Blue Bottle', cost: 850, method: 'Travel Card' },
  { id: 4, day: 'Day 1', category: 'Snack', item: 'ขนมและน้ำดื่ม (Lawson/7-11)', cost: 600, method: 'Suica' },
  { id: 5, day: 'Day 2', category: 'Shopping', item: 'เสื้อผ้า Uniqlo', cost: 5500, method: 'Credit Card' },
  { id: 6, day: 'Day 4', category: 'Souvenir', item: 'ขนมของฝากตึกม่วง', cost: 3200, method: 'Travel Card' },
];

const categoryColors = {
  'Food': '#FF8042', 'Snack': '#F472B6', 'Beer': '#FFBB28', 'Coffee': '#00C49F',
  'Transport': '#0088FE', 'Shopping': '#A855F7', 'Souvenir': '#10B981',
  'Activity': '#8884D8', 'Ticket': '#8884D8', 'Other': '#FF6666'
};

const categoryIcons = {
  'Food': Utensils, 'Snack': ShoppingBag, 'Beer': Beer, 'Coffee': Coffee,
  'Transport': Train, 'Shopping': ShoppingCart, 'Souvenir': Gift,
  'Activity': Ticket, 'Ticket': Ticket, 'Other': PieChartIcon
};

const initialPaymentBudgets = {
  'Cash': 40000, 'Suica': 15000, 'Travel Card': 30000, 'Credit Card': 41000
};

const getInitialCategoryBudgets = () => {
  const budgets = {};
  Object.keys(categoryColors).forEach(cat => budgets[cat] = 0);
  plannedExpensesData.forEach(exp => {
    if (budgets[exp.category] !== undefined) budgets[exp.category] += exp.cost;
  });
  return budgets;
};

const formatYen = (value) => `¥${Number(value).toLocaleString()}`;

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [detailsView, setDetailsView] = useState('actual');
  
  // States: ดึงข้อมูลจาก Local Storage หรือใช้ค่าเริ่มต้น
  const [actualExpenses, setActualExpenses] = useState(() => {
    const saved = localStorage.getItem('tokyo_actualExpenses');
    return saved ? JSON.parse(saved) : initialActualExpenses;
  });
  
  const [globalBudget, setGlobalBudget] = useState(() => {
    const saved = localStorage.getItem('tokyo_globalBudget');
    return saved ? JSON.parse(saved) : 60000;
  }); 
  
  const [categoryBudgets, setCategoryBudgets] = useState(() => {
    const saved = localStorage.getItem('tokyo_categoryBudgets');
    return saved ? JSON.parse(saved) : getInitialCategoryBudgets();
  });

  const [paymentBudgets, setPaymentBudgets] = useState(() => {
    const saved = localStorage.getItem('tokyo_paymentBudgets');
    return saved ? JSON.parse(saved) : initialPaymentBudgets;
  });

  const [newExpense, setNewExpense] = useState({
    day: 'Day 1', category: 'Food', item: '', cost: '', method: 'Cash'
  });

  // ระบบ Auto-Save เมื่อมีการแก้ไขข้อมูล
  useEffect(() => { localStorage.setItem('tokyo_actualExpenses', JSON.stringify(actualExpenses)); }, [actualExpenses]);
  useEffect(() => { localStorage.setItem('tokyo_globalBudget', JSON.stringify(globalBudget)); }, [globalBudget]);
  useEffect(() => { localStorage.setItem('tokyo_categoryBudgets', JSON.stringify(categoryBudgets)); }, [categoryBudgets]);
  useEffect(() => { localStorage.setItem('tokyo_paymentBudgets', JSON.stringify(paymentBudgets)); }, [paymentBudgets]);

  // ประมวลผลข้อมูลสำหรับแสดงผล
  const processedData = useMemo(() => {
    let totalActual = 0;
    let totalPlanned = Object.values(categoryBudgets).reduce((sum, val) => sum + val, 0);
    
    const dayStats = {
      'Day 1': { planned: 0, actual: 0 }, 'Day 2': { planned: 0, actual: 0 },
      'Day 3': { planned: 0, actual: 0 }, 'Day 4': { planned: 0, actual: 0 },
      'Day 5': { planned: 0, actual: 0 }
    };
    
    const catStats = Object.keys(categoryColors).reduce((acc, cat) => {
      acc[cat] = { planned: categoryBudgets[cat] || 0, actual: 0, color: categoryColors[cat], icon: categoryIcons[cat] };
      return acc;
    }, {});

    const walletStats = Object.keys(paymentBudgets).reduce((acc, method) => {
      acc[method] = { budget: paymentBudgets[method], actual: 0 };
      return acc;
    }, {});

    plannedExpensesData.forEach(exp => {
      if (dayStats[exp.day]) dayStats[exp.day].planned += Number(exp.cost);
    });

    actualExpenses.forEach(exp => {
      const cost = Number(exp.cost);
      totalActual += cost;
      if (dayStats[exp.day]) dayStats[exp.day].actual += cost;
      if (catStats[exp.category]) catStats[exp.category].actual += cost;
      let method = exp.method === 'Card' ? 'Credit Card' : exp.method;
      if (!walletStats[method]) walletStats[method] = { budget: 0, actual: 0 };
      walletStats[method].actual += cost;
    });

    const dailyDataForChart = Object.keys(dayStats).map(day => ({
      day, planned: dayStats[day].planned, actual: dayStats[day].actual
    }));

    const categoryDataForList = Object.keys(catStats)
      .map(cat => ({ name: cat, ...catStats[cat] }))
      .filter(cat => cat.planned > 0 || cat.actual > 0)
      .sort((a, b) => b.planned - a.planned);

    return { totalPlanned, totalActual, dailyDataForChart, categoryDataForList, walletStats };
  }, [actualExpenses, categoryBudgets, paymentBudgets]);

  const { totalPlanned, totalActual, dailyDataForChart, categoryDataForList, walletStats } = processedData;

  // Handlers
  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!newExpense.item || !newExpense.cost) return;
    const expense = { ...newExpense, id: Date.now(), cost: Number(newExpense.cost) };
    setActualExpenses([...actualExpenses, expense]);
    setNewExpense({ ...newExpense, item: '', cost: '' });
  };

  const handleDeleteActualExpense = (id) => {
    if(window.confirm('ต้องการลบรายการนี้ใช่ไหม?')) {
      setActualExpenses(actualExpenses.filter(e => e.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-4 md:p-8 font-sans pb-20">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header & Navigation */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">โตเกียวทริป Tracker 🗼</h1>
            <p className="text-gray-500 mt-1">เปรียบเทียบ <span className="text-blue-600 font-medium">แผนที่ตั้งไว้</span> กับ <span className="text-rose-500 font-medium">รายจ่ายจริง</span></p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>ภาพรวม</button>
            <button onClick={() => setActiveTab('details')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'details' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>รายละเอียด</button>
            <button onClick={() => setActiveTab('manage')} className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${activeTab === 'manage' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><Settings size={18} /> จัดการข้อมูล</button>
          </div>
        </header>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                <div className="p-3 bg-blue-50 text-blue-500 rounded-xl"><ListTodo size={24} /></div>
                <div><p className="text-sm text-gray-500 font-medium">แผนการใช้จ่ายรวม</p><p className="text-2xl font-bold text-gray-900">{formatYen(totalPlanned)}</p></div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                <div className="p-3 bg-rose-50 text-rose-500 rounded-xl"><ReceiptText size={24} /></div>
                <div><p className="text-sm text-gray-500 font-medium">จ่ายจริงแล้วทั้งหมด</p><p className="text-2xl font-bold text-gray-900">{formatYen(totalActual)}</p></div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                <div className={`p-3 rounded-xl ${totalPlanned - totalActual >= 0 ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}><PieChartIcon size={24} /></div>
                <div><p className="text-sm text-gray-500 font-medium">สถานะเทียบกับแผน</p><p className={`text-2xl font-bold ${totalPlanned - totalActual >= 0 ? 'text-green-600' : 'text-red-600'}`}>{totalPlanned - totalActual >= 0 ? `เหลือ ${formatYen(totalPlanned - totalActual)}` : `เกิน ${formatYen(totalActual - totalPlanned)}`}</p></div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl"><Banknote size={24} /></div>
                <div><p className="text-sm text-gray-500 font-medium">งบประมาณที่เตรียมไว้</p><p className="text-2xl font-bold text-gray-900">{formatYen(globalBudget)}</p></div>
              </div>
            </div>

            {/* Wallet Status */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2"><Wallet size={20} className="text-indigo-500" /> สถานะกระเป๋าเงิน (Wallet Status)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.keys(walletStats).map((method) => {
                  const data = walletStats[method];
                  const percent = data.budget > 0 ? (data.actual / data.budget) * 100 : (data.actual > 0 ? 100 : 0);
                  const isOver = percent > 100;
                  const remaining = data.budget - data.actual;
                  let barColor = 'bg-gray-500'; let icon = <Wallet size={18} />;
                  if (method === 'Cash') { barColor = 'bg-emerald-500'; icon = <Banknote size={18} className="text-emerald-500" />; }
                  if (method === 'Suica') { barColor = 'bg-blue-500'; icon = <Train size={18} className="text-blue-500" />; }
                  if (method.includes('Travel')) { barColor = 'bg-amber-500'; icon = <CreditCard size={18} className="text-amber-500" />; }
                  if (method.includes('Credit')) { barColor = 'bg-purple-500'; icon = <CreditCard size={18} className="text-purple-500" />; }

                  return (
                    <div key={method} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2 font-bold text-gray-800">{icon} {method}</div>
                        <div className="text-right"><p className={`text-sm font-bold ${isOver ? 'text-red-500' : 'text-green-600'}`}>{isOver ? `เกิน ${formatYen(Math.abs(remaining))}` : `เหลือ ${formatYen(remaining)}`}</p></div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2 relative">
                        <div className={`h-2 rounded-full absolute top-0 left-0 transition-all duration-500 ${isOver ? 'bg-red-500' : barColor}`} style={{ width: `${Math.min(percent, 100)}%` }}></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500"><span>จ่าย {formatYen(data.actual)}</span><span>งบ {formatYen(data.budget)}</span></div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-800">เปรียบเทียบรายวัน (Daily)</h3>
                  <div className="flex gap-4 text-sm"><span className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-200 rounded"></div> แผน</span><span className="flex items-center gap-1"><div className="w-3 h-3 bg-rose-500 rounded"></div> จ่ายจริง</span></div>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyDataForChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(val) => `¥${val}`} />
                      <RechartsTooltip cursor={{fill: '#F3F4F6'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value, name) => [formatYen(value), name === 'planned' ? 'ตามแผน' : 'จ่ายจริง']} />
                      <Bar dataKey="planned" fill="#BFDBFE" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      <Bar dataKey="actual" fill="#F43F5E" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-y-auto" style={{ maxHeight: '400px' }}>
                <h3 className="text-lg font-bold text-gray-800 mb-6">สถานะการใช้จ่ายแยกตามหมวดหมู่</h3>
                <div className="space-y-5">
                  {categoryDataForList.map((cat, idx) => {
                    const Icon = cat.icon || PieChartIcon;
                    const percent = cat.planned > 0 ? (cat.actual / cat.planned) * 100 : (cat.actual > 0 ? 100 : 0);
                    return (
                      <div key={idx}>
                        <div className="flex justify-between items-end mb-2">
                          <div className="flex items-center gap-2"><Icon size={18} style={{ color: cat.color }} /><span className="font-medium text-gray-700">{cat.name}</span></div>
                          <div className="text-right"><span className="text-sm font-bold text-gray-900">{formatYen(cat.actual)}</span><span className="text-xs text-gray-400 font-normal ml-1">/ {formatYen(cat.planned)}</span></div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 relative">
                          <div className="h-2.5 rounded-full absolute top-0 left-0 transition-all duration-500" style={{ width: `${Math.min(percent, 100)}%`, backgroundColor: percent > 100 ? '#EF4444' : cat.color }}></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Details */}
        {activeTab === 'details' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-300">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h3 className="text-lg font-bold text-gray-800">รายละเอียดรายการ</h3>
              <div className="flex bg-gray-200 p-1 rounded-lg">
                <button onClick={() => setDetailsView('actual')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${detailsView === 'actual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>รายการจ่ายจริง ({actualExpenses.length})</button>
                <button onClick={() => setDetailsView('planned')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${detailsView === 'planned' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>ตารางตามแผน ({plannedExpensesData.length})</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-white border-b border-gray-100">
                    <th className="py-4 px-6 font-semibold text-sm text-gray-500">วันที่</th>
                    <th className="py-4 px-6 font-semibold text-sm text-gray-500">หมวดหมู่</th>
                    <th className="py-4 px-6 font-semibold text-sm text-gray-500">รายการ</th>
                    <th className="py-4 px-6 font-semibold text-sm text-gray-500">ช่องทางชำระ</th>
                    <th className="py-4 px-6 font-semibold text-sm text-gray-500 text-right">จำนวนเงิน (Yen)</th>
                    {detailsView === 'actual' && <th className="py-4 px-6 font-semibold text-sm text-gray-500 text-center">จัดการ</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(detailsView === 'actual' ? actualExpenses : plannedExpensesData).sort((a,b) => a.day.localeCompare(b.day)).map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-6 text-sm text-gray-900 font-medium">{expense.day}</td>
                      <td className="py-3 px-6 text-sm"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${categoryColors[expense.category] || '#ccc'}20`, color: categoryColors[expense.category] || '#555' }}>{expense.category}</span></td>
                      <td className="py-3 px-6 text-sm text-gray-600">{expense.item}</td>
                      <td className="py-3 px-6 text-sm font-medium text-gray-600">{expense.method}</td>
                      <td className="py-3 px-6 text-sm text-gray-900 font-bold text-right">{formatYen(expense.cost)}</td>
                      {detailsView === 'actual' && (<td className="py-3 px-6 text-sm text-center"><button onClick={() => handleDeleteActualExpense(expense.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={16} /></button></td>)}
                    </tr>
                  ))}
                  {detailsView === 'actual' && actualExpenses.length === 0 && (<tr><td colSpan="6" className="py-8 text-center text-gray-500">ยังไม่มีการบันทึกรายจ่ายจริง</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Manage Data */}
        {activeTab === 'manage' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
            {/* Form: Add */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2"><ReceiptText size={20} className="text-rose-500" /> บันทึก "รายจ่ายจริง"</h3>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">วันที่ใช้จ่าย</label>
                    <select value={newExpense.day} onChange={e => setNewExpense({...newExpense, day: e.target.value})} className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                      {['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'].map(day => <option key={day} value={day}>{day}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่</label>
                    <select value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})} className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                      {Object.keys(categoryColors).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อรายการ</label>
                  <input type="text" required placeholder="เช่น ค่ารถไฟ, ราเมน..." value={newExpense.item} onChange={e => setNewExpense({...newExpense, item: e.target.value})} className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">จำนวนเงิน (Yen)</label>
                    <input type="number" required min="0" placeholder="0" value={newExpense.cost} onChange={e => setNewExpense({...newExpense, cost: e.target.value})} className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ช่องทางชำระ</label>
                    <select value={newExpense.method} onChange={e => setNewExpense({...newExpense, method: e.target.value})} className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-indigo-700 bg-indigo-50">
                      <option value="Cash">💵 เงินสด</option><option value="Suica">🪪 Suica</option><option value="Travel Card">💳 Travel Card</option><option value="Credit Card">💳 Credit Card</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full mt-4 bg-rose-500 hover:bg-rose-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"><Plus size={18} /> เพิ่มรายการจ่ายจริง</button>
              </form>
            </div>

            {/* Forms: Settings */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Wallet size={20} className="text-indigo-500" /> งบประมาณกระเป๋าเงิน</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.keys(paymentBudgets).map(method => (
                    <div key={method}>
                      <label className="block text-sm font-bold text-gray-700 mb-1">{method}</label>
                      <div className="relative"><span className="absolute left-2.5 top-2 text-gray-500 text-sm">¥</span><input type="number" value={paymentBudgets[method] || ''} onChange={e => setPaymentBudgets(prev => ({ ...prev, [method]: Number(e.target.value) }))} className="w-full pl-7 p-1.5 text-sm border border-gray-200 rounded-lg outline-none bg-indigo-50/30"/></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Settings size={20} className="text-gray-500" /> งบประมาณทริปรวม</h3>
                <div className="relative"><span className="absolute left-3 top-2.5 text-gray-500">¥</span><input type="number" value={globalBudget} onChange={e => setGlobalBudget(Number(e.target.value))} className="w-full pl-8 p-2 border border-gray-200 rounded-lg outline-none bg-gray-50"/></div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><PieChartIcon size={20} className="text-purple-500" /> งบประมาณรายหมวดหมู่</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.keys(categoryBudgets).map(cat => {
                    const Icon = categoryIcons[cat];
                    return (
                      <div key={cat}>
                        <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">{Icon && <Icon size={12} style={{ color: categoryColors[cat] }} />} {cat}</label>
                        <div className="relative"><span className="absolute left-2.5 top-2 text-gray-500 text-sm">¥</span><input type="number" value={categoryBudgets[cat] || ''} onChange={e => setCategoryBudgets(prev => ({ ...prev, [cat]: Number(e.target.value) }))} className="w-full pl-7 p-1.5 text-sm border border-gray-200 rounded-lg outline-none"/></div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}