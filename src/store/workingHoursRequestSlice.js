import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import workingHoursRequestApi from '../api/workingHoursRequestApi';

// Fetch list with params { page, limit, status, requestType, search }
export const fetchWorkingHoursRequests = createAsyncThunk(
  'workingHoursRequests/fetch',
  async (params, { rejectWithValue }) => {
    try {
      const response = await workingHoursRequestApi.getWorkingHoursRequests(params);
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Lỗi khi tải danh sách yêu cầu');
    }
  }
);

// Tạo yêu cầu mới
export const createWorkingHoursRequest = createAsyncThunk(
  'workingHoursRequests/create',
  async (body, { rejectWithValue }) => {
    try {
      const response = await workingHoursRequestApi.createWorkingHoursRequest(body);
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.errors[0].message || err.message || 'Lỗi khi tạo yêu cầu');
    }
  }
);

// Cập nhật trạng thái 1 yêu cầu (id, payload)
// Note: status update removed for personal view (read-only)

const initialState = {
  list: [],
  loading: false,
  error: null,
  createLoading: false,
  createError: null,
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
  },
  filters: {
    status: undefined,
    requestType: undefined,
    licensePlate: undefined,
  },
};

const workingHoursRequestSlice = createSlice({
  name: 'workingHoursRequests',
  initialState,
  reducers: {
    setPagination(state, action) {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.current = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkingHoursRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkingHoursRequests.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.success) {
          state.list = (action.payload.data || []).map((i) => ({ ...i, key: i._id }));
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
      .addCase(fetchWorkingHoursRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message;
      });
    builder
      .addCase(createWorkingHoursRequest.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createWorkingHoursRequest.fulfilled, (state, action) => {
        state.createLoading = false;
        if (action.payload && action.payload.success) {
          // option: push to list for immediate UI feedback
          const created = action.payload.data?.request;
          if (created) {
            state.list = [ ...(state.list || []), created ];
            state.pagination.total = (state.pagination.total || 0) + 1;
          }
        } else {
          state.createError = action.payload?.message || 'Lỗi khi tạo yêu cầu';
        }
      })
      .addCase(createWorkingHoursRequest.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload || action.error?.message;
      });
    // (status update removed for personal view)
  },
});

export const { setPagination, setFilters } = workingHoursRequestSlice.actions;
export default workingHoursRequestSlice.reducer;
