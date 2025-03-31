import React, { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
} from "@mui/material";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    LabelList,
    ResponsiveContainer,
} from "recharts";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";
import trLocale from "date-fns/locale/tr";

function App() {
    // Buraya kadar olan her şey, DashboardNew'den taşındı
    const [tableData, setTableData] = useState([]);
    const [shoPrintedCount, setShoPrintedCount] = useState(0);
    const [shoNotPrintedCount, setShoNotPrintedCount] = useState(0);
    const [uniqueSpotCount, setUniqueSpotCount] = useState(0);
    const [uniqueFiloCount, setUniqueFiloCount] = useState(0);
    const [totalSupplied, setTotalSupplied] = useState(0);
    const [unsupplied, setUnsupplied] = useState(0);
    const [topProjectName, setTopProjectName] = useState("Bilinmeyen Proje");
    const [topProjectSuppliedCount, setTopProjectSuppliedCount] = useState(0);
    const [topProjectUnsuppliedCount, setTopProjectUnsuppliedCount] = useState(0);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const [secondTopProjectName, setSecondTopProjectName] = useState("Bilinmeyen Proje");
    const [secondTopProjectSuppliedCount, setSecondTopProjectSuppliedCount] = useState(0);
    const [secondTopProjectUnsuppliedCount, setSecondTopProjectUnsuppliedCount] = useState(0);

    const [thirdTopProjectName, setThirdTopProjectName] = useState("Bilinmeyen Proje");
    const [thirdTopProjectSuppliedCount, setThirdTopProjectSuppliedCount] = useState(0);
    const [thirdTopProjectUnsuppliedCount, setThirdTopProjectUnsuppliedCount] = useState(0);

    const [fourthTopProjectName, setFourthTopProjectName] = useState("Bilinmeyen Proje");
    const [fourthTopProjectSuppliedCount, setFourthTopProjectSuppliedCount] = useState(0);
    const [fourthTopProjectUnsuppliedCount, setFourthTopProjectUnsuppliedCount] = useState(0);

    const [fifthTopProjectName, setFifthTopProjectName] = useState("");
    const [fifthTopProjectSuppliedCount, setFifthTopProjectSuppliedCount] = useState(0);
    const [fifthTopProjectUnsuppliedCount, setFifthTopProjectUnsuppliedCount] = useState(0);

    const [sixthTopProjectName, setSixthTopProjectName] = useState("");
    const [sixthTopProjectSuppliedCount, setSixthTopProjectSuppliedCount] = useState(0);
    const [sixthTopProjectUnsuppliedCount, setSixthTopProjectUnsuppliedCount] = useState(0);

    const [top5UnfulfilledLabels, setTop5UnfulfilledLabels] = useState([]);
    const [top5UnfulfilledData, setTop5UnfulfilledData] = useState([]);

    const [talepPlanlananCount, setTalepPlanlananCount] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!selectedDate) return;

                const selectedISO = selectedDate.toISOString().split("T")[0];
                const startDate = `${selectedISO}T00:00:00`;
                const endDate = `${selectedISO}T23:59:59`;

                const response = await axios.post("/proxy/tmsorders", {
                    startDate,
                    endDate,
                    userId: 1,
                });

                if (response.data && response.data.Data) {
                    const data = response.data.Data;

                    const projectNameCounts = data.reduce((acc, curr) => {
                        if (!curr.ProjectName || curr.ProjectName === "AVANSAS DEDİKE") return acc;
                        acc[curr.ProjectName] = (acc[curr.ProjectName] || 0) + 1;
                        return acc;
                    }, {});

                    const sortedProjects = Object.entries(projectNameCounts)
                        .sort((a, b) => b[1] - a[1])
                        .map(entry => entry[0]);

                    const setProjectData = (projectName, nameSetter, suppliedSetter, unsuppliedSetter) => {
                        nameSetter(projectName);
                        const projectOrders = data.filter(order => order.ProjectName === projectName);
                        const supplied = projectOrders.filter(order =>
                            order.TMSDespatchDocumentNo?.startsWith("SFR") &&
                            (
                                order.VehicleWorkingName === "SPOT" ||
                                ["FİLO", "ÖZMAL", "MODERN AMBALAJ FİLO"].includes(order.VehicleWorkingName)
                            )
                        );
                        suppliedSetter(supplied.length);

                        const unsupplied = projectOrders.filter(order =>
                            !order.TMSDespatchDocumentNo &&
                            order.TMSVehicleRequestDocumentNo?.startsWith("VP")
                        );
                        unsuppliedSetter(unsupplied.length);
                    };

                    setProjectData(sortedProjects[0], setTopProjectName, setTopProjectSuppliedCount, setTopProjectUnsuppliedCount);
                    setProjectData(sortedProjects[1], setSecondTopProjectName, setSecondTopProjectSuppliedCount, setSecondTopProjectUnsuppliedCount);
                    setProjectData(sortedProjects[2], setThirdTopProjectName, setThirdTopProjectSuppliedCount, setThirdTopProjectUnsuppliedCount);
                    setProjectData(sortedProjects[3], setFourthTopProjectName, setFourthTopProjectSuppliedCount, setFourthTopProjectUnsuppliedCount);
                    setProjectData(sortedProjects[4], setFifthTopProjectName, setFifthTopProjectSuppliedCount, setFifthTopProjectUnsuppliedCount);
                    setProjectData(sortedProjects[5], setSixthTopProjectName, setSixthTopProjectSuppliedCount, setSixthTopProjectUnsuppliedCount);

                    const shoPrinted = new Set(
                        data
                            .filter(order =>
                                order.TMSDespatchDocumentNo?.startsWith("SFR") &&
                                order.IsPrint === true &&
                                ["YURTİÇİ FTL HİZMETLERİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(order.ServiceName) &&
                                ["FTL HİZMETİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(order.SubServiceName)
                            )
                            .map(o => o.TMSDespatchDocumentNo)
                    );
                    setShoPrintedCount(shoPrinted.size);

                    const shoNotPrinted = new Set(
                        data
                            .filter(order =>
                                order.TMSDespatchDocumentNo?.startsWith("SFR") &&
                                order.IsPrint === false &&
                                ["YURTİÇİ FTL HİZMETLERİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(order.ServiceName) &&
                                ["FTL HİZMETİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(order.SubServiceName)
                            )
                            .map(o => o.TMSDespatchDocumentNo)
                    );
                    setShoNotPrintedCount(shoNotPrinted.size);

                    const spotOrders = data.filter(order =>
                        order.TMSDespatchDocumentNo &&
                        order.TMSDespatchDocumentNo.startsWith("SFR") &&
                        order.VehicleWorkingName === "SPOT" &&
                        order.ServiceName === "YURTİÇİ FTL HİZMETLERİ" &&
                        order.SubServiceName === "FTL HİZMETİ"
                    );
                    const uniqueSpotDespatchSet = new Set(spotOrders.map(o => o.TMSDespatchDocumentNo));
                    setUniqueSpotCount(uniqueSpotDespatchSet.size);

                    const filoOrders = data.filter(order =>
                        order.TMSDespatchDocumentNo &&
                        order.TMSDespatchDocumentNo.startsWith("SFR") &&
                        ["FİLO", "ÖZMAL", "MODERN AMBALAJ FİLO"].includes(order.VehicleWorkingName) &&
                        ["YURTİÇİ FTL HİZMETLERİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(order.ServiceName) &&
                        ["FTL HİZMETİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(order.SubServiceName)
                    );
                    const uniqueFiloDespatchSet = new Set(filoOrders.map(o => o.TMSDespatchDocumentNo));
                    setUniqueFiloCount(uniqueFiloDespatchSet.size);

                    const combinedDespatchSet = new Set([...uniqueSpotDespatchSet, ...uniqueFiloDespatchSet]);
                    setTotalSupplied(combinedDespatchSet.size);

                    const talepPlanlananSet = new Set(
                        data
                            .filter(order =>
                                order.TMSVehicleRequestDocumentNo &&
                                !order.TMSVehicleRequestDocumentNo.startsWith("BOS") &&
                                ["YURTİÇİ FTL HİZMETLERİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(order.ServiceName) &&
                                ["FTL HİZMETİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(order.SubServiceName)
                            )
                            .map(order => order.TMSVehicleRequestDocumentNo)
                    );
                    setTalepPlanlananCount(talepPlanlananSet.size);

                    const calculatedUnsupplied = talepPlanlananSet.size - combinedDespatchSet.size;
                    setUnsupplied(calculatedUnsupplied < 0 ? 0 : calculatedUnsupplied);

                    const unfulfilledOrders = data.filter(order =>
                        !order.TMSDespatchDocumentNo &&
                        order.TMSVehicleRequestDocumentNo?.startsWith("VP") &&
                        ["YURTİÇİ FTL HİZMETLERİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(order.ServiceName) &&
                        ["FTL HİZMETİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(order.SubServiceName)
                    );

                    const unfulfilledProjectNameCounts = unfulfilledOrders.reduce((acc, order) => {
                        if (!order.ProjectName || order.ServiceName === "DEDİKE ARAÇ HİZMETLERİ" || order.ProjectName === "AVANSAS DEDİKE") return acc;
                        acc[order.ProjectName] = (acc[order.ProjectName] || 0) + 1;
                        return acc;
                    }, {});

                    const top5UnfulfilledProjects = Object.entries(unfulfilledProjectNameCounts)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5);

                    const labels = top5UnfulfilledProjects.map(p => p[0]);
                    const dataCounts = top5UnfulfilledProjects.map(p => p[1]);

                    setTop5UnfulfilledLabels(labels);
                    setTop5UnfulfilledData(dataCounts);

                    const uniqueDocsMap = new Map();
                    data.forEach(order => {
                        const docNo = order.TMSVehicleRequestDocumentNo?.trim().toUpperCase();
                        if (!docNo || uniqueDocsMap.has(docNo)) return;
                        uniqueDocsMap.set(docNo, order);
                    });

                    const grouped = {};
                    for (const order of uniqueDocsMap.values()) {
                        const user = order.TMSDespatchCreatedBy?.trim();
                        const doc = order.TMSVehicleRequestDocumentNo?.trim().toUpperCase();
                        if (!user || !doc) continue;

                        if (!grouped[user]) {
                            grouped[user] = { TMSDespatchCreatedBy: user, UniqueDocsCount: 0, BosSefer: 0, DoluSefer: 0 };
                        }

                        grouped[user].UniqueDocsCount += 1;
                        if (doc.startsWith("BOS")) grouped[user].BosSefer += 1;
                        else if (doc.startsWith("VP")) grouped[user].DoluSefer += 1;
                    }

                    Object.values(grouped).forEach(user => {
                        user.Count = user.BosSefer + user.DoluSefer;
                    });

                    const finalData = Object.values(grouped).sort((a, b) => b.Count - a.Count);
                    setTableData(finalData);
                }
            } catch (error) {
                console.error("Veri çekme hatası:", error);
            }
        };

        fetchData();
    }, [selectedDate]);

    // ⏭ Devamında render edilen tüm Grid, PieChart, Table ve Card bileşenlerini buraya ekleyeceğim.

    return (
        <Box sx={{ p: 2 }}>
            {/* Buraya DashboardNew'de render edilen tüm Grid ve Chart component'lerini getireceğim */}
            {/* Onay verirsen, hepsini tek tek burada devam ettireyim mi? */}
        </Box>
    );
}

export default App;
