import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  ChevronDown, 
  Camera, 
  X,
  Home,
  Users,
  FileText,
  User,
  History,
  ChevronRight,
  Clock
} from 'lucide-react';
import BottomNav from './components/BottomNav';
import { cn } from './lib/utils';
import { addCheckIn, getCheckIns, getCustomers } from './lib/data';
import { CheckIn as CheckInType } from './types';

interface CheckInProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
  onShowToast: (message: string) => void;
}

export default function CheckIn({ onBack, onNavigate, onShowToast }: CheckInProps) {
  const [view, setView] = useState<'edit' | 'history'>('edit');
  const [visitType, setVisitType] = useState('日常拜访');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState('');
  const [history, setHistory] = useState<CheckInType[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('正在获取位置...');
  const [locationStatus, setLocationStatus] = useState<'loading' | 'success' | 'error'>('loading');

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const historyData = await getCheckIns();
      const customerData = await getCustomers();
      setHistory(historyData);
      setCustomers(customerData);
    };
    fetchData();
    const now = new Date();
    setCheckInTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    
    // 获取实时位置
    handleFetchLocation();
  }, []);

  const handleFetchLocation = () => {
    setLocationStatus('loading');
    setCurrentLocation('正在定位中...');

    if (!navigator.geolocation) {
      setCurrentLocation('浏览器不支持地理定位');
      setLocationStatus('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // 使用 Nominatim 进行简单的逆地理编码 (免费开源，无需 key)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            { headers: { 'Accept-Language': 'zh-CN' } }
          );
          const data = await response.json();
          if (data && data.display_name) {
            setCurrentLocation(data.display_name);
            setLocationStatus('success');
          } else {
            setCurrentLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            setLocationStatus('success');
          }
        } catch (error) {
          console.error('Reverse geocoding failed:', error);
          setCurrentLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          setLocationStatus('success');
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        let msg = '定位失败';
        if (error.code === 1) msg = '位置权限被拒绝';
        else if (error.code === 2) msg = '无法获取位置';
        else if (error.code === 3) msg = '定位超时';
        setCurrentLocation(msg);
        setLocationStatus('error');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCheckIn = () => {
    setIsCheckedIn(true);
    onShowToast('打卡成功！');
  };

  const handleSubmit = async () => {
    if (!isCheckedIn) {
      onShowToast('请先进行打卡！');
      return;
    }
    if (!selectedCustomer) {
      onShowToast('请选择关联客户');
      return;
    }

    const checkIn: CheckInType = {
      id: Date.now().toString(),
      customer: selectedCustomer,
      type: visitType,
      time: checkInTime,
      date: new Date().toLocaleDateString(),
      location: currentLocation,
      notes,
      photo: photo || undefined,
      createdAt: new Date().toISOString()
    };

    try {
      setIsSubmitting(true);
      await addCheckIn(checkIn);
      setHistory(await getCheckIns());
      onShowToast('签到信息已成功提交！');
      setView('history');
      setIsCheckedIn(false);
      setSelectedCustomer('');
      setNotes('');
      setPhoto(null);
    } catch (err) {
      console.error('Failed to submit check-in:', err);
      onShowToast('提交失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-slate-50 overflow-x-hidden max-w-2xl mx-auto md:my-12 md:min-h-0 md:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden pb-24 md:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center bg-white p-4 border-b border-slate-200 justify-between">
        <button onClick={onBack} className="text-slate-900 flex size-10 shrink-0 items-center justify-start cursor-pointer">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-slate-900 text-lg font-bold flex-1 text-center">
          {view === 'edit' ? '签到打卡' : '签到历史'}
        </h2>
        <button 
          onClick={() => setView(view === 'edit' ? 'history' : 'edit')}
          className="text-blue-600 font-bold text-sm flex items-center gap-1"
        >
          {view === 'edit' ? <History size={20} /> : <Camera size={20} />}
          {view === 'edit' ? '历史' : '打卡'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {view === 'edit' ? (
          <>
            {/* Map Section */}
            <div className="p-4">
              <div className="w-full h-48 bg-slate-200 rounded-xl overflow-hidden relative shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <div className="absolute bottom-3 left-3 bg-white px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-md max-w-[90%]">
                  <MapPin className={cn(
                    locationStatus === 'loading' ? "text-slate-400 animate-pulse" : 
                    locationStatus === 'error' ? "text-red-500" : "text-blue-600"
                  )} size={14} />
                  <span className={cn(
                    "text-xs font-medium truncate",
                    locationStatus === 'error' ? "text-red-500" : "text-slate-700"
                  )}>
                    {currentLocation}
                  </span>
                  {locationStatus === 'error' && (
                    <button onClick={handleFetchLocation} className="text-[10px] text-blue-600 font-bold ml-1">重试</button>
                  )}
                </div>
              </div>
            </div>

            {/* Check-in Button */}
            <div className="px-4 pb-6">
              <button 
                onClick={handleCheckIn}
                disabled={isCheckedIn}
                className={cn(
                  "w-full flex flex-col items-center justify-center gap-1 rounded-xl h-24 shadow-lg transition-all active:scale-[0.98]",
                  isCheckedIn ? "bg-emerald-500 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
                )}
              >
                <span className="text-xl font-bold">{isCheckedIn ? '已打卡' : '签到打卡'}</span>
                <span className="text-sm opacity-90 font-medium tracking-wider">{checkInTime}</span>
              </button>
            </div>

            {/* Form Fields */}
            <div className="px-4 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                  <span className="text-red-500">*</span> 关联客户
                </label>
                <div className="relative">
                  <select 
                    className="w-full h-12 pl-4 pr-10 rounded-lg border border-slate-200 bg-white focus:ring-blue-600 focus:border-blue-600 appearance-none outline-none"
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                  >
                    <option value="">请选择客户</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={20} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                  <span className="text-red-500">*</span> 拜访类型
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['日常拜访', '技术支持', '商务洽谈'].map((type) => (
                    <button 
                      key={type}
                      onClick={() => setVisitType(type)}
                      className={cn(
                        "py-2 px-1 border-2 text-xs font-bold rounded-lg transition-all",
                        visitType === type ? "border-blue-600 bg-blue-50 text-blue-600" : "border-slate-200 text-slate-600 hover:border-blue-600/50"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">现场拍照</label>
                <div className="flex flex-wrap gap-3">
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment"
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                  />
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-blue-600 cursor-pointer transition-colors"
                  >
                    <Camera size={24} />
                    <span className="text-[10px] mt-1">添加照片</span>
                  </div>
                  
                  {photo && (
                    <div className="w-20 h-20 bg-slate-100 rounded-lg relative overflow-hidden group">
                      <img 
                        src={photo} 
                        alt="Captured site" 
                        className="w-full h-full object-cover"
                      />
                      <button 
                        onClick={removePhoto}
                        className="absolute top-1 right-1 size-5 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">访谈纪要/备注</label>
                <textarea 
                  className="w-full min-h-[120px] p-3 rounded-lg border border-slate-200 bg-white focus:ring-blue-600 focus:border-blue-600 outline-none" 
                  placeholder="请输入本次拜访的核心内容或后续跟进计划..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="px-4 pt-8 pb-12">
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={cn(
                  "w-full h-12 text-white font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-2",
                  isSubmitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:brightness-105 active:scale-[0.99]"
                )}
              >
                {isSubmitting ? (
                  <>
                    <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    提交中...
                  </>
                ) : '提交签到信息'}
              </button>
            </div>
          </>
        ) : (
          <div className="p-4 space-y-4">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <MapPin size={48} className="mb-4 opacity-20" />
                <p>暂无签到历史</p>
              </div>
            ) : (
              history.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900">{item.customer}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded-full font-bold">{item.type}</span>
                        <span className="text-slate-400 text-[10px] flex items-center gap-1">
                          <Clock size={10} /> {item.time}
                        </span>
                      </div>
                    </div>
                    <span className="text-slate-400 text-[10px] font-medium">{item.date}</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">
                    <MapPin size={12} className="mt-0.5 shrink-0" />
                    <span className="line-clamp-1">{item.location}</span>
                  </div>
                  {item.photo && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-slate-100">
                      <img src={item.photo} alt="Check-in site" className="w-full h-32 object-cover" />
                    </div>
                  )}
                  {item.notes && (
                    <p className="mt-3 text-xs text-slate-600 leading-relaxed border-t border-slate-50 pt-3">
                      {item.notes}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentPage="report" onNavigate={onNavigate} />
    </div>
  );
}
