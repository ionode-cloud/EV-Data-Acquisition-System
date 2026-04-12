const DeviceData = require('../models/DeviceData');
const Device = require('../models/Device');
const ExcelJS = require('exceljs');

// ESP32 sends data here
exports.receiveData = async (req, res) => {
    try {
        const { 
            deviceId, batteryTemp, batterySOC, batteryVoltage, 
            motorTemp, motorRPM, wheelRPM, loss, torque,
            latitude, longitude, speed,
            flRadar, frRadar, rlRadar, rrRadar, 
            brakeStatus, lux, headlightStatus 
        } = req.body;

        // Validate device connection
        const device = await Device.findOne({ deviceId });
        if (!device) {
            return res.status(404).json({ message: 'Device not found' });
        }

        // Update last seen
        device.lastSeen = new Date();
        await device.save();

        const newData = new DeviceData({
            deviceId,
            batteryTemperature: batteryTemp,
            batterySOC,
            batteryVoltage,
            motorTemperature: motorTemp,
            motorRPM,
            wheelRPM,
            loss,
            torque,
            gpsLatitude: latitude,
            gpsLongitude: longitude,
            speed,
            flRadar,
            frRadar,
            rlRadar,
            rrRadar,
            brakeStatus,
            lux,
            headlightStatus
        });

        await newData.save();

        // Emit real-time update via Socket.io
        req.io.emit('device-data', newData);

        res.status(200).json({ message: 'Data received successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get device data history
exports.getHistory = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const history = await DeviceData.find({ deviceId }).sort({ timestamp: -1 }).limit(100);
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Download Excel File
exports.downloadExcel = async (req, res) => {
    try {
        const { deviceId, startDate, endDate } = req.query;

        const query = { deviceId };
        if (startDate && endDate) {
            query.timestamp = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const data = await DeviceData.find(query).sort({ timestamp: -1 });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Device Data Logs');

        worksheet.columns = [
            { header: 'Device ID', key: 'deviceId', width: 20 },
            { header: 'Battery Temp (°C)', key: 'batteryTemperature', width: 15 },
            { header: 'Battery SOC (%)', key: 'batterySOC', width: 15 },
            { header: 'Battery Voltage (V)', key: 'batteryVoltage', width: 15 },
            { header: 'Motor Temp (°C)', key: 'motorTemperature', width: 15 },
            { header: 'Motor RPM', key: 'motorRPM', width: 15 },
            { header: 'Wheel RPM', key: 'wheelRPM', width: 15 },
            { header: 'Loss', key: 'loss', width: 12 },
            { header: 'Torque (Nm)', key: 'torque', width: 12 },
            { header: 'Latitude', key: 'gpsLatitude', width: 15 },
            { header: 'Longitude', key: 'gpsLongitude', width: 15 },
            { header: 'Timestamp', key: 'timestamp', width: 25 },
        ];

        data.forEach(item => {
            worksheet.addRow({
                deviceId: item.deviceId,
                batteryTemperature: item.batteryTemperature,
                batterySOC: item.batterySOC,
                batteryVoltage: item.batteryVoltage,
                motorTemperature: item.motorTemperature,
                motorRPM: item.motorRPM,
                wheelRPM: item.wheelRPM,
                loss: item.loss,
                torque: item.torque,
                gpsLatitude: item.gpsLatitude,
                gpsLongitude: item.gpsLongitude,
                timestamp: item.timestamp,
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=DeviceData_${deviceId}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
