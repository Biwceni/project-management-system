import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Project } from '@/types';
import { projectService } from '@/features/projects/services/projectService';

interface ProjectsState {
  items: Project[];
  current: Project | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProjectsState = {
  items: [],
  current: null,
  loading: false,
  error: null,
};

export const fetchProjects = createAsyncThunk(
  'projects/fetchAll',
  async () => {
    const response = await projectService.getAll();
    return response.data.data;
  },
);

export const fetchProject = createAsyncThunk(
  'projects/fetchOne',
  async (id: string) => {
    const response = await projectService.getById(id);
    return response.data.data;
  },
);

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearCurrentProject: (state) => {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch projects';
      })
      .addCase(fetchProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProject.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch project';
      });
  },
});

export const { clearCurrentProject } = projectsSlice.actions;
export default projectsSlice.reducer;
