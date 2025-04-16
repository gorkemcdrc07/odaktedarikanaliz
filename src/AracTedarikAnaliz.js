import React, { useState, useEffect } from "react";
import {
    Box,
    Grid,
    Card,
    Typography,
    FormControl,
    Select,
    MenuItem,
} from "@mui/material";
import Layout from "./components/Layout";
import axios from "axios";

function AracTedarikAnaliz() {
    const [tarihAraligi, setTarihAraligi] = useState("BUGÜN");
    const [musteriler, setMusteriler] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [rawData, setRawData] = useState([]);
    const [selectedMusteri, setSelectedMusteri] = useState(null);
    const [sortOption, setSortOption] = useState("");

    const getDateRange = (range) => {
        const today = new Date();
        let startDate = new Date(today);
        let endDate = new Date(today);

        switch (range) {
            case "BUGÜN":
                startDate = endDate = today;
                break;
            case "DÜNDEN BERİ":
                startDate.setDate(today.getDate() - 1);
                endDate = today;
                break;
            case "SON 3 GÜN":
                startDate.setDate(today.getDate() - 3);
                endDate = today;
                break;
            case "SON 1 HAFTA":
                startDate.setDate(today.getDate() - 7);
                endDate = today;
                break;
            case "SON 2 HAFTA":
                startDate.setDate(today.getDate() - 14);
                endDate = today;
                break;
            default:
                break;
        }

        return {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
        };
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const { startDate, endDate } = getDateRange(tarihAraligi);
                const payload = { startDate, endDate, userId: 1 };
                const response = await axios.post("https://proxy-server-9yut.onrender.com/api/tmsorders", payload);
                const data = response.data?.Data ?? [];
                setRawData(data);

                if (data && data.length > 0) {
                    const projectNames = data.map((order) => order.ProjectName);
                    setMusteriler([...new Set(projectNames)]);
                }
            } catch (error) {
                console.error("Veri çekilirken hata oluştu:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [tarihAraligi]);

    const getSortedMusteriler = () => {
        const projectStats = musteriler.map(musteri => {
            const projectOrders = rawData.filter(o => o.ProjectName === musteri);
            const totalRequested = projectOrders.filter(o =>
                o.TMSVehicleRequestDocumentNo &&
                !o.TMSVehicleRequestDocumentNo.startsWith("BOS") &&
                ["YURTİÇİ FTL HİZMETLERİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(o.ServiceName) &&
                ["FTL HİZMETİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(o.SubServiceName)
            ).length;

            const totalSupplied = new Set(
                projectOrders.filter(o =>
                    o.TMSDespatchDocumentNo?.startsWith("SFR") &&
                    (
                        (o.VehicleWorkingName === "SPOT" && o.ServiceName === "YURTİÇİ FTL HİZMETLERİ" && o.SubServiceName === "FTL HİZMETİ") ||
                        (["FİLO", "ÖZMAL", "MODERN AMBALAJ FİLO"].includes(o.VehicleWorkingName) &&
                            ["YURTİÇİ FTL HİZMETLERİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(o.ServiceName) &&
                            ["FTL HİZMETİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(o.SubServiceName))
                    )
                ).map(o => o.TMSDespatchDocumentNo)
            ).size;

            return {
                musteri,
                totalRequested,
                totalSupplied,
                totalUnsupplied: totalRequested - totalSupplied,
            };
        });

        switch (sortOption) {
            case "requested":
                return projectStats.sort((a, b) => b.totalRequested - a.totalRequested).map(p => p.musteri);
            case "supplied":
                return projectStats.sort((a, b) => b.totalSupplied - a.totalSupplied).map(p => p.musteri);
            case "unsupplied":
                return projectStats.sort((a, b) => b.totalUnsupplied - a.totalUnsupplied).map(p => p.musteri);
            default:
                return musteriler;
        }
    };

    const sortedAndFilteredMusteriler = getSortedMusteriler().filter(musteri =>
        musteri?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredData = selectedMusteri
        ? rawData.filter(o => o.ProjectName === selectedMusteri)
        : rawData;

    const totalRequested = filteredData.filter(o =>
        o.TMSVehicleRequestDocumentNo &&
        !o.TMSVehicleRequestDocumentNo.startsWith("BOS") &&
        ["YURTİÇİ FTL HİZMETLERİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(o.ServiceName) &&
        ["FTL HİZMETİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(o.SubServiceName)
    ).length;

    const totalSuppliedSet = new Set(
        filteredData.filter(o =>
            o.TMSDespatchDocumentNo?.startsWith("SFR") &&
            (
                (o.VehicleWorkingName === "SPOT" && o.ServiceName === "YURTİÇİ FTL HİZMETLERİ" && o.SubServiceName === "FTL HİZMETİ") ||
                (["FİLO", "ÖZMAL", "MODERN AMBALAJ FİLO"].includes(o.VehicleWorkingName) &&
                    ["YURTİÇİ FTL HİZMETLERİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(o.ServiceName) &&
                    ["FTL HİZMETİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(o.SubServiceName))
            )
        ).map(o => o.TMSDespatchDocumentNo)
    );

    const totalSupplied = totalSuppliedSet.size;
    const totalSpot = new Set(
        filteredData.filter(o =>
            o.TMSDespatchDocumentNo?.startsWith("SFR") &&
            o.VehicleWorkingName === "SPOT" &&
            o.ServiceName === "YURTİÇİ FTL HİZMETLERİ" &&
            o.SubServiceName === "FTL HİZMETİ"
        ).map(o => o.TMSDespatchDocumentNo)
    ).size;

    const totalFilo = new Set(
        filteredData.filter(o =>
            o.TMSDespatchDocumentNo?.startsWith("SFR") &&
            ["FİLO", "ÖZMAL", "MODERN AMBALAJ FİLO"].includes(o.VehicleWorkingName) &&
            ["YURTİÇİ FTL HİZMETLERİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(o.ServiceName) &&
            ["FTL HİZMETİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(o.SubServiceName)
        ).map(o => o.TMSDespatchDocumentNo)
    ).size;

    const totalUnsupplied = totalRequested - totalSupplied;
    const supplyPercentage = totalRequested > 0 ? ((totalSupplied / totalRequested) * 100).toFixed(1) : 0;

    const cardData = [
        { title: "TOPLAM TALEP EDİLEN", value: totalRequested, bg: "linear-gradient(135deg, #2196F3 0%, #E3F2FD 100%)" },
        { title: "TOPLAM TEDARİK EDİLEN", value: totalSupplied, bg: "linear-gradient(135deg, #4CAF50 0%, #E8F5E9 100%)" },
        { title: "TEDARİK EDİLEN SPOT", value: totalSpot, bg: "linear-gradient(135deg, #FF9800 0%, #FFF3E0 100%)" },
        { title: "TEDARİK EDİLEN FİLO", value: totalFilo, bg: "linear-gradient(135deg, #9C27B0 0%, #F3E5F5 100%)" },
        { title: "TEDARİK EDİLEMEYEN", value: totalUnsupplied, bg: "linear-gradient(135deg, #F44336 0%, #FFEBEE 100%)" },
        { title: "TEDARİK YÜZDESİ", value: `${supplyPercentage}%`, bg: "linear-gradient(135deg, #00BCD4 0%, #E0F7FA 100%)" },
    ];

    return (
        <Layout>
            <Box sx={{ width: "100%", height: "100vh", px: 3, py: 4 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Box sx={{ display: "flex", gap: 3 }}>
                            <Box sx={{ width: 500 }}>
                                <Box sx={{ mb: 4 }}>
                                    <Typography variant="h6" fontWeight="bold" mb={1}>
                                        TARİH ARALIĞI
                                    </Typography>
                                    <FormControl fullWidth>
                                        <Select
                                            value={tarihAraligi}
                                            onChange={(e) => setTarihAraligi(e.target.value)}
                                            variant="outlined"
                                        >
                                            <MenuItem value="BUGÜN">BUGÜN</MenuItem>
                                            <MenuItem value="DÜNDEN BERİ">DÜNDEN BERİ</MenuItem>
                                            <MenuItem value="SON 3 GÜN">SON 3 GÜN</MenuItem>
                                            <MenuItem value="SON 1 HAFTA">SON 1 HAFTA</MenuItem>
                                            <MenuItem value="SON 2 HAFTA">SON 2 HAFTA</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle1" fontWeight="bold">MÜŞTERİ SIRALAMA</Typography>
                                    <FormControl fullWidth>
                                        <Select
                                            value={sortOption}
                                            onChange={(e) => setSortOption(e.target.value)}
                                            displayEmpty
                                        >
                                            <MenuItem value="">Varsayılan</MenuItem>
                                            <MenuItem value="requested">EN ÇOK TALEP EDİLENDEN EN AZA</MenuItem>
                                            <MenuItem value="supplied">EN ÇOK TEDARİK EDİLENDEN EN AZA</MenuItem>
                                            <MenuItem value="unsupplied">EN ÇOK TEDARİK EDİLEMEYENDEN EN AZA</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>

                                <Card sx={{ minHeight: 1250, borderRadius: 3, boxShadow: 3, p: 2 }}>
                                    <FormControl fullWidth>
                                        <input
                                            type="text"
                                            placeholder="Müşteri ara..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            style={{
                                                padding: "10px",
                                                borderRadius: "6px",
                                                border: "1px solid #ccc",
                                                outline: "none",
                                            }}
                                        />
                                    </FormControl>

                                    <Box sx={{ maxHeight: 1000, overflowY: "auto", mt: 2 }}>
                                        {loading ? (
                                            <Typography variant="body2" align="center">Yükleniyor...</Typography>
                                        ) : sortedAndFilteredMusteriler.length > 0 ? (
                                            sortedAndFilteredMusteriler.map((musteri, i) => (
                                                <Box
                                                    key={i}
                                                    sx={{ display: "flex", alignItems: "center", py: 0.5, cursor: "pointer" }}
                                                    onClick={() => setSelectedMusteri(prev => prev === musteri ? null : musteri)}
                                                >
                                                    <input type="checkbox" checked={selectedMusteri === musteri} readOnly />
                                                    <Typography variant="body2" sx={{ ml: 1, fontWeight: 'bold', fontSize: '1.2rem' }}>
                                                        • {musteri}
                                                    </Typography>
                                                </Box>
                                            ))
                                        ) : (
                                            <Typography variant="body2">Hiç müşteri bulunamadı.</Typography>
                                        )}
                                    </Box>

                                    <Box sx={{ mt: "auto" }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Toplam: {sortedAndFilteredMusteriler.length} müşteri
                                        </Typography>
                                    </Box>
                                </Card>
                            </Box>

                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    gap: 2,
                                    flexWrap: "nowrap",
                                    overflowX: "auto",
                                    alignItems: "flex-start",
                                    ml: 4,
                                }}
                            >
                                {cardData.map((card, index) => (
                                    <Card
                                        key={index}
                                        sx={{
                                            minWidth: 290,
                                            height: 290,
                                            flex: "0 0 auto",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            borderRadius: 5,
                                            boxShadow: "0 8px 32px 0 rgba(0,0,0,0.2)",
                                            backdropFilter: "blur(10px)",
                                            background: card.bg,
                                            color: "white",
                                            border: "1px solid rgba(255, 255, 255, 0.18)",
                                        }}
                                    >
                                        <Typography variant="h6" sx={{ mb: 1 }}>{card.title}</Typography>
                                        <Typography variant="h3">{card.value}</Typography>
                                    </Card>
                                ))}
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Layout>
    );
}

export default AracTedarikAnaliz;
