import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  CardActions,
  Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useReportStore } from "../store/reportStore";
import { summarizeContent } from "../api/openai";
import SummarizeIcon from "@mui/icons-material/Summarize";
import { useUserStore } from "../store/userStore";

interface Props {
  id: string;
  title: string;
  content: string;
}

const ReportCard: React.FC<Props> = ({ id, title, content }) => {
  const { updateReport, selectReport, setEditorOpen } = useReportStore();
  const { userRole } = useUserStore();
  const [loading, setLoading] = useState(false);
  const isAdmin = userRole === "Admin";

  const handleEdit = () => {
    selectReport({ id, title, content });
    setEditorOpen(true);
  };

  const handleSummarize = async () => {
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
        <Typography variant="h6">{title}</Typography>
        <Typography
          variant="body2"
          dangerouslySetInnerHTML={{ __html: content }}
          sx={{ whiteSpace: "pre-wrap" }}
        />
      </CardContent>
      <CardActions
      sx={{
        alignSelf: "stretch",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "flex-start",
        p: 2
      }}
      >
      {isAdmin && (
            <Button
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
              startIcon={loading ? <CircularProgress size={20} /> : <SummarizeIcon />}
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
