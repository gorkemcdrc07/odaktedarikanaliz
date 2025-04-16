// src/Layout.js
import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Box,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DriveEtaIcon from "@mui/icons-material/DriveEta";
import BarChartIcon from "@mui/icons-material/BarChart";
import { useNavigate } from "react-router-dom";

function Layout({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const navigate = useNavigate();

  return (
    <>
      <IconButton
        onClick={() => setDrawerOpen(!drawerOpen)}
        sx={{ position: "absolute", top: 10, left: 10, zIndex: 1300 }}
      >
        {drawerOpen ? <ChevronLeftIcon fontSize="large" /> : <ChevronRightIcon fontSize="large" />}
      </IconButton>

      <Drawer
        variant="persistent"
        anchor="left"
        open={drawerOpen}
        sx={{
          width: 240,
          flexShrink: 0,
          zIndex: 1200,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            backgroundColor: '#2c3e50',
            color: 'white',
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", p: 2 }}>
          <IconButton onClick={() => setDrawerOpen(false)}>
            <ChevronLeftIcon sx={{ color: "white" }} />
          </IconButton>
        </Box>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.2)" }} />
              <List>
                  <ListItem button onClick={() => navigate("/")}>
                      <DriveEtaIcon sx={{ color: "white", mr: 2 }} />
                      <ListItemText primary="GÜNLÜK ARAÇ TEDARİK" />
                  </ListItem>

                  <ListItem button onClick={() => navigate("/arac-analiz")}>
                      <BarChartIcon sx={{ color: "white", mr: 2 }} />
                      <ListItemText primary="ARAÇ TEDARİK ANALİZ" />
                  </ListItem>

                  <ListItem button onClick={() => navigate("/zamaninda-analiz")}>
                      <BarChartIcon sx={{ color: "white", mr: 2 }} />
                      <ListItemText primary="ZAMANINDA TEDARİK ANALİZİ" />
                  </ListItem>
              </List>

      </Drawer>

      <Box sx={{ marginLeft: drawerOpen ? 30 : 10, transition: "margin-left 0.3s ease", p: 3 }}>
        {children}
      </Box>
    </>
  );
}

export default Layout;
