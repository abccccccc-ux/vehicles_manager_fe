import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import workingHoursApi from '../api/workingHoursApi';

export const fetchWorkingHours = createAsyncThunk(
  'workingHours/fetchWorkingHours',
  async (params, { rejectWithValue }) => {
    try {
      const response = await workingHoursApi.getWorkingHours(params);
      // response expected: { success, message, data, pagination }
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Lỗi khi tải giờ làm việc');
    }
  }
);

const initialState = {
  list: [],
  loading: false,
  error: null,
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
  },
  isActive: undefined,
};

const workingHoursSlice = createSlice({
  name: 'workingHours',
  initialState,
  reducers: {
    setIsActive(state, action) {
      state.isActive = action.payload;
      state.pagination.current = 1;
    },
    setPagination(state, action) {
      state.pagination = { ...state.pagination, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkingHours.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkingHours.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.success) {
          state.list = (action.payload.data || []).map(item => ({ ...item, key: item._id }));
          state.pagination = {
            ...state.pagination,
            total: action.payload.pagination?.totalItems || 0,
            current: action.payload.pagination?.currentPage || state.pagination.current,
            pageSize: action.payload.pagination?.itemsPerPage || state.pagination.pageSize,
          };
        } else {
          state.error = action.payload?.message || 'Lỗi dữ liệu';
        }
      })
      .addCase(fetchWorkingHours.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setIsActive, setPagination } = workingHoursSlice.actions;
export default workingHoursSlice.reducer;
