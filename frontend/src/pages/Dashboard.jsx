import { useState, useEffect } from 'react';
import axios from 'axios';
import Chart from 'react-apexcharts';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
    Zap, Thermometer, MapPin, Gauge, Signal, Search,
    LayoutGrid, ChevronRight, Trash2, Cpu, Activity, Battery,
    MoreHorizontal, TrendingUp, TrendingDown
} from 'lucide-react';
import '../index.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

// Syncs the map view whenever GPS coordinates change
const MapUpdater = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) {
            map.flyTo([lat, lng], map.getZoom(), { animate: true, duration: 1.2 });
        }
    }, [lat, lng, map]);
    return null;
};

const Dashboard = () => {
    const [dashboards, setDashboards] = useState([]);
    const [selectedDashboard, setSelectedDashboard] = useState(null);
    const [deviceData, setDeviceData] = useState([]);
    const [latestData, setLatestData] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isSelectingDashboard, setIsSelectingDashboard] = useState(false);

    useEffect(() => {
        const fetchDashboards = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL ;
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
                const apiUrl = import.meta.env.VITE_API_URL ;
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
            grad: 'grad-blue',
            trend: '+2.45%',
        },
        {
            icon: <Zap size={20} />,
            label: 'Voltage',
            value: `${latestData.batteryVoltage ?? '0'}`,
            unit: 'V',
            grad: 'grad-teal',
            trend: '+1.12%',
        },
        {
            icon: <Thermometer size={20} />,
            label: 'Battery Temp',
            value: `${latestData.batteryTemperature ?? '0'}`,
            unit: '°C',
            grad: 'grad-rose',
            trend: '-0.34%',
        },
        {
            icon: <Thermometer size={20} />,
            label: 'Motor Temp',
            value: `${latestData.motorTemperature ?? '0'}`,
            unit: '°C',
            grad: 'grad-orange',
            trend: '+2.10%',
        },
        {
            icon: <Activity size={20} />,
            label: 'Motor RPM',
            value: (latestData.motorRPM ?? 0).toLocaleString(),
            unit: '',
            grad: 'grad-purple',
            trend: '+5.42%',
        },
        {
            icon: <Gauge size={20} />,
            label: 'Wheel RPM',
            value: (latestData.wheelRPM ?? 0).toLocaleString(),
            unit: '',
            grad: 'grad-indigo',
            trend: '+4.81%',
        },
        {
            icon: <Signal size={20} />,
            label: 'Loss',
            value: `${latestData.loss ?? '0'}`,
            unit: '%',
            grad: 'grad-navy',
            trend: '-1.05%',
        },
        {
            icon: <Zap size={20} />,
            label: 'Torque',
            value: `${latestData.torque ?? '0'}`,
            unit: 'Nm',
            grad: 'grad-emerald',
            trend: '+3.22%',
        },
    ] : [];

    const chartOptions = {
        chart: { type: 'area', toolbar: { show: false }, zoom: { enabled: false }, background: 'transparent' },
        theme: { mode: 'dark' },
        stroke: { curve: 'smooth', width: 3 },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1, stops: [0, 100], colorStops: [
                    { offset: 0, color: '#346eea', opacity: 0.4 },
                    { offset: 100, color: '#346eea', opacity: 0 }
                ]
            }
        },
        colors: ['#346eea'],
        xaxis: {
            type: 'datetime',
            labels: { style: { colors: 'rgba(255, 255, 255, 0.5)', fontSize: '11px', fontWeight: 600 } },
            axisBorder: { show: false }, axisTicks: { show: false }
        },
        yaxis: { labels: { style: { colors: 'rgba(255, 255, 255, 0.5)', fontSize: '11px', fontWeight: 600 } } },
        grid: { borderColor: 'rgba(255, 255, 255, 0.05)', strokeDashArray: 4 },
        dataLabels: { enabled: false },
        tooltip: { theme: 'dark' }
    };

    const chartSeries = [{ name: 'SOC', data: deviceData.map(d => [new Date(d.timestamp).getTime(), d.batterySOC]) }];
    // GPS is only valid if we have a non-null, non-zero fix
    const hasGPS = !!(latestData?.gpsLatitude && latestData?.gpsLongitude &&
        latestData.gpsLatitude !== 0 && latestData.gpsLongitude !== 0);
    const mapCenter = hasGPS ? [latestData.gpsLatitude, latestData.gpsLongitude] : [20.2961, 85.8245];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {isSelectingDashboard ? (
                <div className="space-y-6">
                    <header>
                        <h1 className="text-2xl font-black text-[#111827] tracking-tight">Vehicle Dashboards</h1>
                        <p className="text-sm text-[#6B7280] font-medium mt-1">Select a connected vehicle to view live telemetry diagnostics.</p>
                    </header>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {dashboards.map((d, i) => {
                            const grads = ['grad-blue', 'grad-indigo', 'grad-teal', 'grad-purple', 'grad-navy', 'grad-emerald'];
                            const currentGrad = grads[i % grads.length];

                            return (
                                <div
                                    key={d._id}
                                    onClick={() => { setSelectedDashboard(d); setIsSelectingDashboard(false); }}
                                    className={`premium-kpi ${currentGrad} cursor-pointer group scale-100 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300`}
                                    style={{ minHeight: '200px' }}
                                >
                                    <div className="sparkline-bg opacity-30" />

                                    <div className="flex justify-between items-start relative z-10">
                                        <div className="glass-icon group-hover:bg-white group-hover:text-[#111827] transition-all duration-500">
                                            <Zap size={24} className="fill-current" />
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
                                            <span className="text-[10px] font-black tracking-widest uppercase">Node Ready</span>
                                        </div>
                                    </div>

                                    <div className="mt-6 relative z-10">
                                        <h3 className="text-xl font-black tracking-tight mb-1">{d.dashboardName}</h3>
                                        <div className="flex items-center gap-2 text-white/60">
                                            <Cpu size={12} />
                                            <span className="text-xs font-mono font-bold uppercase tracking-wider">{d.deviceId}</span>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center relative z-10">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Connect to Stream</span>
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-[#111827] transition-all duration-500">
                                            <ChevronRight size={18} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <>
                    {/* Dashboard Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#346eea]">
                                <Zap size={20} className="text-white fill-current" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-[#111827] tracking-tight">EV System Monitor</h1>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">Live Data Acquisition</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <select
                                className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm font-bold text-[#111827] outline-none shadow-sm min-w-[180px]"
                                value={selectedDashboard?._id || ''}
                                onChange={e => setSelectedDashboard(dashboards.find(d => d._id === e.target.value))}
                            >
                                {dashboards.map(d => <option key={d._id} value={d._id}>{d.dashboardName}</option>)}
                            </select>
                            <div className="bg-white/50 border border-[#E5E7EB] rounded-xl px-4 py-2.5 flex items-center gap-2.5 shadow-sm">
                                <div className="status-dot"></div>
                                <span className="text-[10px] font-black text-[#059669] uppercase tracking-wider">Node Active</span>
                            </div>
                        </div>
                    </div>

                    {/* KPI Grid (Overhaul to Match Image) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {kpis.map((k, i) => (
                            <div key={i} className={`premium-kpi ${k.grad}`}>
                                <div className="sparkline-bg" />

                                <div className="flex justify-between items-start relative z-10">
                                    <div className="glass-icon">
                                        {k.icon}
                                    </div>
                                    <button className="text-white/40 hover:text-white transition-colors">
                                        <MoreHorizontal size={18} />
                                    </button>
                                </div>

                                <div className="mt-4 relative z-10">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-black tracking-tighter">{k.value}</span>
                                        <span className="text-base font-bold text-white/60">{k.unit}</span>
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/50 mt-1">{k.label}</p>
                                </div>

                                <div className="flex justify-end mt-4 relative z-10">
                                    <div className="trend-badge">
                                        {k.trend.startsWith('+') ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                        {k.trend}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* History Chart */}
                        <div className="lg:col-span-2 premium-kpi grad-navy p-8" style={{ minHeight: '450px' }}>
                            <div className="sparkline-bg opacity-10" />
                            <div className="flex justify-between items-center mb-8 relative z-10">
                                <div>
                                    <h3 className="text-lg font-black text-white tracking-tight">History Log</h3>
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mt-1">Real-time Stream Data</p>
                                </div>
                                <div className="trend-badge">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#346eea] animate-pulse"></div>
                                    <span className="uppercase tracking-widest text-[9px]">LIVE SYNC</span>
                                </div>
                            </div>
                            <div className="h-[320px] -ml-4 relative z-10">
                                <Chart options={chartOptions} series={chartSeries} type="area" height="100%" width="100%" />
                            </div>
                        </div>

                        {/* Location Map */}
                        <div className="premium-kpi grad-indigo p-8 flex flex-col" style={{ minHeight: '450px' }}>
                            <div className="sparkline-bg opacity-10" />
                            <div className="flex justify-between items-center mb-4 relative z-10 text-white">
                                <div className="flex items-center gap-3">
                                    <div className="glass-icon">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black tracking-tight">Live GPS</h3>
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mt-1">Vehicle Geofence</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {hasGPS ? (
                                        <>
                                            <p className="text-[10px] font-mono font-bold text-white/80 tracking-widest">
                                                {latestData.gpsLatitude.toFixed(6)}°N
                                            </p>
                                            <p className="text-[10px] font-mono font-bold text-white/80 tracking-widest">
                                                {latestData.gpsLongitude.toFixed(6)}°E
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">No Signal</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 rounded-2xl overflow-hidden border border-white/5 bg-[#111827] relative z-10" style={{ minHeight: '300px' }}>
                                {hasGPS ? (
                                    <MapContainer center={mapCenter} zoom={15} style={{ height: '100%', width: '100%', minHeight: '300px' }} zoomControl={false}>
                                        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; <a href="https://carto.com/">CARTO</a>' />
                                        <MapUpdater lat={latestData.gpsLatitude} lng={latestData.gpsLongitude} />
                                        <Marker position={[latestData.gpsLatitude, latestData.gpsLongitude]}>
                                            <Popup>
                                                <strong>Vehicle Location</strong><br />
                                                Lat: {latestData.gpsLatitude.toFixed(6)}<br />
                                                Lng: {latestData.gpsLongitude.toFixed(6)}
                                            </Popup>
                                        </Marker>
                                    </MapContainer>
                                ) : (
                                    <div className="h-full w-full flex flex-col items-center justify-center gap-3" style={{ minHeight: '300px' }}>
                                        <MapPin size={36} className="text-white/20" />
                                        <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em]">Awaiting GPS Signal...</p>
                                        <div className="w-2 h-2 rounded-full bg-white/20 animate-pulse" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;
