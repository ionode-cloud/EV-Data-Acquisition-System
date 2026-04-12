import { useState, useEffect } from 'react';
import axios from 'axios';
import { Database, Download, Calendar, FileText, ChevronRight, Clock, MapPin, Activity } from 'lucide-react';

const DataLogs = () => {
    const [dashboards, setDashboards] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [deviceData, setDeviceData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDashboards = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const res = await axios.get(`${apiUrl}/api/dashboards`);
                setDashboards(res.data);
                if (res.data.length > 0) setSelectedDeviceId(res.data[0].deviceId);
            } catch (error) {
                console.error('Error fetching dashboards', error);
            }
        };
        fetchDashboards();
    }, []);

    useEffect(() => {
        if (!selectedDeviceId) return;
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const res = await axios.get(`${apiUrl}/api/vehicle/history?deviceId=${selectedDeviceId}&limit=100`);
                setDeviceData(res.data);
            } catch (error) {
                console.error('Error fetching history', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [selectedDeviceId]);

    const handleDownload = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const url = `${apiUrl}/api/download?deviceId=${selectedDeviceId}&startDate=${startDate}&endDate=${endDate}`;
            const response = await axios.get(url, { responseType: 'blob' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(new Blob([response.data]));
            link.setAttribute('download', `EV_Log_${selectedDeviceId}_${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading file', error);
            alert('Failed to download telemetry archive.');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#111827] rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Database size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-[#111827] tracking-tight">Telemetry Logs</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">ARCHIVE</span>
                            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Review & Export Historical Records</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter & Action Card */}
            <div className="saas-card p-8 bg-white border border-[#E5E7EB]">
                <div className="flex items-center gap-3 mb-6">
                    <FileText size={16} className="text-[#346eea]" />
                    <h3 className="text-xs font-black text-[#111827] uppercase tracking-[0.2em]">Log Extraction Parameters</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Target Node</label>
                        <select className="auth-input font-bold" value={selectedDeviceId} onChange={e => setSelectedDeviceId(e.target.value)}>
                            {dashboards.map(d => (
                                <option key={d._id} value={d.deviceId}>{d.dashboardName} [{d.deviceId}]</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Start Epoch</label>
                        <div className="relative">
                            <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                            <input type="date" className="auth-input pl-11" value={startDate} onChange={e => setStartDate(e.target.value)} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">End Epoch</label>
                        <div className="relative">
                            <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                            <input type="date" className="auth-input pl-11" value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </div>
                    </div>

                    <button onClick={handleDownload} className="primary-btn h-[44px] flex items-center justify-center gap-2 group">
                        <Download size={18} className="group-hover:scale-110 transition-transform" />
                        <span className="uppercase tracking-widest font-black text-[11px]">Export .XLSX</span>
                    </button>
                </div>
            </div>

            {/* Data Grid Card */}
            <div className="saas-card overflow-hidden">
                <div className="px-8 py-5 border-b border-[#F1F5F9] bg-[#F8FAFC]/50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Activity size={14} className="text-[#346eea]" />
                        <h3 className="text-[10px] font-black text-[#111827] uppercase tracking-wider">Device History Buffer</h3>
                    </div>
                    <span className="text-[10px] font-black text-[#94A3B8] bg-white border border-[#E5E7EB] px-3 py-1.5 rounded-lg uppercase tracking-widest">
                        {deviceData.length} Points Synchronized
                    </span>
                </div>

                <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
                    <table className="saas-table">
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>SOC (%)</th>
                                <th>Voltage</th>
                                <th>B-Temp</th>
                                <th>M-Temp</th>
                                <th>M-RPM</th>
                                <th>W-RPM</th>
                                <th>Loss</th>
                                <th>Torque</th>
                                <th>GPS Payload</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={10} className="py-20 text-center"><div className="btn-spinner border-slate-200 border-t-[#346eea] mx-auto"></div></td></tr>
                            ) : deviceData.length === 0 ? (
                                <tr><td colSpan={10} className="py-20 text-center text-[#94A3B8] font-bold uppercase tracking-widest text-[10px]">No historical data found for this node.</td></tr>
                            ) : (
                                deviceData.map((d, index) => (
                                    <tr key={index} className="hover:bg-[#F8FAFC] transition-colors">
                                        <td className="text-[10px] font-bold text-[#64748B] font-mono">{new Date(d.timestamp).toLocaleString()}</td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div className="w-12 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                                                    <div className="h-full bg-[#111827] rounded-full" style={{ width: `${Math.min(d.batterySOC, 100)}%` }}></div>
                                                </div>
                                                <span className="text-[#111827] font-black text-[11px]">{d.batterySOC}%</span>
                                            </div>
                                        </td>
                                        <td className="font-bold text-[#111827]">{d.batteryVoltage}V</td>
                                        <td className={`font-bold ${d.batteryTemperature > 45 ? 'text-red-500' : 'text-[#64748B]'}`}>{d.batteryTemperature}°C</td>
                                        <td className="font-bold text-[#64748B]">{d.motorTemperature}°C</td>
                                        <td className="font-mono text-[11px] font-bold text-[#475569]">{(d.motorRPM ?? 0).toLocaleString()}</td>
                                        <td className="font-mono text-[11px] font-bold text-[#475569]">{(d.wheelRPM ?? 0).toLocaleString()}</td>
                                        <td className="text-[#64748B] font-bold">{d.loss}%</td>
                                        <td className="text-[#111827] font-black">{d.torque} Nm</td>
                                        <td>
                                                <span className="text-[10px] font-mono font-bold tracking-tighter truncate max-w-[100px]">
                                                    {d.gpsLatitude?.toFixed(4) ?? '0.0000'}, {d.gpsLongitude?.toFixed(4) ?? '0.0000'}
                                                </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DataLogs;
