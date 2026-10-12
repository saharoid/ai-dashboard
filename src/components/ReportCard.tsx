import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  CardActions,
  Button,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useReportStore } from "../store/reportStore";
import { markdownToHtml, streamSummary } from "../api/openai";
import SummarizeIcon from "@mui/icons-material/Summarize";
import { useAuthStore } from "../store/authStore";
import DOMPurify from "dompurify";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import { useSortable } from "@dnd-kit/sortable";
import { Report } from "../types/Report";

const Html = ({ html }: { html: string }) => (
  <Typography
    variant="body2"
    component="div"
    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
  />
);

const ReportCard: React.FC<Report> = ({ id, title, content, summary }) => {
  const { attributes, listeners } = useSortable({ id });
  const { selectReport, setEditorOpen, setSummary } = useReportStore();
  const isAdmin = useAuthStore((s) => s.me?.role === "admin");
  const [loading, setLoading] = useState(false);
  const [streamed, setStreamed] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent unintended drag
    selectReport({ id, title, content, summary });
    setEditorOpen(true);
  };

  const handleSummarize = async (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent unintended drag
    setLoading(true);
    setError(null);
    setStreamed("");
    try {
      const markdown = await streamSummary(id, setStreamed);
      setSummary(id, markdownToHtml(markdown));
    } catch (e) {
      console.error("Summarization failed:", e);
      setError("Summary failed");
    } finally {
      setStreamed(null);
      setLoading(false);
    }
  };

  // While streaming, show the Markdown as it arrives; after, the saved HTML.
  const summaryHtml =
    streamed !== null ? markdownToHtml(streamed) : summary ?? null;

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography
          variant="h6"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {title}
          {isAdmin && (
            <Box component="span" {...attributes} {...listeners}>
              <DragHandleIcon color="primary" sx={{ ml: 1, cursor: "grab" }} />
            </Box>
          )}
        </Typography>
        {summaryHtml && (
          <Box sx={{ bgcolor: "action.hover", borderRadius: 1, px: 2, py: 1, my: 1 }}>
            <Typography variant="overline" color="text.secondary">
              AI summary
            </Typography>
            <Html html={summaryHtml} />
          </Box>
        )}
        {error && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}
        <Html html={content} />
      </CardContent>
      <CardActions
        sx={{
          alignSelf: "stretch",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "flex-start",
          p: 2,
        }}
      >
        {isAdmin && (
          <Button
            disabled={loading}
            onClick={handleEdit}
            title="Edit"
            startIcon={<EditIcon />}
            variant="contained"
          >
            Edit
          </Button>
        )}
        {isAdmin && (
          <Button
            onClick={handleSummarize}
            disabled={loading}
            title="Summarize Content"
            startIcon={
              loading ? <CircularProgress size={20} /> : <SummarizeIcon />
            }
            variant="outlined"
          >
            {summary ? "Re-summarize" : "Summarize"}
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default ReportCard;
