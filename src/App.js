import React, { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
import { Box, Card, CardContent, Typography } from "@mui/material";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

function App() {
    const [unsupplied, setUnsupplied] = useState(0);
    const [totalSupplied, setTotalSupplied] = useState(0);

    useEffect(() => {
        const selectedDate = new Date(); // ✅ Her render yerine sadece useEffect'te oluşturuluyor

        const fetchData = async () => {
            try {
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

                    const spotOrders = data.filter(
                        (order) =>
                            order.TMSDespatchDocumentNo &&
                            order.TMSDespatchDocumentNo.startsWith("SFR") &&
                            order.VehicleWorkingName === "SPOT" &&
                            order.ServiceName === "YURTİÇİ FTL HİZMETLERİ" &&
                            order.SubServiceName === "FTL HİZMETİ"
                    );
                    const uniqueSpotDespatchSet = new Set(
                        spotOrders.map((o) => o.TMSDespatchDocumentNo)
                    );

                    const filoOrders = data.filter(
                        (order) =>
                            order.TMSDespatchDocumentNo &&
                            order.TMSDespatchDocumentNo.startsWith("SFR") &&
                            ["FİLO", "ÖZMAL", "MODERN AMBALAJ FİLO"].includes(
                                order.VehicleWorkingName
                            ) &&
                            ["YURTİÇİ FTL HİZMETLERİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(
                                order.ServiceName
                            ) &&
                            ["FTL HİZMETİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(
                                order.SubServiceName
                            )
                    );
                    const uniqueFiloDespatchSet = new Set(
                        filoOrders.map((o) => o.TMSDespatchDocumentNo)
                    );

                    const combinedDespatchSet = new Set([
                        ...uniqueSpotDespatchSet,
                        ...uniqueFiloDespatchSet,
                    ]);
                    setTotalSupplied(combinedDespatchSet.size);

                    const talepPlanlananSet = new Set(
                        data
                            .filter(
                                (order) =>
                                    order.TMSVehicleRequestDocumentNo &&
                                    !order.TMSVehicleRequestDocumentNo.startsWith("BOS") &&
                                    ["YURTİÇİ FTL HİZMETLERİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(
                                        order.ServiceName
                                    ) &&
                                    ["FTL HİZMETİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(
                                        order.SubServiceName
                                    )
                            )
                            .map((order) => order.TMSVehicleRequestDocumentNo)
                    );

                    const calculatedUnsupplied =
                        talepPlanlananSet.size - combinedDespatchSet.size;
                    setUnsupplied(calculatedUnsupplied < 0 ? 0 : calculatedUnsupplied);
                }
            } catch (error) {
                console.error("Veri çekme hatası:", error);
            }
        };

        fetchData();
    }, []); // ✅ Sadece component mount olduğunda çalışacak

    const pieChartData = [
        {
            name: "Tedarik Edilen",
            value: totalSupplied,
            color: "#4CAF50",
        },
        {
            name: "Tedarik Edilemeyen",
            value: unsupplied,
            color: "#D32F2F",
        },
    ];

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom>
                Tedarik Durumu
            </Typography>

            <Card sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
                <CardContent>
                    <Typography variant="h6" align="center" gutterBottom>
                        Günlük Tedarik Grafiği
                    </Typography>

                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieChartData}
                                dataKey="value"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                label={({ name, value }) => `${name}: ${value}`}
                            >
                                {pieChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </Box>
    );
}

export default App;
