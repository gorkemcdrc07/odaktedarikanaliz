import React from "react";
import "./App.css";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
} from "@mui/material";

function App() {
    return (
        <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
                {/* Sol taraf: 3 sütun */}
                <Grid item xs={12} md={9}>
                    <Grid container spacing={2}>
                        {/* Card 1 */}
                        <Grid item xs={12} md={4}>
                            <Card sx={{ height: 400 }}>
                                <CardContent>
                                    <Typography variant="h6" align="center">
                                        Card 1
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Card 2 */}
                        <Grid item xs={12} md={4}>
                            <Card sx={{ height: 400 }}>
                                <CardContent>
                                    <Typography variant="h6" align="center">
                                        Card 2
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Card 3 + Card 4 (alt alta ama toplamda 400px) */}
                        <Grid item xs={12} md={4}>
                            <Grid container direction="column" spacing={2} sx={{ height: 400 }}>
                                <Grid item sx={{ height: "50%" }}>
                                    <Card sx={{ height: "100%" }}>
                                        <CardContent>
                                            <Typography variant="h6" align="center">
                                                Card 3
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item sx={{ height: "50%" }}>
                                    <Card sx={{ height: "100%" }}>
                                        <CardContent>
                                            <Typography variant="h6" align="center">
                                                Card 4
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>

                {/* Sağ taraf: Card 5 (tam ekran yüksekliği) */}
                <Grid item xs={12} md={3}>
                    <Card sx={{ height: 'calc(100vh - 32px)' }}>
                        <CardContent>
                            <Typography variant="h6" align="center">
                                Card 5 (Tam Yükseklik)
                            </Typography>
                            <Typography variant="body2" align="center">
                                Ekranın sağında ve tüm yüksekliği kaplar.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}

export default App;
