import {
  Box,
  Button,
  Paper,
  TextField,
  InputAdornment,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useReportStore } from "../store/reportStore";
import { markdownToHtml, streamDraft } from "../api/openai";
import DOMPurify from "dompurify";
import { useEffect, useState } from "react";
import ReportEditorDialog from "../components/ReportEditorDialog";
import SearchIcon from "@mui/icons-material/Search";
import { useAuthStore } from "../store/authStore";
import SortableReportList from "../components/SortableReportList";

const Dashboard = () => {
  const {
    reports,
    addReport,
    loadReports,
    loading: loadingReports,
    error: reportsError,
    searchQuery,
    setSearchQuery,
    setEditorOpen,
  } = useReportStore();
  const { me, signOut } = useAuthStore();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<string | null>(null);
  const isAdmin = me?.role === "admin";

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleGenerateDraft = async () => {
    setLoading(true);
    setError(null);
    setDraft("");
    try {
      const markdown = await streamDraft(prompt, setDraft);
      const content = markdownToHtml(markdown);
      const titleFromPrompt =
        prompt.length > 60 ? prompt.slice(0, 60) + "..." : prompt;
      await addReport({
        title: titleFromPrompt || "Untitled",
        content,
      });
      setPrompt("");
    } catch (e) {
      console.error(e);
      setError("Failed to generate draft");
    } finally {
      setDraft(null);
      setLoading(false);
    }
  };

  const filteredReports = reports.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box>
      <Paper sx={{ p: 2 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h4">Reports</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body2" color="text.secondary">
              {me?.email} ({me?.role})
            </Typography>
            <Button onClick={signOut}>Sign out</Button>
          </Box>
        </Box>

        {isAdmin && (
          <Button variant="outlined" onClick={() => setEditorOpen(true)}>
            New report
          </Button>
        )}

        <ReportEditorDialog />

        {isAdmin && (
          <Box mt={4} mb={2}>
            <TextField
              fullWidth
              placeholder="Prompt for draft..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <Button
              onClick={handleGenerateDraft}
              sx={{ mt: 1 }}
              variant="contained"
              disabled={loading || !prompt}
            >
              {loading ? <CircularProgress size={24} /> : "Generate Draft"}
            </Button>
            {draft && (
              <Paper variant="outlined" sx={{ mt: 2, p: 2 }}>
                <Typography
                  variant="body2"
                  component="div"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(markdownToHtml(draft)),
                  }}
                />
              </Paper>
            )}
            {error && (
              <Typography color="error" mt={1}>
                {error}
              </Typography>
            )}
          </Box>
        )}

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
        {reportsError && (
          <Typography color="error" mb={2}>
            {reportsError}
          </Typography>
        )}
        {loadingReports && reports.length === 0 ? (
          <CircularProgress />
        ) : (
          <SortableReportList reports={filteredReports} />
        )}
      </Paper>
    </Box>
  );
};

export default Dashboard;
