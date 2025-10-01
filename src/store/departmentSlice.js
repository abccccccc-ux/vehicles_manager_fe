import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import departmentApi from '../api/departmentApi';

export const fetchDepartments = createAsyncThunk(
  'departments/fetchDepartments',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await departmentApi.getDepartments(params);
      return {
        list: data.data,
        pagination: data.pagination,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Lỗi khi tải phòng ban');
    }
  }
);

const departmentSlice = createSlice({
  name: 'departments',
  initialState: {
    list: [],
    loading: false,
    error: null,
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
    search: '',
    status: undefined,
    currentRequestId: undefined, // để kiểm soát race condition
  },
  reducers: {
    setSearch(state, action) {
      state.search = action.payload;
      state.pagination.current = 1; // reset về trang 1 khi search
    },
    setStatus(state, action) {
      state.status = action.payload;
      state.pagination.current = 1; // reset về trang 1 khi filter
    },
    setPagination(state, action) {
      state.pagination = { ...state.pagination, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.currentRequestId = action.meta.requestId;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        // chỉ update nếu request này là request mới nhất
        if (state.currentRequestId === action.meta.requestId) {
          state.loading = false;
          state.list = action.payload.list;
          state.pagination = {
            ...state.pagination,
            ...action.payload.pagination,
            total: action.payload.pagination?.totalItems || 0,
            current: action.payload.pagination?.currentPage || 1,
          };
          state.currentRequestId = undefined;
        }
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        if (state.currentRequestId === action.meta.requestId) {
          state.loading = false;
          state.error = action.payload;
          state.currentRequestId = undefined;
        }
      });
  },
});

export const { setSearch, setStatus, setPagination } = departmentSlice.actions;
export default departmentSlice.reducer;
