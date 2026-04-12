import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Task } from '@/types';
import { TaskStatus } from '@/types';
import { taskService } from '@/features/tasks/services/taskService';

interface TasksState {
  items: Task[];
  loading: boolean;
  error: string | null;
  filter: TaskStatus | 'ALL';
}

const initialState: TasksState = {
  items: [],
  loading: false,
  error: null,
  filter: 'ALL',
};

export const fetchTasks = createAsyncThunk(
  'tasks/fetchAll',
  async ({
    projectId,
    status,
  }: {
    projectId: string;
    status?: TaskStatus;
  }) => {
    const response = await taskService.getAll(projectId, status);
    return response.data.data;
  },
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tasks';
      });
  },
});

export const { setFilter } = tasksSlice.actions;
export default tasksSlice.reducer;
