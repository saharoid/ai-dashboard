import { useEffect } from "react";
import { Alert, Box, Button, CircularProgress } from "@mui/material";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import { useAuthStore } from "./store/authStore";

function App() {
  const { init, ready, me, error, signOut } = useAuthStore();

  useEffect(() => init(), [init]);

  if (!ready) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (!me && error) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <Alert
          severity="error"
          action={<Button onClick={signOut}>Sign out</Button>}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return me ? <Dashboard /> : <Login />;
}

export default App;
