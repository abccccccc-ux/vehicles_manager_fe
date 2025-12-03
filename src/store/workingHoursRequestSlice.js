import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import workingHoursRequestApi from '../api/workingHoursRequestApi';

// lấy danh sách yêu cầu cá nhân
export const fetchMyWorkingHoursRequests = createAsyncThunk(
  'workingHoursRequests/fetchMy',
  async (params, { rejectWithValue }) => {
    try {
      const response = await workingHoursRequestApi.getWorkingHoursRequests(params);
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Lỗi khi tải danh sách yêu cầu');
    }
  }
);

//lấy danh sách tất cả yêu cầu
export const fetchAllWorkingHoursRequests = createAsyncThunk(
  'workingHoursRequests/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await workingHoursRequestApi.getAllWorkingHoursRequest(params);
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

// Phê duyệt yêu cầu
export const approveWorkingHoursRequest = createAsyncThunk(
  'workingHoursRequests/approve',
  async ({ id, approvalNote }, { rejectWithValue }) => {
    try {
      const body = approvalNote ? { approvalNote } : undefined;
      const response = await workingHoursRequestApi.approveWorkingHoursRequest(id, body);
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Lỗi khi phê duyệt yêu cầu');
    }
  }
);

// Từ chối yêu cầu
export const rejectWorkingHoursRequest = createAsyncThunk(
  'workingHoursRequests/reject',
  async ({ id, approvalNote }, { rejectWithValue }) => {
    try {
      const body = approvalNote ? { approvalNote } : undefined;
      const response = await workingHoursRequestApi.rejectWorkingHoursRequest(id, body);
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Lỗi khi từ chối yêu cầu');
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
    //fetchMyWokingHoursRequest
    builder
      .addCase(fetchMyWorkingHoursRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyWorkingHoursRequests.fulfilled, (state, action) => {
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
      .addCase(fetchMyWorkingHoursRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message;
      });
    //fetchAllWorkingHoursRequest
    builder
      .addCase(fetchAllWorkingHoursRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllWorkingHoursRequests.fulfilled, (state, action) => {
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
      .addCase(fetchAllWorkingHoursRequests.rejected, (state, action) => {
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
      // Approve / Reject
      builder
        .addCase(approveWorkingHoursRequest.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(approveWorkingHoursRequest.fulfilled, (state, action) => {
          state.loading = false;
          if (action.payload && action.payload.success) {
            const updated = action.payload.data?.request;
            if (updated) {
              state.list = (state.list || []).map((i) => (i._id === updated._id ? { ...i, ...updated } : i));
            }
          } else {
            state.error = action.payload?.message || 'Lỗi khi phê duyệt yêu cầu';
          }
        })
        .addCase(approveWorkingHoursRequest.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload || action.error?.message;
        });

      builder
        .addCase(rejectWorkingHoursRequest.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(rejectWorkingHoursRequest.fulfilled, (state, action) => {
          state.loading = false;
          if (action.payload && action.payload.success) {
            const updated = action.payload.data?.request;
            if (updated) {
              state.list = (state.list || []).map((i) => (i._id === updated._id ? { ...i, ...updated } : i));
            }
          } else {
            state.error = action.payload?.message || 'Lỗi khi từ chối yêu cầu';
          }
        })
        .addCase(rejectWorkingHoursRequest.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload || action.error?.message;
        });
    // (status update removed for personal view)
  },
});

export const { setPagination, setFilters } = workingHoursRequestSlice.actions;
export default workingHoursRequestSlice.reducer;