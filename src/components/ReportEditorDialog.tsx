// components/ReportEditorDialog.tsx
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Typography,
} from "@mui/material";
import JoditEditor from "jodit-react";
import { useEffect, useRef, useState } from "react";
import { useReportStore } from "../store/reportStore";

const ReportEditorDialog = () => {
  const editor = useRef(null);
  const {
    selectedReport,
    addReport,
    updateReport,
    setEditorOpen,
    editorOpen,
    selectReport,
  } = useReportStore();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedReport) {
      setTitle(selectedReport.title);
      setContent(selectedReport.content);
    } else {
      setTitle("");
      setContent("");
    }
  }, [selectedReport]);

  const handleClose = () => {
    setEditorOpen(false);
    selectReport(null);
    setError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      if (selectedReport) {
        await updateReport(selectedReport.id, { title, content });
      } else {
        await addReport({ title, content });
      }
      handleClose();
    } catch (e) {
      console.error(e);
      setError("Failed to save report");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={editorOpen} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>
        {selectedReport ? "Edit Report" : "Create New Report"}
      </DialogTitle>
      <DialogContent dividers>
        <TextField
          label="Title"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 2 }}
        />
        <JoditEditor
          ref={editor}
          value={content}
          config={{ readonly: false }}
          onBlur={(newContent) => setContent(newContent)}
        />
        {error && (
          <Typography color="error" mt={2}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving || !title || !content}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportEditorDialog;
