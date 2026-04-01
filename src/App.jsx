import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Wallet, PieChart as PieChartIcon, Train, Coffee, Utensils, Beer, Ticket, CreditCard, 
  Banknote, Calendar, Plus, Trash2, Settings, ListTodo, ReceiptText, ShoppingBag, 
  ShoppingCart, Gift, Moon, Sun, Calculator, Map as MapIcon, ExternalLink, MapPin
} from 'lucide-react';

// --- ข้อมูลแผนการเดินทางตั้งต้น (ค่า Default กรณีเข้าครั้งแรก) ---
const defaultPlannedExpensesData = [
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
];

const initialActualExpenses = [
  { id: 1, day: 'Day 1', category: 'Transport', item: 'เติมเงิน Suica ที่นาริตะ', cost: 5000, method: 'Cash' },
  { id: 2, day: 'Day 1', category: 'Food', item: 'ราเมนข้อสอบมื้อแรก', cost: 1500, method: 'Suica' },
  { id: 3, day: 'Day 1', category: 'Coffee', item: 'กาแฟ Blue Bottle', cost: 850, method: 'Travel Card' },
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

// --- ข้อมูลแพลนเที่ยว (Itinerary) แก้ไขรายละเอียดแต่ละวันตรงนี้ได้เลย ---
// **แนะนำ: ถ้าวันไหนดังรายละเอียดเยอะ สามารถเติม { time: '...', desc: '...' } ไปเรื่อยๆ ได้เลยครับ**
const tripItinerary = [
  {
    day: 'Day 1', date: 'พฤหัสบดีที่ 7 พฤษภาคม', title: 'Arrival & Asakusa',
    details: [
      { time: '08:00', desc: '✈️ เดินทางถึงสนามบินนาริตะ (Narita Airport)' },
      { time: '10:00', desc: '🚆 นั่งรถไฟเข้าเมือง ไปลงที่ Kuramae' },
      { time: '11:00', desc: '🏨 ฝากกระเป๋าที่ APA Hotel Asakusa Kuramae' },
      { time: '12:00', desc: '🍜 มื้อเที่ยง: Homemade Noodles Billiken' },
      { time: '14:00', desc: '☕ เดินเล่นคาเฟ่ย่าน Kuramae' },
      { time: '18:00', desc: '🍻 ดื่มเบียร์ Asahi Sky Room' }
    ]
  },
  {
    day: 'Day 2', date: 'ศุกร์ที่ 8 พฤษภาคม', title: 'Senso-ji & Chill',
    details: [
      { time: '09:00', desc: '🏮 ไหว้พระวัด Senso-ji (Asakusa)' },
      { time: '11:00', desc: '📸 เดินถ่ายรูปริมแม่น้ำ Sumida' },
      { time: '13:00', desc: '🍣 มื้อเที่ยงแถวอาซากุสะ' },
      { time: '15:00', desc: '🚶‍♂️ กลับมาเดินเล่นย่าน Kuramae (ร้านเครื่องเขียน/ของกุ๊กกิ๊ก)' },
      { time: '19:00', desc: '🍺 มื้อเย็น: ร้านปิ้งย่าง Isomaru Suisan' }
    ]
  },
  {
    day: 'Day 3', date: 'เสาร์ที่ 9 พฤษภาคม', title: 'Ueno Shopping',
    details: [
      { time: '09:30', desc: '🌳 เดินเล่นรับลมสวน Ueno' },
      { time: '11:00', desc: '🛍️ ลุยตลาด Ameyoko' },
      { time: '13:00', desc: '🍛 มื้อเที่ยงแถวอูเอโนะ' },
      { time: '15:00', desc: '🛍️ ช้อปปิ้งของฝาก/ขนม ตึกม่วง Takeya' },
      { time: '18:30', desc: '🍺 ดื่มเบียร์เย็นๆ ที่ Kirin City Ueno' }
    ]
  },
  {
    day: 'Day 4', date: 'อาทิตย์ที่ 10 พฤษภาคม', title: 'Shrine & Akihabara',
    details: [
      { time: '09:00', desc: '⛩️ ไหว้พระเสริมดวงการงาน (ศาลเจ้า Kanda Myojin)' },
      { time: '11:30', desc: '🎮 ลุยดงอากิฮาบาระ (Akihabara)' },
      { time: '14:00', desc: '⌨️ แวะดู Custom Keyboard ร้าน Yusha Kobo' },
      { time: '16:00', desc: '🕹️ แวะตึก Gachapon / เกมเซ็นเตอร์' }
    ]
  },
  {
    day: 'Day 5', date: 'จันทร์ที่ 11 พฤษภาคม', title: 'Free Day / Departure',
    details: [
      { time: '09:00', desc: '☕ จิบกาแฟชิลๆ ส่งท้าย' },
      { time: '10:30', desc: '🎒 เช็คเอาท์ออกจากโรงแรม' },
      { time: '11:30', desc: '🛍️ เก็บตกของฝากรอบสุดท้าย' },
      { time: '14:00', desc: '🚆 นั่งรถไฟกลับสนามบินนาริตะ' },
      { time: '17:00', desc: '🛫 เดินทางกลับไทย ปลอดภัย!' }
    ]
  }
];

const formatYen = (value) => `¥${Number(value).toLocaleString()}`;
const formatBaht = (value) => `฿${Number(value).toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [detailsView, setDetailsView] = useState('actual');
  const [entryType, setEntryType] = useState('actual'); 
  const [selectedPlanDay, setSelectedPlanDay] = useState('Day 1'); // State สำหรับ Tab ใน Day Plan
  
  // --- States: จำนวนวันเดินทาง (Dynamic Days) ---
  const [tripDays, setTripDays] = useState(() => {
    return Number(localStorage.getItem('tokyo_tripDays')) || 5;
  });

  // --- States: Dark Mode ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('tokyo_theme') === 'dark';
  });

  // --- States: เครื่องคิดเลขแปลงเงิน ---
  const [exchangeRate, setExchangeRate] = useState(() => Number(localStorage.getItem('tokyo_exchangeRate')) || 0.225);
  const [calcYen, setCalcYen] = useState('');

  // --- States: ดึงข้อมูลจาก Local Storage ---
  const [plannedExpenses, setPlannedExpenses] = useState(() => {
    const saved = localStorage.getItem('tokyo_plannedExpenses');
    return saved ? JSON.parse(saved) : defaultPlannedExpensesData;
  });

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
    if (saved) return JSON.parse(saved);
    const budgets = {};
    Object.keys(categoryColors).forEach(cat => budgets[cat] = 0);
    defaultPlannedExpensesData.forEach(exp => { if (budgets[exp.category] !== undefined) budgets[exp.category] += exp.cost; });
    return budgets;
  });

  const [paymentBudgets, setPaymentBudgets] = useState(() => {
    const saved = localStorage.getItem('tokyo_paymentBudgets');
    return saved ? JSON.parse(saved) : initialPaymentBudgets;
  });

  const [newExpense, setNewExpense] = useState({
    day: 'Day 1', category: 'Food', item: '', cost: '', method: 'Cash'
  });

  // --- Auto-Save ---
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('tokyo_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => { localStorage.setItem('tokyo_tripDays', tripDays); }, [tripDays]);
  useEffect(() => { localStorage.setItem('tokyo_plannedExpenses', JSON.stringify(plannedExpenses)); }, [plannedExpenses]);
  useEffect(() => { localStorage.setItem('tokyo_actualExpenses', JSON.stringify(actualExpenses)); }, [actualExpenses]);
  useEffect(() => { localStorage.setItem('tokyo_globalBudget', JSON.stringify(globalBudget)); }, [globalBudget]);
  useEffect(() => { localStorage.setItem('tokyo_categoryBudgets', JSON.stringify(categoryBudgets)); }, [categoryBudgets]);
  useEffect(() => { localStorage.setItem('tokyo_paymentBudgets', JSON.stringify(paymentBudgets)); }, [paymentBudgets]);
  useEffect(() => { localStorage.setItem('tokyo_exchangeRate', exchangeRate); }, [exchangeRate]);

  // --- ประมวลผลข้อมูล ---
  const processedData = useMemo(() => {
    let totalActual = 0;
    let totalPlanned = Object.values(categoryBudgets).reduce((sum, val) => sum + val, 0);
    
    const dayStats = {};
    for (let i = 1; i <= tripDays; i++) {
      dayStats[`Day ${i}`] = { planned: 0, actual: 0 };
    }
    
    const catStats = Object.keys(categoryColors).reduce((acc, cat) => {
      acc[cat] = { planned: categoryBudgets[cat] || 0, actual: 0, color: categoryColors[cat], icon: categoryIcons[cat] };
      return acc;
    }, {});

    const walletStats = Object.keys(paymentBudgets).reduce((acc, method) => {
      acc[method] = { budget: paymentBudgets[method], actual: 0 };
      return acc;
    }, {});

    plannedExpenses.forEach(exp => {
      if (!dayStats[exp.day]) dayStats[exp.day] = { planned: 0, actual: 0 }; 
      dayStats[exp.day].planned += Number(exp.cost);
    });

    actualExpenses.forEach(exp => {
      const cost = Number(exp.cost);
      totalActual += cost;
      if (!dayStats[exp.day]) dayStats[exp.day] = { planned: 0, actual: 0 };
      dayStats[exp.day].actual += cost;
      
      if (catStats[exp.category]) catStats[exp.category].actual += cost;
      
      let method = exp.method === 'Card' ? 'Credit Card' : exp.method;
      if (!walletStats[method]) walletStats[method] = { budget: 0, actual: 0 };
      walletStats[method].actual += cost;
    });

    const dailyDataForChart = Object.keys(dayStats)
      .sort((a, b) => {
        const numA = parseInt(a.replace('Day ', '')) || 0;
        const numB = parseInt(b.replace('Day ', '')) || 0;
        return numA - numB;
      })
      .map(day => ({
        day, planned: dayStats[day].planned, actual: dayStats[day].actual
      }));

    const categoryDataForList = Object.keys(catStats)
      .map(cat => ({ name: cat, ...catStats[cat] }))
      .filter(cat => cat.planned > 0 || cat.actual > 0)
      .sort((a, b) => b.planned - a.planned);

    return { totalPlanned, totalActual, dailyDataForChart, categoryDataForList, walletStats };
  }, [actualExpenses, plannedExpenses, categoryBudgets, paymentBudgets, tripDays]);

  const { totalPlanned, totalActual, dailyDataForChart, categoryDataForList, walletStats } = processedData;

  // --- Handlers ---
  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!newExpense.item || !newExpense.cost) return;
    const expense = { ...newExpense, id: Date.now().toString(), cost: Number(newExpense.cost) };
    
    if (entryType === 'actual') {
      setActualExpenses([...actualExpenses, expense]);
    } else {
      setPlannedExpenses([...plannedExpenses, expense]);
    }
    
    setNewExpense({ ...newExpense, item: '', cost: '' });
  };

  const handleDeleteExpense = (id, type) => {
    if(window.confirm('ต้องการลบรายการนี้ใช่ไหม?')) {
      if (type === 'actual') {
        setActualExpenses(actualExpenses.filter(e => e.id !== id));
      } else {
        setPlannedExpenses(plannedExpenses.filter(e => e.id !== id));
      }
    }
  };

  return (
    <div className={`min-h-screen font-sans pb-24 transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      
      {/* --- ส่วนหัวและเครื่องคิดเลข (Sticky แบบติดขอบจอบน) --- */}
      <div className={`sticky top-0 z-40 px-4 py-3 shadow-sm border-b transition-colors ${isDarkMode ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-gray-200'} backdrop-blur-md`}>
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="flex justify-between items-center">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">โตเกียวทริป 🗼</h1>
            
            {/* --- เมนูสำหรับ Desktop (คอมพิวเตอร์) --- */}
            <div className="hidden md:flex items-center gap-2">
              <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-md' : isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>ภาพรวม</button>
              <button onClick={() => setActiveTab('itinerary')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'itinerary' ? 'bg-blue-600 text-white shadow-md' : isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Day Plan</button>
              <button onClick={() => setActiveTab('details')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'details' ? 'bg-blue-600 text-white shadow-md' : isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>รายละเอียด</button>
              <button onClick={() => setActiveTab('map')} className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${activeTab === 'map' ? 'bg-blue-600 text-white shadow-md' : isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><MapIcon size={18} /> แผนที่</button>
              <button onClick={() => setActiveTab('manage')} className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'manage' ? 'bg-blue-600 text-white shadow-md' : isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><Settings size={18} /> จัดการข้อมูล</button>
              
              <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 ml-2 rounded-full transition-colors ${isDarkMode ? 'bg-gray-800 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}>
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>

            {/* --- ปุ่มโหมดมืดสำหรับ Mobile --- */}
            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`md:hidden p-2 rounded-full transition-colors ${isDarkMode ? 'bg-gray-800 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}>
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
          
          {/* Currency Converter (Compact สำหรับมือถือและ Desktop) */}
          <div className="flex items-center gap-2 text-sm">
            <Calculator size={18} className="text-indigo-500 shrink-0 hidden md:block" />
            <div className="relative flex-1">
              <span className={`absolute left-2.5 top-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>¥</span>
              <input type="number" placeholder="ใส่เงินเยน" value={calcYen} onChange={e => setCalcYen(e.target.value)} className={`w-full pl-7 p-1.5 rounded-lg outline-none transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-100 border-transparent text-gray-900'} border focus:ring-2 focus:ring-indigo-500`} />
            </div>
            <span className="text-gray-400 font-medium">x</span>
            <input type="number" step="0.001" value={exchangeRate} onChange={e => setExchangeRate(Number(e.target.value))} className={`w-16 md:w-20 p-1.5 text-center rounded-lg outline-none transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-100 border-transparent text-gray-900'} border focus:ring-2 focus:ring-indigo-500`} />
            <span className="text-gray-400 font-medium">=</span>
            <div className={`flex-1 p-1.5 rounded-lg font-bold text-center ${isDarkMode ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-50 text-indigo-700'}`}>
              {formatBaht(Number(calcYen) * exchangeRate)}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        
        {/* --- Tab 1: Overview --- */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* KPI Cards (ปรับเป็น 2 คอลัมน์บนมือถือ) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <div className={`p-4 md:p-6 rounded-2xl shadow-sm border flex flex-col md:flex-row items-start md:items-center gap-3 transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl"><ListTodo size={20} /></div>
                <div><p className={`text-[11px] md:text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>แผนใช้จ่าย</p><p className="text-lg md:text-2xl font-bold">{formatYen(totalPlanned)}</p></div>
              </div>
              <div className={`p-4 md:p-6 rounded-2xl shadow-sm border flex flex-col md:flex-row items-start md:items-center gap-3 transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl"><ReceiptText size={20} /></div>
                <div><p className={`text-[11px] md:text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>จ่ายจริง</p><p className="text-lg md:text-2xl font-bold">{formatYen(totalActual)}</p></div>
              </div>
              <div className={`p-4 md:p-6 rounded-2xl shadow-sm border flex flex-col md:flex-row items-start md:items-center gap-3 transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <div className={`p-2.5 rounded-xl ${totalPlanned - totalActual >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}><PieChartIcon size={20} /></div>
                <div><p className={`text-[11px] md:text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>สถานะแผน</p><p className={`text-lg md:text-2xl font-bold ${totalPlanned - totalActual >= 0 ? 'text-green-500' : 'text-red-500'}`}>{totalPlanned - totalActual >= 0 ? `เหลือ ${formatYen(totalPlanned - totalActual)}` : `เกิน ${formatYen(totalActual - totalPlanned)}`}</p></div>
              </div>
              <div className={`p-4 md:p-6 rounded-2xl shadow-sm border flex flex-col md:flex-row items-start md:items-center gap-3 transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <div className="p-2.5 bg-yellow-500/10 text-yellow-500 rounded-xl"><Banknote size={20} /></div>
                <div><p className={`text-[11px] md:text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>งบที่เตรียม</p><p className="text-lg md:text-2xl font-bold">{formatYen(globalBudget)}</p></div>
              </div>
            </div>

            {/* Wallet Status */}
            <div className={`p-5 md:p-6 rounded-2xl shadow-sm border transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <h3 className="text-base md:text-lg font-bold mb-4 md:mb-6 flex items-center gap-2"><Wallet size={18} className="text-indigo-500" /> กระเป๋าเงิน (Wallet)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {Object.keys(walletStats).map((method) => {
                  const data = walletStats[method];
                  const percent = data.budget > 0 ? (data.actual / data.budget) * 100 : (data.actual > 0 ? 100 : 0);
                  const isOver = percent > 100;
                  const remaining = data.budget - data.actual;
                  let barColor = 'bg-gray-500'; let icon = <Wallet size={16} />;
                  if (method === 'Cash') { barColor = 'bg-emerald-500'; icon = <Banknote size={16} className="text-emerald-500" />; }
                  if (method === 'Suica') { barColor = 'bg-blue-500'; icon = <Train size={16} className="text-blue-500" />; }
                  if (method.includes('Travel')) { barColor = 'bg-amber-500'; icon = <CreditCard size={16} className="text-amber-500" />; }
                  if (method.includes('Credit')) { barColor = 'bg-purple-500'; icon = <CreditCard size={16} className="text-purple-500" />; }

                  return (
                    <div key={method} className={`p-3 md:p-4 rounded-xl border transition-colors ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-100'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-1.5 font-bold text-sm">{icon} {method}</div>
                        <div className="text-right"><p className={`text-xs font-bold ${isOver ? 'text-red-500' : 'text-green-500'}`}>{isOver ? `เกิน ${formatYen(Math.abs(remaining))}` : `เหลือ ${formatYen(remaining)}`}</p></div>
                      </div>
                      <div className={`w-full rounded-full h-1.5 mb-2 relative ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                        <div className={`h-1.5 rounded-full absolute top-0 left-0 transition-all duration-500 ${isOver ? 'bg-red-500' : barColor}`} style={{ width: `${Math.min(percent, 100)}%` }}></div>
                      </div>
                      <div className={`flex justify-between text-[11px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}><span>จ่าย {formatYen(data.actual)}</span><span>งบ {formatYen(data.budget)}</span></div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className={`p-5 md:p-6 rounded-2xl shadow-sm border transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base md:text-lg font-bold">รายวัน (Daily)</h3>
                  <div className="flex gap-3 text-xs"><span className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-blue-400 rounded-sm"></div> แผน</span><span className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-rose-500 rounded-sm"></div> จ่ายจริง</span></div>
                </div>
                <div className="h-64 md:h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyDataForChart} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#9CA3AF' : '#6B7280', fontSize: 10 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#9CA3AF' : '#6B7280', fontSize: 10 }} tickFormatter={(val) => `¥${val}`} />
                      <RechartsTooltip cursor={{fill: isDarkMode ? '#374151' : '#F3F4F6'}} contentStyle={{ backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF', borderRadius: '12px', border: 'none', color: isDarkMode ? '#F3F4F6' : '#111827', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value, name) => [formatYen(value), name === 'planned' ? 'ตามแผน' : 'จ่ายจริง']} />
                      <Bar dataKey="planned" fill={isDarkMode ? '#3B82F6' : '#93C5FD'} radius={[4, 4, 0, 0]} maxBarSize={30} />
                      <Bar dataKey="actual" fill="#F43F5E" radius={[4, 4, 0, 0]} maxBarSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className={`p-5 md:p-6 rounded-2xl shadow-sm border overflow-y-auto transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`} style={{ maxHeight: '400px' }}>
                <h3 className="text-base md:text-lg font-bold mb-4">แยกตามหมวดหมู่</h3>
                <div className="space-y-4">
                  {categoryDataForList.map((cat, idx) => {
                    const Icon = cat.icon || PieChartIcon;
                    const percent = cat.planned > 0 ? (cat.actual / cat.planned) * 100 : (cat.actual > 0 ? 100 : 0);
                    return (
                      <div key={idx}>
                        <div className="flex justify-between items-end mb-1.5">
                          <div className="flex items-center gap-2"><Icon size={16} style={{ color: cat.color }} /><span className="text-sm font-medium">{cat.name}</span></div>
                          <div className="text-right"><span className="text-sm font-bold">{formatYen(cat.actual)}</span><span className={`text-[10px] md:text-xs font-normal ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>/ {formatYen(cat.planned)}</span></div>
                        </div>
                        <div className={`w-full rounded-full h-2 relative ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <div className="h-2 rounded-full absolute top-0 left-0 transition-all duration-500" style={{ width: `${Math.min(percent, 100)}%`, backgroundColor: percent > 100 ? '#EF4444' : cat.color }}></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- Tab 5: Day Plan (แพลนแบบแยกแต่ละวัน) --- */}
        {activeTab === 'itinerary' && (
          <div className="animate-in fade-in duration-300 space-y-4">
            
            {/* Sub-Tabs สำหรับเลือก Day */}
            <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2">
              {Array.from({ length: tripDays }, (_, i) => `Day ${i + 1}`).map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedPlanDay(day)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all ${selectedPlanDay === day ? 'bg-emerald-500 text-white shadow-md' : (isDarkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50')}`}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* เนื้อหาของ Day ที่ถูกเลือก */}
            <div className={`p-5 md:p-6 rounded-2xl shadow-sm border min-h-[400px] transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              {(() => {
                const plan = tripItinerary.find(p => p.day === selectedPlanDay);
                
                if (!plan) {
                  return (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <MapPin size={48} className={isDarkMode ? 'text-gray-700' : 'text-gray-200'} />
                      <p className={`mt-4 font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>ยังไม่มีข้อมูลแพลนสำหรับวันนี้</p>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>คุณสามารถเพิ่มข้อมูลได้ในโค้ดส่วน tripItinerary</p>
                    </div>
                  );
                }

                return (
                  <div className="relative">
                    <div className="mb-6 pb-4 border-b border-dashed border-gray-200 dark:border-gray-700">
                      <div className="flex items-baseline gap-2 mb-1">
                        <h3 className="font-bold text-xl md:text-2xl text-emerald-500">{plan.day}</h3>
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{plan.date}</span>
                      </div>
                      <p className={`font-bold text-lg ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{plan.title}</p>
                    </div>
                    
                    <div className="space-y-4">
                      {plan.details.map((act, i) => (
                        <div key={i} className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center gap-2 md:gap-4 transition-colors ${isDarkMode ? 'bg-gray-700/30 border-gray-600 hover:bg-gray-700/60' : 'bg-gray-50 border-gray-100 hover:bg-white hover:shadow-sm'}`}>
                          <div className={`font-bold text-sm shrink-0 md:w-20 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                            {act.time}
                          </div>
                          <div className={`text-[15px] leading-relaxed ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                            {act.desc}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* --- Tab 2: Details (รายการใช้จ่าย) --- */}
        {activeTab === 'details' && (
          <div className="animate-in fade-in duration-300">
            {/* Switcher แบบปุ่มใหญ่กดง่ายบนมือถือ */}
            <div className={`flex p-1.5 mb-4 rounded-xl shadow-inner ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200/70'}`}>
              <button onClick={() => setDetailsView('actual')} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${detailsView === 'actual' ? (isDarkMode ? 'bg-gray-600 text-white shadow-sm' : 'bg-white text-gray-900 shadow-sm') : (isDarkMode ? 'text-gray-400' : 'text-gray-500')}`}>จ่ายจริง ({actualExpenses.length})</button>
              <button onClick={() => setDetailsView('planned')} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${detailsView === 'planned' ? (isDarkMode ? 'bg-gray-600 text-white shadow-sm' : 'bg-white text-gray-900 shadow-sm') : (isDarkMode ? 'text-gray-400' : 'text-gray-500')}`}>แผน ({plannedExpenses.length})</button>
            </div>

            {/* List ของรายการค่าใช้จ่ายแบบ Card */}
            <div className="space-y-3">
              {(detailsView === 'actual' ? actualExpenses : plannedExpenses).sort((a,b) => {
                // เรียงวันที่ให้ถูกต้อง (Day 1, Day 2 ... Day 10)
                const numA = parseInt(a.day.replace('Day ', '')) || 0;
                const numB = parseInt(b.day.replace('Day ', '')) || 0;
                return numA - numB;
              }).map((expense) => {
                const Icon = categoryIcons[expense.category] || ReceiptText;
                return (
                  <div key={expense.id} className={`p-4 rounded-2xl shadow-sm border flex justify-between items-center transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                      <div className="p-2.5 md:p-3 rounded-2xl flex-shrink-0" style={{ backgroundColor: `${categoryColors[expense.category] || '#ccc'}20`, color: categoryColors[expense.category] || (isDarkMode ? '#ccc' : '#555') }}>
                        <Icon size={20} />
                      </div>
                      <div className="truncate">
                        <p className={`font-bold text-sm md:text-base truncate ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{expense.item}</p>
                        <p className={`text-[11px] md:text-xs mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{expense.day} • {expense.category} • {expense.method}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1.5 flex-shrink-0 pl-2">
                      <p className="font-bold text-base md:text-lg">{formatYen(expense.cost)}</p>
                      <button onClick={() => handleDeleteExpense(expense.id, detailsView)} className="text-gray-400 hover:text-red-500 p-1 bg-gray-100 dark:bg-gray-700 rounded-full" title="ลบรายการ">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )
              })}
              {(detailsView === 'actual' ? actualExpenses : plannedExpenses).length === 0 && (
                <div className={`py-12 text-center rounded-2xl border border-dashed ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-gray-500' : 'bg-transparent border-gray-300 text-gray-400'}`}>
                  <p>ยังไม่มีข้อมูลในส่วนนี้</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- Tab 3: Map (รูปภาพแผนที่ / รูปอ้างอิง) --- */}
        {activeTab === 'map' && (
          <div className="animate-in fade-in duration-300">
            <div className={`p-4 md:p-6 rounded-2xl shadow-sm border flex flex-col transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2"><MapIcon className="text-blue-500" size={20}/> แผนที่ / รูปภาพอ้างอิง</h3>
              </div>
              
              <div className={`w-full rounded-xl overflow-hidden border ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-100'} flex items-center justify-center min-h-[50vh]`}>
                 <img 
                   src="https://placehold.co/800x600/e2e8f0/64748b?text=Place+Your+Image+Here" 
                   alt="Custom Map" 
                   className="w-full h-auto object-contain" 
                 />
              </div>
              
              <p className={`text-sm mt-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                💡 แนะนำ: นำลิงก์รูปภาพของคุณเองมาใส่ในโค้ดตรง src="..." ได้เลยครับ
              </p>
            </div>
          </div>
        )}

        {/* --- Tab 4: Manage Data --- */}
        {activeTab === 'manage' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
            {/* Form: Add Expense / Plan */}
            <div className={`p-5 md:p-6 rounded-2xl shadow-sm border h-fit transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="flex flex-col mb-6 gap-3">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <ReceiptText size={20} className={entryType === 'actual' ? "text-rose-500" : "text-blue-500"} /> 
                  เพิ่มรายการ
                </h3>
                {/* Switcher */}
                <div className={`flex p-1 rounded-lg text-xs font-medium ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <button type="button" onClick={() => setEntryType('actual')} className={`flex-1 py-2 rounded-md transition-all ${entryType === 'actual' ? 'bg-rose-500 text-white shadow-sm' : (isDarkMode ? 'text-gray-400' : 'text-gray-500')}`}>จ่ายจริง</button>
                  <button type="button" onClick={() => setEntryType('plan')} className={`flex-1 py-2 rounded-md transition-all ${entryType === 'plan' ? 'bg-blue-500 text-white shadow-sm' : (isDarkMode ? 'text-gray-400' : 'text-gray-500')}`}>แผนล่วงหน้า</button>
                </div>
              </div>

              <form onSubmit={handleAddExpense} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">วันที่</label>
                    <select value={newExpense.day} onChange={e => setNewExpense({...newExpense, day: e.target.value})} className={`w-full p-2.5 rounded-lg outline-none text-sm transition-colors border focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                      {Array.from({ length: tripDays }, (_, i) => `Day ${i + 1}`).map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">หมวดหมู่</label>
                    <select value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})} className={`w-full p-2.5 rounded-lg outline-none text-sm transition-colors border focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                      {Object.keys(categoryColors).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">ชื่อรายการ</label>
                  <input type="text" required placeholder="เช่น ค่ารถไฟ, ราเมน..." value={newExpense.item} onChange={e => setNewExpense({...newExpense, item: e.target.value})} className={`w-full p-2.5 rounded-lg outline-none text-sm transition-colors border focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'}`}/>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">จำนวนเงิน (Yen)</label>
                    <input type="number" required min="0" placeholder="0" value={newExpense.cost} onChange={e => setNewExpense({...newExpense, cost: e.target.value})} className={`w-full p-2.5 rounded-lg outline-none text-sm transition-colors border focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'}`}/>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">ช่องทางชำระ</label>
                    <select value={newExpense.method} onChange={e => setNewExpense({...newExpense, method: e.target.value})} className={`w-full p-2.5 rounded-lg outline-none text-sm transition-colors border focus:ring-2 focus:ring-blue-500 font-medium ${isDarkMode ? 'bg-indigo-900/50 border-indigo-700 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-700'}`}>
                      <option value="Cash">💵 เงินสด</option><option value="Suica">🪪 Suica</option><option value="Travel Card">💳 Travel Card</option><option value="Credit Card">💳 Credit Card</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className={`w-full mt-2 text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 ${entryType === 'actual' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-blue-500 hover:bg-blue-600'}`}>
                  <Plus size={18} /> บันทึก{entryType === 'actual' ? 'รายจ่ายจริง' : 'แผนล่วงหน้า'}
                </button>
              </form>
            </div>

            {/* Forms: Settings */}
            <div className="space-y-6 pb-6">
              
              {/* ส่วนตั้งค่าวันเดินทาง */}
              <div className={`p-5 md:p-6 rounded-2xl shadow-sm border transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <h3 className="text-base font-bold mb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2"><Calendar size={18} className="text-emerald-500" /> จำนวนวันเดินทาง</span>
                </h3>
                <div className="flex items-center justify-center gap-6">
                  <button onClick={() => setTripDays(Math.max(1, tripDays - 1))} className={`p-3 rounded-full transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>
                    <span className="text-xl font-bold px-1">-</span>
                  </button>
                  <div className="text-center w-24">
                    <p className="text-3xl font-bold text-emerald-500">{tripDays}</p>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>วัน (Days)</p>
                  </div>
                  <button onClick={() => setTripDays(tripDays + 1)} className={`p-3 rounded-full transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>
                    <span className="text-xl font-bold px-1">+</span>
                  </button>
                </div>
              </div>

              <div className={`p-5 md:p-6 rounded-2xl shadow-sm border transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <h3 className="text-base font-bold mb-4 flex items-center gap-2"><Wallet size={18} className="text-indigo-500" /> งบประมาณกระเป๋าเงิน</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.keys(paymentBudgets).map(method => (
                    <div key={method}>
                      <label className="block text-xs font-bold mb-1">{method}</label>
                      <div className="relative">
                        <span className={`absolute left-2.5 top-2.5 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>¥</span>
                        <input type="number" value={paymentBudgets[method] || ''} onChange={e => setPaymentBudgets(prev => ({ ...prev, [method]: Number(e.target.value) }))} className={`w-full pl-7 p-2 text-sm rounded-lg outline-none transition-colors border ${isDarkMode ? 'bg-indigo-900/30 border-gray-600 text-white' : 'bg-indigo-50/30 border-gray-200 text-gray-900'}`}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`p-5 md:p-6 rounded-2xl shadow-sm border transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <h3 className="text-base font-bold mb-4 flex items-center gap-2"><Settings size={18} className="text-gray-500" /> งบประมาณทริปรวม</h3>
                <div className="relative">
                  <span className={`absolute left-3 top-2.5 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>¥</span>
                  <input type="number" value={globalBudget} onChange={e => setGlobalBudget(Number(e.target.value))} className={`w-full pl-8 p-2 rounded-lg outline-none transition-colors border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}/>
                </div>
              </div>

              <div className={`p-5 md:p-6 rounded-2xl shadow-sm border transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <h3 className="text-base font-bold mb-4 flex items-center gap-2"><PieChartIcon size={18} className="text-purple-500" /> งบประมาณรายหมวดหมู่</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.keys(categoryBudgets).map(cat => {
                    const Icon = categoryIcons[cat];
                    return (
                      <div key={cat}>
                        <label className="block text-[10px] md:text-xs font-medium mb-1 flex items-center gap-1">{Icon && <Icon size={12} style={{ color: categoryColors[cat] }} />} {cat}</label>
                        <div className="relative">
                          <span className={`absolute left-2.5 top-2.5 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>¥</span>
                          <input type="number" value={categoryBudgets[cat] || ''} onChange={e => setCategoryBudgets(prev => ({ ...prev, [cat]: Number(e.target.value) }))} className={`w-full pl-6 p-2 text-sm rounded-lg outline-none transition-colors border focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}/>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- เมนูด้านล่าง (Bottom Navigation) สำหรับมือถือ ปรับให้มี 5 ปุ่ม --- */}
      <div className={`fixed bottom-0 left-0 right-0 border-t transition-colors z-50 md:hidden ${isDarkMode ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-gray-200'} backdrop-blur-md pb-safe`}>
        <div className="flex justify-around items-center">
          <button onClick={() => setActiveTab('overview')} className={`flex flex-col items-center flex-1 py-3 gap-1 transition-colors ${activeTab === 'overview' ? 'text-blue-500' : (isDarkMode ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600')}`}>
            <PieChartIcon size={22} className={activeTab === 'overview' ? "fill-blue-500/20" : ""} />
            <span className="text-[10px] font-bold">ภาพรวม</span>
          </button>
          <button onClick={() => setActiveTab('itinerary')} className={`flex flex-col items-center flex-1 py-3 gap-1 transition-colors ${activeTab === 'itinerary' ? 'text-emerald-500' : (isDarkMode ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600')}`}>
            <Calendar size={22} />
            <span className="text-[10px] font-bold">Day Plan</span>
          </button>
          <button onClick={() => setActiveTab('details')} className={`flex flex-col items-center flex-1 py-3 gap-1 transition-colors ${activeTab === 'details' ? 'text-blue-500' : (isDarkMode ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600')}`}>
            <ListTodo size={22} />
            <span className="text-[10px] font-bold">รายจ่าย</span>
          </button>
          <button onClick={() => setActiveTab('map')} className={`flex flex-col items-center flex-1 py-3 gap-1 transition-colors ${activeTab === 'map' ? 'text-blue-500' : (isDarkMode ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600')}`}>
            <MapIcon size={22} />
            <span className="text-[10px] font-bold">อ้างอิง</span>
          </button>
          <button onClick={() => setActiveTab('manage')} className={`flex flex-col items-center flex-1 py-3 gap-1 transition-colors ${activeTab === 'manage' ? 'text-blue-500' : (isDarkMode ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600')}`}>
            <Settings size={22} />
            <span className="text-[10px] font-bold">จัดการ</span>
          </button>
        </div>
      </div>
      
    </div>
  );
}
