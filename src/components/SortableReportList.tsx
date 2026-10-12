// components/SortableReportList.tsx
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Grid } from "@mui/material";
import { useReportStore } from "../store/reportStore";
import ReportCard from "./ReportCard";
import { Report } from "../types/Report";

const SortableItem = ({ id }: { id: string }) => {
  const { setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const report = useReportStore((s) => s.reports.find((r) => r.id === id))!;

  return (
    <Grid size={{ xs: 12, sm: 6, md: 4 }} ref={setNodeRef} style={style}>
      <ReportCard {...report} />
    </Grid>
  );
};

interface Props {
  reports: Report[];
}

const SortableReportList: React.FC<Props> = ({ reports }) => {
  const moveReport = useReportStore((s) => s.moveReport);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) {
      moveReport(String(active.id), String(over.id));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={reports.map((r) => r.id)}
        strategy={horizontalListSortingStrategy}
      >
        <Grid container spacing={2}>
          {reports.map((r) => (
            <SortableItem key={r.id} id={r.id} />
          ))}
        </Grid>
      </SortableContext>
    </DndContext>
  );
};

export default SortableReportList;
