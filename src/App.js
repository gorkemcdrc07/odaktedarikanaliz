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
    TextField, // 👈 Buraya eklendi
} from "@mui/material";

import {
    LocalizationProvider,
} from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
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
} from "recharts";

import axios from "axios";
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';



const lineData = [
    { name: 'Ocak', uv: 400 },
    { name: 'Şubat', uv: 300 },
    { name: 'Mart', uv: 500 },
    { name: 'Nisan', uv: 600 },
];

const pieColors = ["#4CAF50", "#D32F2F"];
const spotFiloColors = ["#82ca9d", "#8884d8"];

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


    useEffect(() => {
        const fetchData = async () => {
            try {
                const startDate = new Date(selectedDate);
                startDate.setHours(0, 0, 0, 0);

                const endDate = new Date(selectedDate);
                endDate.setHours(23, 59, 59, 999);

                const response = await axios.post("/api/proxy", {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                    userId: 1,
                });

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
                        ["YURTİÇİ FTL HİZMETLERİ", "FİLO DIŞ YÜk YÖNETİMİ"].includes(order.ServiceName) &&
                        ["FTL HİZMETİ", "FİLO DIŞ YÜk YÖNETİMİ"].includes(order.SubServiceName);

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

        fetchData();
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
    return (
        <Box sx={{ display: "flex", height: "100vh", p: 2, gap: 2 }}>
            <Box sx={{ flex: 3, display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ flex: 1, display: "flex", gap: 2 }}>
                    <Box sx={{ flex: 2, display: "flex", gap: 2 }}>
                        <Card sx={{ flex: 1 }}>
                            <CardContent sx={{ textAlign: "center" }}>
                                <Typography align="center" variant="h6">TALEP / PLANLANAN</Typography>
                                <Typography align="center" variant="h4">{talepPlanlananCount}</Typography>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            dataKey="value"
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            label={({ name, value }) => `${name}: ${value}`}
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card sx={{ flex: 1 }}>
                            <CardContent sx={{ textAlign: "center" }}>
                                <Typography align="center" variant="h6">TEDARİK EDİLEN (TOPLAM)</Typography>
                                <Typography align="center" variant="h4">{spotCount + filoCount}</Typography>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            dataKey="value"
                                            data={spotFiloPieData}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            label={({ name, value }) => `${name}: ${value}`}
                                        >
                                            {spotFiloPieData.map((entry, index) => (
                                                <Cell key={`cell-spotfilo-${index}`} fill={spotFiloColors[index % spotFiloColors.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Box>

                    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                        <Card sx={{ flex: 1 }}>
                            <CardContent>
                                <Typography align="center" variant="h6">SHÖ BASILAN</Typography>
                                <Typography align="center" variant="h4">{shoPrintedCount}</Typography>
                            </CardContent>
                        </Card>

                        <Card sx={{ flex: 1 }}>
                            <CardContent>
                                <Typography align="center" variant="h6">SHÖ BASILMAYAN</Typography>
                                <Typography align="center" variant="h4">{shoNotPrintedCount}</Typography>
                            </CardContent>
                        </Card>
                    </Box>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {/* Üst Kartlar - En Çok Talep Edilen 3 Proje */}
                    <Box sx={{ display: "flex", gap: 2 }}>
                        {topProjects.slice(0, 3).map((project, index) => (
                            <Card key={index} sx={{ flex: 1, minHeight: 260 }}>
                                <CardContent>
                                    <Typography align="center" variant="h6" color="textSecondary">
                                        {project.name}
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie
                                                dataKey="value"
                                                data={[
                                                    { name: "Tedarik Edilen", value: project.supplied },
                                                    { name: "Tedarik Edilemeyen", value: project.unsupplied },
                                                ]}
                                                cx="50%"
                                                cy="100%"
                                                startAngle={180}
                                                endAngle={0}
                                                innerRadius={50}
                                                outerRadius={70}
                                                paddingAngle={2}
                                            >
                                                <Cell fill="#4CAF50" />
                                                <Cell fill="#D32F2F" />
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <Typography align="center" variant="body2" color="primary">
                                        Tedarik Edilen: {project.supplied}
                                    </Typography>
                                    <Typography align="center" variant="body2" color="error">
                                        Edilemeyen: {project.unsupplied}
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>

                    {/* Tüm Projeler */}
                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                        {topProjects.map((project, index) => (
                            <Card key={index} sx={{ flex: 1, minHeight: 260, minWidth: 250 }}>
                                <CardContent>
                                    <Typography align="center" variant="h6">{project.name}</Typography>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie
                                                dataKey="value"
                                                data={[
                                                    { name: "Tedarik Edilen", value: project.supplied },
                                                    { name: "Tedarik Edilemeyen", value: project.unsupplied },
                                                ]}
                                                cx="50%"
                                                cy="100%"
                                                startAngle={180}
                                                endAngle={0}
                                                innerRadius={50}
                                                outerRadius={70}
                                                paddingAngle={2}
                                            >
                                                <Cell fill="#4CAF50" />
                                                <Cell fill="#D32F2F" />
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <Typography align="center" variant="body2" color="primary">
                                        Tedarik Edilen: {project.supplied}
                                    </Typography>
                                    <Typography align="center" variant="body2" color="error">
                                        Edilemeyen: {project.unsupplied}
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))}
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
            </Box>

            <Grid container spacing={2} justifyContent="flex-end" alignItems="flex-start">
                {/* SAĞ SÜTUN: Takvim ve Tablo birlikte */}
                <Grid item xs={12} md={4}>
                    {/* Takvim Kartı */}
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

                        </CardContent>
                    </Card>

                    {/* Tablo Kartı */}
                    <Card
                        sx={{
                            position: "relative",
                            height: 938,
                            overflow: "hidden",
                            p: 2,
                            boxShadow: 3,
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <CardContent
                            sx={{
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                                overflow: "hidden",
                            }}
                        >
                            <TableContainer
                                component={Paper}
                                sx={{
                                    borderRadius: "8px",
                                    overflowY: "auto",
                                    flex: 1,
                                    boxShadow: 2,
                                }}
                            >
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
                                            tableData.map((row, index) => (
                                                <TableRow
                                                    key={index}
                                                    sx={{
                                                        "&:nth-of-type(odd)": { backgroundColor: "#F9FAFB" },
                                                        "&:hover": { backgroundColor: "#E0E0E0" },
                                                    }}
                                                >
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