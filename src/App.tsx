import { useEffect } from "react";
import { Box, CircularProgress } from "@mui/material";
import "./App.css";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import { useAuthStore } from "./store/authStore";

function App() {
  const { init, ready, me } = useAuthStore();

  useEffect(() => init(), [init]);

  if (!ready) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress />
      </Box>
    );
  }

  return me ? <Dashboard /> : <Login />;
}

export default App;
