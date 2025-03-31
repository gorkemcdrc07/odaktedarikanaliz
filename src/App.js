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
        <Box sx={{ p: 4 }}>
            <Grid container spacing={2}>
                {/* Card 1 */}
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" align="center">
                                Card 1
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Card 2 */}
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" align="center">
                                Card 2
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Card 3 & 4 (alt alta) */}
                <Grid item xs={12} md={3}>
                    <Grid container spacing={2} direction="column">
                        {/* Card 3 */}
                        <Grid item>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" align="center">
                                        Card 3
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Card 4 */}
                        <Grid item>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" align="center">
                                        Card 4
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Grid>

                {/* Uzun Card 5 */}
                <Grid item xs={12} md={3}>
                    <Card sx={{ height: "100%" }}>
                        <CardContent>
                            <Typography variant="h6" align="center">
                                Card 5 (Uzun Kart)
                            </Typography>
                            <Typography variant="body2" align="center">
                                Bu kart sağda uzun olacak şekilde tasarlandı.
                                Diğer kartlarla hizalı durur.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}

export default App;
