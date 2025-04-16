import React, { useEffect, useState } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    TextField,
} from "@mui/material";
import {
    LocalizationProvider,
    StaticDatePicker
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";

import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from "recharts";

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Layout from "./components/Layout";

const ZamanindaTedarikAnalizi = () => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [onTimeRate, setOnTimeRate] = useState(0);
    const [delayRate, setDelayRate] = useState(0);
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        const fetchData = async () => {
            const dateStr = new Date(selectedDate).toISOString().split("T")[0];
            const payload = {
                startDate: `${dateStr}T00:00:00`,
                endDate: `${dateStr}T23:59:59`,
                userId: 1,
            };

            try {
                const res = await axios.post("https://proxy-server-9yut.onrender.com/api/tmsorders", payload);
                const result = res.data?.Data ?? [];
                setData(result);
                setFilteredData(result);
                calculateRates(result);
            } catch (err) {
                console.error("Veri alınamadı", err);
            }
        };

        fetchData();
    }, [selectedDate]);

    const calculateRates = (data) => {
        const total = data.length;
        const onTime = data.filter(d =>
            d.OrderDate &&
            d.PickupDate &&
            new Date(d.OrderDate).toISOString().split("T")[0] ===
            new Date(d.PickupDate).toISOString().split("T")[0]
        ).length;
        const delay = total - onTime;

        setOnTimeRate(total === 0 ? 0 : ((onTime / total) * 100).toFixed(1));
        setDelayRate(total === 0 ? 0 : ((delay / total) * 100).toFixed(1));
    };

    const pieData = [
        { name: "Zamanında", value: parseFloat(onTimeRate) },
        { name: "Gecikmeli", value: parseFloat(delayRate) },
    ];

    const pieColors = ["#4caf50", "#f44336"];

    const trendData = [
        { date: "01.04", onTime: 4 },
        { date: "02.04", onTime: 6 },
        { date: "03.04", onTime: 5 },
        { date: "04.04", onTime: 7 },
        { date: "05.04", onTime: 3 },
    ];

    const columns = [
        { field: "ProjectName", headerName: "Proje", width: 220 },
        { field: "OrderDate", headerName: "Sipariş Tarihi", width: 150 },
        { field: "PickupDate", headerName: "Alım Tarihi", width: 150 },
        { field: "OrderCreatedBy", headerName: "Oluşturan Kişi", width: 180 },
        { field: "VehicleWorkingName", headerName: "Araç Tipi", width: 130 },
        {
            field: "Delay",
            headerName: "Gecikme (gün)",
            width: 150,
            valueGetter: (params) => {
                if (!params?.row?.OrderDate || !params?.row?.PickupDate) return "-";
                const order = new Date(params.row.OrderDate);
                const pickup = new Date(params.row.PickupDate);
                const diff = (pickup - order) / (1000 * 60 * 60 * 24);
                return diff.toFixed(1);
            }
        },
    ];

    return (
        <Layout>
            <Box sx={{ px: 3, py: 3 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Zamanında Tedarik Analizi
                </Typography>

                <Grid container spacing={3}> {/* Adjusted spacing to create space between cards */}
                    {/* 1. Satır: Takvim + 3 Kart */}
                    <Grid item xs={12} md={3}>
                        <Card sx={{ height: "100%" }}>
                            <CardContent>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <StaticDatePicker
                                        displayStaticWrapperAs="desktop"
                                        value={selectedDate}
                                        onChange={(newValue) => setSelectedDate(newValue)}
                                        renderInput={(params) => <TextField {...params} fullWidth />}
                                    />
                                </LocalizationProvider>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={cardStyle("#43cea2", "#185a9d")}>
                            <CardContent sx={contentStyle}>
                                <CheckCircleIcon sx={{ fontSize: 48, mb: 1 }} />
                                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                                    Zamanında Tedarik
                                </Typography>
                                <Typography variant="h2" sx={{ fontWeight: "bold", lineHeight: 1.2 }}>
                                    {onTimeRate}%
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                                    Bugünkü siparişlerin {onTimeRate}%’i zamanında alındı.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={cardStyle("#f44336", "#e57373")}>
                            <CardContent sx={contentStyle}>
                                <Typography sx={{ fontSize: 48, mb: 1 }}>⚠️</Typography>
                                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                                    Gecikmeli Tedarik
                                </Typography>
                                <Typography variant="h2" sx={{ fontWeight: "bold", lineHeight: 1.2 }}>
                                    {delayRate}%
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                                    Bugünkü siparişlerin {delayRate}%’i zamanında alınamadı.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    {/* 3. Satır: DataGrid */}
                    <Grid item xs={12}>
                        <Card sx={{ width: '100%' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Geciken Seferler</Typography>
                                <Box sx={{ height: 960, width: '120%' }}>
                                    <DataGrid
                                        rows={filteredData.filter(d =>
                                            d?.TMSOrderId &&
                                            d?.OrderDate &&
                                            d?.PickupDate &&
                                            new Date(d.OrderDate).toISOString().split("T")[0] !==
                                            new Date(d.PickupDate).toISOString().split("T")[0]
                                        )}
                                        columns={columns}
                                        getRowId={(row) => row.TMSOrderId}
                                        pageSize={100}
                                        rowsPerPageOptions={[25, 50, 100]}
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                </Grid>
            </Box>
        </Layout>
    );
};

// Stil fonksiyonları
const cardStyle = (startColor, endColor) => ({
    background: `linear-gradient(135deg, ${startColor}, ${endColor})`,
    color: "white",
    borderRadius: 4,
    boxShadow: 5,
    minHeight: 230,
    display: "flex",
    flexDirection: "column",
    height: "100%",
});

const contentStyle = {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    p: 3,
};

export default ZamanindaTedarikAnalizi;
