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
import { summarizeContent } from "../api/openai";
import SummarizeIcon from "@mui/icons-material/Summarize";
import { useUserStore } from "../store/userStore";
import DOMPurify from "dompurify";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import { useSortable } from "@dnd-kit/sortable";

interface Props {
  id: string;
  title: string;
  content: string;
}

const ReportCard: React.FC<Props> = ({ id, title, content }) => {
  const { attributes, listeners } = useSortable({ id });
  const { updateReport, selectReport, setEditorOpen } = useReportStore();
  const { userRole } = useUserStore();
  const [loading, setLoading] = useState(false);
  const isAdmin = userRole === "Admin";

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent unintended drag
    selectReport({ id, title, content });
    setEditorOpen(true);
  };

  const handleSummarize = async (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent unintended drag
    setLoading(true);
    try {
      const summary = await summarizeContent(content);
      updateReport({ id, title, content: summary });
    } catch (error) {
      console.error("Summarization failed:", error);
    } finally {
      setLoading(false);
    }
  };

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
          <Box component="span" {...attributes} {...listeners}>
            <DragHandleIcon color="primary" sx={{ ml: 1, cursor: "grab" }} />
          </Box>
        </Typography>
        <Typography
          variant="body2"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
          sx={{ whiteSpace: "pre-wrap" }}
        />
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
            Summarize Content
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default ReportCard;
