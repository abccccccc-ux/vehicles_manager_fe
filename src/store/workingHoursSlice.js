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

// Tạo mới giờ làm việc
export const createWorkingHours = createAsyncThunk(
  'workingHours/createWorkingHours',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await workingHoursApi.createWorkingHours(payload);
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message || 'Lỗi khi tạo giờ làm việc');
    }
  }
);

// Xóa giờ làm việc
export const deleteWorkingHours = createAsyncThunk(
  'workingHours/deleteWorkingHours',
  async (id, { rejectWithValue }) => {
    try {
      const response = await workingHoursApi.deleteWorkingHours(id);
      return { id, ...response }; // include id for reducer
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Lỗi khi xóa giờ làm việc');
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
      // createWorkingHours
      builder
        .addCase(createWorkingHours.pending, (state) => {
          state.creating = true;
        })
        .addCase(createWorkingHours.fulfilled, (state, action) => {
          state.creating = false;
          if (action.payload && action.payload.success) {
            const w = action.payload.data?.workingHours;
            if (w) {
              const item = { ...w, key: w._id };
              // thêm vào đầu danh sách
              state.list = [item, ...(state.list || [])];
              // cập nhật tổng nếu có
              state.pagination.total = (state.pagination.total || 0) + 1;
            }
          } else {
            state.error = action.payload?.message || 'Tạo giờ làm việc thất bại';
          }
        })
        .addCase(createWorkingHours.rejected, (state, action) => {
          state.creating = false;
          state.error = action.payload || action.error?.message;
        });

      // deleteWorkingHours
      builder
        .addCase(deleteWorkingHours.pending, (state) => {
          state.deleting = true;
          state.deleteError = null;
        })
        .addCase(deleteWorkingHours.fulfilled, (state, action) => {
          state.deleting = false;
          if (action.payload && action.payload.success) {
            const id = action.payload.id;
            state.list = (state.list || []).filter((i) => i._id !== id && i.key !== id);
            state.pagination.total = Math.max(0, (state.pagination.total || 0) - 1);
            state.deleteResult = action.payload.message || 'Xóa thành công';
          } else {
            state.deleteError = action.payload?.message || 'Xóa thất bại';
          }
        })
        .addCase(deleteWorkingHours.rejected, (state, action) => {
          state.deleting = false;
          state.deleteError = action.payload || action.error?.message;
        });
  },
});

export const { setIsActive, setPagination } = workingHoursSlice.actions;
export default workingHoursSlice.reducer;
