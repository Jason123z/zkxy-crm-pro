import React, { useEffect, useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  FileText,
  User,
  Coffee,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { getAllReports, getAllCheckIns, getAllProfiles } from '../lib/api';
import { DailyReport as Report, CheckIn, UserProfile } from '../../types';

export default function AllReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'checkin' | 'report'>('checkin');
  const [selectedPersonnel, setSelectedPersonnel] = useState<string>('all');

  useEffect(() => {
    async function fetchData() {
      try {
        const [r, c, p] = await Promise.all([
          getAllReports(),
          getAllCheckIns(),
          getAllProfiles()
        ]);
        setReports(r);
        setCheckIns(c);
        setProfiles(p);
      } catch (error) {
        console.error("Failed to fetch records:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredCheckIns = checkIns.filter(c => 
    selectedPersonnel === 'all' || (c as any).userId === selectedPersonnel
  );

  const filteredReports = reports.filter(r => 
    selectedPersonnel === 'all' || (r as any).userId === selectedPersonnel
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">全员工作汇总</h2>
          <p className="text-slate-500">签到记录与日报/周报汇总详情</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setActiveTab('checkin')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'checkin' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
          >
            签到打卡
          </button>
          <button 
            onClick={() => setActiveTab('report')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'report' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
          >
            日报周报
          </button>
        </div>
      </div>

      {/* Shared Personnel Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
            <User size={16} className="text-slate-400" />
            <span className="text-sm font-medium text-slate-700">筛选人员:</span>
            <select 
              value={selectedPersonnel}
              onChange={e => setSelectedPersonnel(e.target.value)}
              className="text-sm bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 ml-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全员展示 (默认)</option>
              {profiles.map(p => (
                <option key={(p as any).id} value={(p as any).id}>{p.name}</option>
              ))}
            </select>
        </div>
        <div className="text-xs text-slate-400">
            共计：{activeTab === 'checkin' ? filteredCheckIns.length : filteredReports.length} 条记录
        </div>
      </div>

      {/* Records Display Area */}
      {activeTab === 'checkin' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCheckIns.map(checkIn => (
            <div key={checkIn.id} className="bg-white rounded-xl border border-slate-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    {(checkIn as any).ownerName?.[0] || '员'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{(checkIn as any).ownerName || '测试人员'}</h4>
                    <span className="text-xs text-slate-400 font-medium">{checkIn.date} {checkIn.time}</span>
                  </div>
                </div>
                <div className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded uppercase border border-emerald-100">
                  {checkIn.type}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">{checkIn.location}</p>
                </div>
                <div className="flex items-start gap-2">
                    <FileText size={16} className="text-slate-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-500 italic truncate italic">{checkIn.customer}</p>
                </div>
                {checkIn.notes && (
                  <div className="bg-slate-50 p-2.5 rounded-lg text-xs text-slate-600 border border-slate-100 line-clamp-2">
                    备注: {checkIn.notes}
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredCheckIns.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-xl border border-dotted border-slate-300">
                <Coffee size={48} className="mx-auto mb-4 opacity-10" />
                <p>暂无相关签到记录</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
          {filteredReports.map(report => (
            <div key={report.id} className="p-6 hover:bg-slate-50/80 transition-colors group">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center">
                            <span className="text-[10px] font-bold opacity-60 uppercase">{report.type === 'daily' ? '日' : '周'}</span>
                            <span className="font-bold text-lg mt-[-2px]">报</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="font-bold text-slate-800">{(report as any).ownerName || '测试人员'} 的{report.type === 'daily' ? '日报' : '周报'}</h4>
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${report.type === 'daily' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                    {report.date}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 mt-1 line-clamp-1">{report.summary}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end pr-4 text-right">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">跟进客户数</span>
                            <span className="text-lg font-bold text-slate-700">{report.clientProgress?.length || 0}</span>
                        </div>
                        <button className="h-10 px-4 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold flex items-center gap-1 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                            查看报告全文
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                {/* Progress Mini View */}
                {report.clientProgress && report.clientProgress.length > 0 && (
                    <div className="mt-4 pl-16 flex flex-wrap gap-2">
                        {report.clientProgress.map((p, idx) => (
                           <div key={idx} className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded-md text-[11px] font-medium text-slate-600 shadow-xs">
                               <CheckCircle2 size={12} className="text-emerald-500" />
                               {p.customerName}
                           </div>
                        ))}
                    </div>
                )}
            </div>
          ))}

          {filteredReports.length === 0 && (
            <div className="py-16 text-center text-slate-400">
                <ClipboardList size={48} className="mx-auto mb-4 opacity-10" />
                <p>暂无相关报告记录</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
