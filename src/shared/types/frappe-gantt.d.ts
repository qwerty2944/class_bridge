// frappe-gantt 는 타입 선언이 없어 ambient 로 최소 시그니처만 정의.
declare module 'frappe-gantt' {
  interface GanttTask {
    id: string;
    name: string;
    start: string;
    end: string;
    progress?: number;
    dependencies?: string;
    custom_class?: string;
  }

  interface GanttOptions {
    view_mode?: 'Day' | 'Week' | 'Month' | 'Year';
    language?: string;
    bar_height?: number;
    padding?: number;
    popup_trigger?: 'click' | 'mouseover' | null;
    on_click?: (task: GanttTask) => void;
    on_date_change?: (task: GanttTask, start: Date, end: Date) => void;
    on_progress_change?: (task: GanttTask, progress: number) => void;
  }

  export default class Gantt {
    constructor(target: HTMLElement | string | SVGElement, tasks: GanttTask[], options?: GanttOptions);
    refresh(tasks: GanttTask[]): void;
    change_view_mode(mode: GanttOptions['view_mode']): void;
  }
}
