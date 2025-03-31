import React from 'react';
import './App.css';
import logo from './logo.svg';
import { Card, CardContent, Typography, Grid } from '@mui/material';

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>
                    Edit <code>src/App.js</code> and save to reload.
                </p>
                <a
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn React
                </a>

                {/* Card Container */}
                <Grid container spacing={2} justifyContent="center" style={{ marginTop: 20 }}>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5">Card 1</Typography>
                                <Typography color="textSecondary">Some information here.</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5">Card 2</Typography>
                                <Typography color="textSecondary">Another piece of info.</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5">Card 3</Typography>
                                <Typography color="textSecondary">Yet another detail.</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </header>
        </div>
    );
}

export default App;
