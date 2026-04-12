import { useState, useEffect } from 'react';
import axios from 'axios';
import Chart from 'react-apexcharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import {
    Zap, Thermometer, MapPin, Gauge, Signal, Search,
    LayoutGrid, ChevronRight, Trash2, Cpu, Activity, Battery
} from 'lucide-react';
import '../index.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const Dashboard = () => {
    const [dashboards, setDashboards] = useState([]);
    const [selectedDashboard, setSelectedDashboard] = useState(null);
    const [deviceData, setDeviceData] = useState([]);
    const [latestData, setLatestData] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isSelectingDashboard, setIsSelectingDashboard] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : {};
    const isAdmin = user.role === 'admin';

    const handleDeleteDashboard = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this dashboard?")) return;
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.delete(`${apiUrl}/api/dashboards/${id}`);
            const remaining = dashboards.filter(d => d._id !== id);
            setDashboards(remaining);
            if (remaining.length === 1) setSelectedDashboard(remaining[0]);
            else if (remaining.length === 0) setSelectedDashboard(null);
        } catch (error) {
            console.error("Error deleting dashboard:", error);
        }
    };

    useEffect(() => {
        const fetchDashboards = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const res = await axios.get(`${apiUrl}/api/dashboards`);
                const all = res.data || [];
                setDashboards(all);
                setIsConnected(true);
                if (all.length > 1) {
                    setIsSelectingDashboard(true);
                } else if (all.length === 1) {
                    setSelectedDashboard(all[0]);
                }
            } catch (err) {
                console.error("Failed to fetch dashboards", err);
                setIsConnected(false);
            }
        };
        fetchDashboards();
    }, []);

    useEffect(() => {
        if (!selectedDashboard) return;
        const fetchData = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const [latestRes, historyRes] = await Promise.all([
                    axios.get(`${apiUrl}/api/vehicle/latest?deviceId=${selectedDashboard.deviceId}`),
                    axios.get(`${apiUrl}/api/vehicle/history?deviceId=${selectedDashboard.deviceId}&limit=50`)
                ]);
                if (latestRes.data && latestRes.data.deviceId) {
                    setLatestData(latestRes.data);
                    setIsConnected(true);
                }
                if (historyRes.data) {
                    setDeviceData([...historyRes.data].reverse());
                }
            } catch (error) {
                console.error("Error fetching vehicle data:", error);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, [selectedDashboard]);

    const kpis = latestData ? [
        {
            icon: <Battery size={20} />,
            label: 'Battery SOC',
            value: `${latestData.batterySOC ?? '0'}`,
            unit: '%',
            status: latestData.batterySOC < 20 ? 'CRITICAL' : 'OPERATIONAL',
            statusColor: latestData.batterySOC < 20 ? '#EF4444' : '#F59E0B',
            progress: latestData.batterySOC,
        },
        {
            icon: <Zap size={20} />,
            label: 'Battery Voltage',
            value: `${latestData.batteryVoltage ?? '0'}`,
            unit: 'V',
            status: 'STABLE OUTPUT',
            statusColor: '#059669',
        },
        {
            icon: <Thermometer size={20} />,
            label: 'Battery Temp',
            value: `${latestData.batteryTemperature ?? '0'}`,
            unit: '°C',
            status: latestData.batteryTemperature > 45 ? 'HIGH' : 'NORMAL',
            statusColor: latestData.batteryTemperature > 45 ? '#D97706' : '#059669',
        },
        {
            icon: <Thermometer size={20} />,
            label: 'Motor Temp',
            value: `${latestData.motorTemperature ?? '0'}`,
            unit: '°C',
            status: 'OPTIMAL',
            statusColor: '#059669',
        },
        {
            icon: <Activity size={20} />,
            label: 'Motor RPM',
            value: (latestData.motorRPM ?? 0).toLocaleString(),
            unit: '',
            status: 'ACTIVE DRIVE',
            statusColor: '#F59E0B',
        },
        {
            icon: <Gauge size={20} />,
            label: 'Wheel RPM',
            value: (latestData.wheelRPM ?? 0).toLocaleString(),
            unit: '',
            status: 'SYNCHRONIZED',
            statusColor: '#059669',
        },
        {
            icon: <Signal size={20} />,
            label: 'Loss',
            value: `${latestData.loss ?? '0'}`,
            unit: '%',
            status: 'EFFICIENCY METRIC',
            statusColor: '#6B7280',
        },
        {
            icon: <Zap size={20} />,
            label: 'Torque',
            value: `${latestData.torque ?? '0'}`,
            unit: 'Nm',
            status: 'PEAK POWER',
            statusColor: '#F59E0B',
        },
    ] : [];

    const chartOptions = {
        chart: { type: 'area', toolbar: { show: false }, zoom: { enabled: false } },
        stroke: { curve: 'smooth', width: 2 },
        fill: {
            type: 'gradient',
            gradient: { shadeIntensity: 1, opacityFrom: 0.2, opacityTo: 0.05, stops: [0, 100] }
        },
        colors: ['#F59E0B'],
        xaxis: {
            type: 'datetime',
            labels: { style: { colors: '#94A3B8', fontSize: '11px', fontWeight: 600 } },
            axisBorder: { show: false }, axisTicks: { show: false }
        },
        yaxis: { labels: { style: { colors: '#94A3B8', fontSize: '11px', fontWeight: 600 } } },
        grid: { borderColor: '#E5E7EB', strokeDashArray: 4 },
        dataLabels: { enabled: false },
        tooltip: { theme: 'light' }
    };

    const chartSeries = [{ name: 'SOC', data: deviceData.map(d => [new Date(d.timestamp).getTime(), d.batterySOC]) }];
    const mapCenter = latestData?.gpsLatitude ? [latestData.gpsLatitude, latestData.gpsLongitude] : [20.2961, 85.8245];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {isSelectingDashboard ? (
                <div className="space-y-6">
                    <header>
                        <h1 className="text-2xl font-black text-[#111827] tracking-tight">Vehicle Dashboards</h1>
                        <p className="text-sm text-[#6B7280] font-medium mt-1">Select a connected vehicle to view live telemetry diagnostics.</p>
                    </header>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {dashboards.map(d => (
                            <div key={d._id} onClick={() => { setSelectedDashboard(d); setIsSelectingDashboard(false); }} className="kpi-card cursor-pointer group hover:border-[#F59E0B]/50">
                                <div className="flex items-center gap-4">
                                    <div className="icon-box group-hover:bg-[#F59E0B] group-hover:text-white transition-colors">
                                        <Zap size={22} className="fill-current" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[#111827]">{d.dashboardName}</h3>
                                        <p className="text-xs font-mono text-[#94A3B8]">{d.deviceId}</p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-[#F1F5F9] flex justify-between items-center text-xs font-bold text-[#F59E0B]">
                                    VIEW LIVE DATA <ChevronRight size={16} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <>
                    {/* Dashboard Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#F59E0B]">
                                <Zap size={20} className="text-white fill-current" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-[#111827] tracking-tight">EV System Monitor</h1>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">MAIN</span>
                                    <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Live Telemetry Diagnostics</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <select 
                                className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm font-bold text-[#111827] outline-none shadow-sm min-w-[180px]"
                                value={selectedDashboard?._id || ''}
                                onChange={e => setSelectedDashboard(dashboards.find(d => d._id === e.target.value))}
                            >
                                {dashboards.map(d => <option key={d._id} value={d._id}>{d.dashboardName}</option>)}
                            </select>
                            <div className="bg-white/50 border border-[#E5E7EB] rounded-xl px-4 py-2.5 flex items-center gap-2.5 shadow-sm">
                                <div className="status-dot"></div>
                                <span className="text-[10px] font-black text-[#059669] uppercase tracking-wider">System Active</span>
                            </div>
                        </div>
                    </div>

                    {/* KPI Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {kpis.map((k, i) => (
                            <div key={i} className="kpi-card">
                                <div className="flex justify-between items-start">
                                    <div className="icon-box">
                                        {k.icon}
                                    </div>
                                    <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.15em]">{k.label}</span>
                                </div>
                                <div className="flex items-baseline gap-1 mt-2">
                                    <span className="text-3xl font-black text-[#111827] tracking-tighter">{k.value}</span>
                                    <span className="text-lg font-bold text-[#94A3B8]">{k.unit}</span>
                                </div>
                                {k.progress !== undefined && (
                                    <div className="w-full bg-[#F3F4F6] h-1.5 rounded-full overflow-hidden mt-1">
                                        <div className="h-full bg-[#F59E0B] rounded-full transition-all duration-1000" style={{ width: `${k.progress}%` }}></div>
                                    </div>
                                )}
                                <div className="mt-auto pt-2 flex justify-end">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-right" style={{ color: k.statusColor }}>{k.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Analytics Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* History Chart */}
                        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E7EB] p-8 shadow-sm">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-base font-black text-[#111827]">Telemetry History</h3>
                                    <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mt-1">Battery Level VS Time</p>
                                </div>
                                <div className="flex items-center gap-2.5 bg-[#FFF7ED] border border-[#FDE68A] px-3 py-1.5 rounded-lg">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></div>
                                    <span className="text-[10px] font-black text-[#D97706] uppercase tracking-wider">Live Buffer</span>
                                </div>
                            </div>
                            <div className="h-[350px] -ml-4">
                                <Chart options={chartOptions} series={chartSeries} type="area" height="100%" width="100%" />
                            </div>
                        </div>

                        {/* Location Map */}
                        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 shadow-sm flex flex-col">
                            <div className="flex justify-between items-center mb-8 text-[#111827]">
                                <div className="flex items-center gap-3">
                                    <MapPin size={20} className="text-[#F59E0B]" />
                                    <div>
                                        <h3 className="text-base font-black">Fleet Location</h3>
                                        <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mt-1">Real-time GPS</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E5E7EB] px-3 py-1.5 rounded-lg">
                                    <Signal size={12} className="text-[#64748B]" />
                                    <span className="text-[10px] font-black text-[#64748B] uppercase tracking-wider">GPS Feed</span>
                                </div>
                            </div>
                            <div className="flex-1 rounded-2xl overflow-hidden border border-[#E5E7EB] min-h-[300px] z-0">
                                <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                                    <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                                    {latestData?.gpsLatitude && (
                                        <Marker position={[latestData.gpsLatitude, latestData.gpsLongitude]}>
                                            <Popup>Vehicle Location</Popup>
                                        </Marker>
                                    )}
                                </MapContainer>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;
