import {
  Box,
  Button,
  Paper,
  TextField,
  InputAdornment,
  Typography,
  CircularProgress,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { useReportStore } from "../store/reportStore";
import { generateDraft } from "../api/openai";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import ReportEditorDialog from "../components/ReportEditorDialog";
import SearchIcon from "@mui/icons-material/Search";
import { useUserStore } from "../store/userStore";
import SortableReportList from "../components/SortableReportList";

const Dashboard = () => {
  const { reports, addReport, searchQuery, setSearchQuery } = useReportStore();
  const { userRole, setUserRole } = useUserStore();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAdmin = userRole === "Admin";

  const handleGenerateDraft = async () => {
    setLoading(true);
    setError(null);
    try {
      const content = await generateDraft(prompt);
      const titleFromPrompt =
        prompt.length > 60 ? prompt.slice(0, 60) + "..." : prompt;
      addReport({
        id: uuidv4(),
        title: titleFromPrompt || "Untitled",
        content,
      });
      setPrompt("");
    } catch (e) {
      console.log(e);
      setError("Failed to generate draft");
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h4" mb={2}>
          Reports
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={isAdmin}
              onChange={() => setUserRole(isAdmin ? "Viewer" : "Admin")}
            />
          }
          label={`Role: ${userRole}`}
        />

        <ReportEditorDialog />

        <Box mt={4} mb={2}>
          <TextField
            fullWidth
            placeholder="Prompt for draft..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          {isAdmin && (
            <Button
              onClick={handleGenerateDraft}
              sx={{ mt: 1 }}
              variant="contained"
              disabled={loading || !prompt}
            >
              {loading ? <CircularProgress size={24} /> : "Generate Draft"}
            </Button>
          )}

          {error && (
            <Typography color="error" mt={1}>
              {error}
            </Typography>
          )}
        </Box>

        <Box mb={2}>
          <TextField
            fullWidth
            placeholder="Search by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        {/* Report List */}
        <SortableReportList reports={filteredReports} />
      </Paper>
    </Box>
  );
};

export default Dashboard;
