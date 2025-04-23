// components/ReportEditorDialog.tsx
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
} from '@mui/material';
import JoditEditor from 'jodit-react';
import { useEffect, useRef, useState } from 'react';
import { useReportStore } from '../store/reportStore';
import { v4 as uuidv4 } from 'uuid';

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

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (selectedReport) {
      setTitle(selectedReport.title);
      setContent(selectedReport.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [selectedReport]);

  const handleClose = () => {
    setEditorOpen(false);
    selectReport(null);
  };

  const handleSave = () => {
    if (selectedReport) {
      updateReport({ ...selectedReport, title, content });
    } else {
      addReport({ id: uuidv4(), title, content });
    }
    handleClose();
  };

  return (
    <Dialog open={editorOpen} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>{selectedReport ? 'Edit Report' : 'Create New Report'}</DialogTitle>
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
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={!title || !content}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportEditorDialog;
