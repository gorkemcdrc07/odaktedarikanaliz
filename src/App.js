import React, { useEffect, useState } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    TableContainer,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableBody,
    TableCell,
    TextField,
} from "@mui/material";

import {
    LocalizationProvider,
} from "@mui/x-date-pickers";
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Label,
} from "recharts";

import axios from "axios";

function App() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [talepPlanlananCount, setTalepPlanlananCount] = useState(0);
    const [suppliedCount, setSuppliedCount] = useState(0);
    const [spotCount, setSpotCount] = useState(0);
    const [filoCount, setFiloCount] = useState(0);
    const [shoPrintedCount, setShoPrintedCount] = useState(0);
    const [shoNotPrintedCount, setShoNotPrintedCount] = useState(0);
    const [topProjects, setTopProjects] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [top5UnfulfilledProjects, setTop5UnfulfilledProjects] = useState([]);
    const [timeLeft, setTimeLeft] = useState(300); // 5 dakika = 300 saniye

    useEffect(() => {
        const fetchDataAndResetTimer = async () => {
            try {
                const dateStr = new Date(selectedDate).toISOString().split("T")[0];

                const payload = {
                    startDate: `${dateStr}T00:00:00`,
                    endDate: `${dateStr}T23:59:59`,
                    userId: 1,
                };

                const response = await axios.post("https://proxy-server-9yut.onrender.com/api/tmsorders", payload);

                const data = response.data?.Data ?? [];

                const talepPlanlananSet = new Set();
                const suppliedSet = new Set();
                const spotSet = new Set();
                const filoSet = new Set();
                const shoPrintedSet = new Set();
                const shoNotPrintedSet = new Set();
                const projectMap = new Map();

                data.forEach((order) => {
                    const project = order.ProjectName ?? "Bilinmeyen";
                    if (!projectMap.has(project)) {
                        projectMap.set(project, { total: 0, supplied: 0 });
                    }

                    const isValid =
                        order.TMSVehicleRequestDocumentNo &&
                        !order.TMSVehicleRequestDocumentNo.startsWith("BOS") &&
                        ["YURTİÇİ FTL HİZMETLERİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(order.ServiceName) &&
                        ["FTL HİZMETİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(order.SubServiceName);

                    if (isValid) {
                        talepPlanlananSet.add(order.TMSVehicleRequestDocumentNo);

                        const entry = projectMap.get(project);
                        entry.total += 1;

                        if (order.TMSDespatchDocumentNo) {
                            suppliedSet.add(order.TMSVehicleRequestDocumentNo);
                            entry.supplied += 1;

                            if (order.VehicleWorkingName === "SPOT") {
                                spotSet.add(order.TMSVehicleRequestDocumentNo);
                            } else if (["FİLO", "ÖZMAL", "MODERN AMBALAJ FİLO"].includes(order.VehicleWorkingName)) {
                                filoSet.add(order.TMSVehicleRequestDocumentNo);
                            }

                            if (order.IsPrint) {
                                shoPrintedSet.add(order.TMSDespatchDocumentNo);
                            } else {
                                shoNotPrintedSet.add(order.TMSDespatchDocumentNo);
                            }
                        }
                    }
                });

                const sortedProjects = Array.from(projectMap.entries())
                    .sort((a, b) => b[1].total - a[1].total)
                    .slice(0, 3)
                    .map(([name, data]) => ({
                        name,
                        supplied: data.supplied,
                        unsupplied: data.total - data.supplied,
                    }));

                const topUnfulfilled = Array.from(projectMap.entries())
                    .map(([name, data]) => ({
                        name,
                        unsupplied: data.total - data.supplied,
                    }))
                    .filter(project => project.unsupplied > 0)
                    .sort((a, b) => b.unsupplied - a.unsupplied)
                    .slice(0, 5);

                setTalepPlanlananCount(talepPlanlananSet.size);
                setSuppliedCount(suppliedSet.size);
                setSpotCount(spotSet.size);
                setFiloCount(filoSet.size);
                setShoPrintedCount(shoPrintedSet.size);
                setShoNotPrintedCount(shoNotPrintedSet.size);
                setTopProjects(sortedProjects);
                setTop5UnfulfilledProjects(topUnfulfilled);

                const userMap = new Map();
                data.forEach((order) => {
                    if (!order.TMSDespatchCreatedBy) return;

                    if (!userMap.has(order.TMSDespatchCreatedBy)) {
                        userMap.set(order.TMSDespatchCreatedBy, {
                            TMSDespatchCreatedBy: order.TMSDespatchCreatedBy,
                            Count: 0,
                            DoluSefer: 0,
                            BosSefer: 0
                        });
                    }

                    const userEntry = userMap.get(order.TMSDespatchCreatedBy);
                    userEntry.Count += 1;

                    if (
                        order.TMSVehicleRequestDocumentNo &&
                        !order.TMSVehicleRequestDocumentNo.startsWith("BOS")
                    ) {
                        userEntry.DoluSefer += 1;
                    } else {
                        userEntry.BosSefer += 1;
                    }
                });

                setTableData(Array.from(userMap.values()));

            } catch (error) {
                console.error("API verisi alınamadı:", error);
            }
        };

        // Geri sayım timer'ı
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev === 0) {
                    fetchDataAndResetTimer(); // Veriyi çek
                    return 300; // Geri sayımı 5 dakikadan başlat
                }
                return prev - 1;
            });
        }, 1000); // Her saniye bir kez güncellenir

        // Başlangıçta veriyi çek
        fetchDataAndResetTimer();

        return () => clearInterval(timer); // Component unmount olduğunda timer'ı temizle
    }, [selectedDate]);

    const unsuppliedCount = talepPlanlananCount - suppliedCount;

    const pieData = [
        { name: "Tedarik Edilen", value: suppliedCount },
        { name: "Tedarik Edilemeyen", value: unsuppliedCount },
    ];

    const spotFiloPieData = [
        { name: "SPOT", value: spotCount },
        { name: "FİLO", value: filoCount },
    ];

    // Geri sayım formatı
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <Box sx={{ display: "flex", height: "100vh", p: 2, gap: 2 }}>
            <Box sx={{ flex: 3, display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ flex: 1, display: "flex", gap: 2 }}>
                    <Box sx={{ flex: 2, display: "flex", gap: 2 }}>
                        <Card
                            sx={{
                                flex: 1,
                                borderRadius: 3,
                                background: "#ffffff",
                                boxShadow: "0 6px 15px rgba(0, 0, 0, 0.1)",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                p: 3,
                            }}
                        >
                            <CardContent sx={{ textAlign: "center" }}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 600,
                                        letterSpacing: 1,
                                        textTransform: "uppercase",
                                        color: "#2c3e50",
                                        mb: 1,
                                    }}
                                >
                                    TALEP / PLANLANAN
                                </Typography>
                                <Typography
                                    variant="h3"
                                    sx={{
                                        fontWeight: 800,
                                        color: "#2980b9",
                                        mb: 2,
                                        textShadow: "0 2px 4px rgba(41, 128, 185, 0.3)",
                                    }}
                                >
                                    {talepPlanlananCount}
                                </Typography>
                                <ResponsiveContainer width="100%" height={260}>
                                    <PieChart>
                                        <Pie
                                            dataKey="value"
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={90}
                                            label={({ name, value }) => `${name}: ${value}`}
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={index % 2 === 0 ? "#2ecc71" : "#e74c3c"}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <Box sx={{ mt: 2, textAlign: "center" }}>
                                    {pieData.map((entry, index) => (
                                        <Typography
                                            key={index}
                                            variant="body2"
                                            sx={{
                                                fontWeight: 700,
                                                fontSize: "1.1rem",
                                                color: index % 2 === 0 ? "#2ecc71" : "#e74c3c",
                                                mb: 1,
                                            }}
                                        >
                                            {entry.name}: {entry.value} ({((entry.value / talepPlanlananCount) * 100).toFixed(1)}%)
                                        </Typography>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>

                        <Card
                            sx={{
                                flex: 1,
                                borderRadius: 3,
                                background: "#FFFFFF",
                                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                p: 2,
                            }}
                        >
                            <CardContent sx={{ textAlign: "center" }}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 600,
                                        letterSpacing: 0.5,
                                        textTransform: "uppercase",
                                        color: "#333333",
                                        mb: 1,
                                    }}
                                >
                                    TEDARİK EDİLEN (TOPLAM)
                                </Typography>
                                <Typography
                                    variant="h3"
                                    sx={{
                                        fontWeight: 800,
                                        color: "#2E7D32",
                                        mb: 2,
                                        textShadow: "0 0 6px rgba(46, 125, 50, 0.15)",
                                    }}
                                >
                                    {spotCount + filoCount}
                                </Typography>
                                <ResponsiveContainer width="100%" height={260}>
                                    <PieChart>
                                        <Pie
                                            dataKey="value"
                                            data={spotFiloPieData}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={90}
                                            label={({ name, value }) => `${name}: ${value}`}
                                        >
                                            {spotFiloPieData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-spotfilo-${index}`}
                                                    fill={index % 2 === 0 ? "#2ecc71" : "#6495ed"}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <Box sx={{ mt: 2, textAlign: "center" }}>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight: 700,
                                            fontSize: "1.2rem",
                                            color: "#2ecc71",
                                            mb: 1,
                                        }}
                                    >
                                        SPOT: {spotCount} ({((spotCount / (spotCount + filoCount)) * 100).toFixed(1)}%)
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight: 700,
                                            fontSize: "1.2rem",
                                            color: "#6495ed",
                                            mb: 1,
                                        }}
                                    >
                                        FİLO: {filoCount} ({((filoCount / (spotCount + filoCount)) * 100).toFixed(1)}%)
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>

                    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                        <Card
                            sx={{
                                flex: 1,
                                border: "2px solid #4CAF50",
                                background: "linear-gradient(135deg, #81C784, #388E3C)",
                                color: "#FAFAFA",
                                boxShadow: "0 4px 20px rgba(76, 175, 80, 0.5)",
                                borderRadius: 3,
                                p: 2,
                            }}
                        >
                            <CardContent>
                                <Typography
                                    align="center"
                                    variant="h6"
                                    sx={{
                                        fontWeight: 600,
                                        textTransform: "uppercase",
                                        textShadow: "0 0 5px rgba(0,0,0,0.3)",
                                    }}
                                >
                                    SHÖ BASILAN
                                </Typography>
                                <Typography
                                    align="center"
                                    variant="h3"
                                    sx={{
                                        fontWeight: 800,
                                        mt: 1,
                                        textShadow: "0 0 8px rgba(0,0,0,0.3)",
                                    }}
                                >
                                    {shoPrintedCount}
                                </Typography>
                            </CardContent>
                        </Card>

                        <Card
                            sx={{
                                flex: 1,
                                border: "2px solid #F44336",
                                background: "linear-gradient(135deg, #EF9A9A, #C62828)",
                                color: "#FAFAFA",
                                boxShadow: "0 4px 20px rgba(244, 67, 54, 0.5)",
                                borderRadius: 3,
                                p: 2,
                            }}
                        >
                            <CardContent>
                                <Typography
                                    align="center"
                                    variant="h6"
                                    sx={{
                                        fontWeight: 600,
                                        textTransform: "uppercase",
                                        textShadow: "0 0 5px rgba(0,0,0,0.3)",
                                    }}
                                >
                                    SHÖ BASILMAYAN
                                </Typography>
                                <Typography
                                    align="center"
                                    variant="h3"
                                    sx={{
                                        fontWeight: 800,
                                        mt: 1,
                                        textShadow: "0 0 8px rgba(0,0,0,0.3)",
                                    }}
                                >
                                    {shoNotPrintedCount}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <Box sx={{ display: "flex", gap: 3, justifyContent: "space-between", flexWrap: "wrap" }}>
                        {topProjects.slice(0, 3).map((project, index) => {
                            const total = project.supplied + project.unsupplied;
                            return (
                                <Card
                                    key={index}
                                    sx={{
                                        flex: "1 1 30%",
                                        minWidth: 250,
                                        maxWidth: "calc(33.33% - 16px)",
                                        marginBottom: 3,
                                        boxShadow: 3,
                                        borderRadius: 2,
                                        backgroundColor: "white",
                                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                                        "&:hover": {
                                            transform: "scale(1.05)",
                                            boxShadow: 6,
                                        },
                                    }}
                                >
                                    <CardContent sx={{ padding: 3 }}>
                                        <Typography align="center" variant="h6" color="textSecondary" fontWeight="bold" gutterBottom>
                                            {project.name}
                                        </Typography>
                                        <ResponsiveContainer width="100%" height={250}>
                                            <PieChart>
                                                <Pie
                                                    dataKey="value"
                                                    data={[
                                                        { name: "Tedarik Edilen", value: project.supplied },
                                                        { name: "Tedarik Edilemeyen", value: project.unsupplied },
                                                    ]}
                                                    cx="50%"
                                                    cy="50%"
                                                    startAngle={180}
                                                    endAngle={0}
                                                    innerRadius={60}
                                                    outerRadius={90}
                                                    paddingAngle={4}
                                                >
                                                    <Cell fill="#2ecc71" />
                                                    <Cell fill="#D32F2F" />
                                                </Pie>
                                                <Label
                                                    value={total}
                                                    position="center"
                                                    fontSize={20}
                                                    fontWeight="bold"
                                                    fill="#000"
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <Typography align="center" variant="body1" color="primary" fontSize={18} mt={2}>
                                            Tedarik Edilen: {project.supplied}
                                        </Typography>
                                        <Typography align="center" variant="body1" color="error" fontSize={18}>
                                            Edilemeyen: {project.unsupplied}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </Box>
                </Box>

                <Card sx={{ flex: 1 }}>
                    <CardContent>
                        <Typography align="center" variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                            EN ÇOK TEDARİK EDİLEMEYEN 5 PROJE
                        </Typography>
                        {top5UnfulfilledProjects.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={top5UnfulfilledProjects}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="unsupplied"
                                        stroke="#D32F2F"
                                        strokeWidth={3}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <Box sx={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Typography color="textSecondary">
                                    Bu tarihte tedarik edilemeyen proje bulunamadı.
                                </Typography>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Box>

            <Grid container spacing={2} justifyContent="flex-end" alignItems="flex-start">
                <Grid item xs={12} md={4}>
                    <Card sx={{ p: 2, boxShadow: 3, mb: 2 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2, textAlign: "center" }}>
                                Tarih Seçimi
                            </Typography>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <StaticDatePicker
                                    displayStaticWrapperAs="desktop"
                                    value={selectedDate}
                                    onChange={(newValue) => setSelectedDate(newValue)}
                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                />
                            </LocalizationProvider>

                            {/* Countdown Timer inside the card */}
                            <Box sx={{ textAlign: "center", mt: 3 }}>
                                <Typography
                                    variant="h4"
                                    sx={{
                                        color: "#FF5733",
                                        fontWeight: 700,
                                        textShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
                                    }}
                                >
                                    {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>

                    <Card sx={{ position: "relative", height: 938, overflow: "hidden", p: 2, boxShadow: 3, display: "flex", flexDirection: "column" }}>
                        <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                            <TableContainer component={Paper} sx={{ borderRadius: "8px", overflowY: "auto", flex: 1, boxShadow: 2 }}>
                                <Table size="medium" stickyHeader>
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: "#F5F5F5" }}>
                                            <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "18px", color: "#333" }}>
                                                SEFER AÇAN KULLANICI
                                            </TableCell>
                                            <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "18px", color: "#333" }}>
                                                TOPLAM AÇTIĞI SEFER
                                            </TableCell>
                                            <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "18px", color: "#333" }}>
                                                DOLU SEFER
                                            </TableCell>
                                            <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "18px", color: "#333" }}>
                                                BOŞ SEFER
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {tableData.length > 0 ? (
                                            tableData
                                                .sort((a, b) => b.Count - a.Count) // Toplam açılan seferi en büyükten küçüğe sıralıyoruz
                                                .map((row, index) => (
                                                    <TableRow key={index} sx={{ "&:nth-of-type(odd)": { backgroundColor: "#F9FAFB" }, "&:hover": { backgroundColor: "#E0E0E0" } }}>
                                                        <TableCell align="center" sx={{ fontSize: "16px", fontWeight: "bold", color: "#424242" }}>
                                                            {row.TMSDespatchCreatedBy}
                                                        </TableCell>
                                                        <TableCell align="center" sx={{ fontSize: "16px", fontWeight: "bold", color: "#000" }}>
                                                            {row.Count}
                                                        </TableCell>
                                                        <TableCell align="center" sx={{ fontSize: "16px", fontWeight: "bold", color: "#4CAF50" }}>
                                                            {row.DoluSefer}
                                                        </TableCell>
                                                        <TableCell align="center" sx={{ fontSize: "16px", fontWeight: "bold", color: "#D32F2F" }}>
                                                            {row.BosSefer}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center">
                                                    Bugüne ait veri bulunamadı...
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>

                </Grid>
            </Grid>
        </Box>
    );
}

export default App;
