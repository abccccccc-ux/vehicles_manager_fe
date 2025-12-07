import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import departmentApi from '../api/departmentApi';

export const updateDepartment = createAsyncThunk(
  'departments/updateDepartment',
  async ({ departmentId, departmentData }, { rejectWithValue }) => {
    try {
      const { data } = await departmentApi.updateDepartment(departmentId, departmentData);
      return data.data.department;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Lỗi khi cập nhật đơn vị');
    }
  }
);

export const fetchDepartmentById = createAsyncThunk(
  'departments/fetchDepartmentById',
  async (departmentId, { rejectWithValue }) => {
    try {
      const { data } = await departmentApi.getDepartmentById(departmentId);
      return data.data.department;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Lỗi khi lấy thông tin đơn vị');
    }
  }
);

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
      return rejectWithValue(err.response?.data?.message || 'Lỗi khi tải đơn vị');
    }
  }
);

export const createDepartment = createAsyncThunk(
  'departments/createDepartment',
  async (departmentData, { rejectWithValue }) => {
    try {
      const { data } = await departmentApi.createDepartment(departmentData);
      return data.data.department;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Lỗi khi tạo đơn vị');
    }
  }
);

export const deleteDepartment = createAsyncThunk(
  'departments/deleteDepartment',
  async (departmentId, { rejectWithValue }) => {
    try {
      const { data } = await departmentApi.deleteDepartment(departmentId);
      return { departmentId, message: data.message };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Lỗi khi xóa đơn vị');
    }
  }
);

const departmentSlice = createSlice({
  name: 'departments',
  initialState: {
    list: [],
    loading: false,
    error: null,
      currentDepartment: null,
      currentDepartmentLoading: false,
      currentDepartmentError: null,
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
    search: '',
    isActive: undefined,
    currentRequestId: undefined, // để kiểm soát race condition
  },
  reducers: {
    setSearch(state, action) {
      state.search = action.payload;
      state.pagination.current = 1; // reset về trang 1 khi search
    },
    setIsActive(state, action) {
      state.isActive = action.payload;
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
    builder
      .addCase(createDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.loading = false;
        state.list.unshift(action.payload);
      })
      .addCase(createDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    builder
      .addCase(fetchDepartmentById.pending, (state) => {
        state.currentDepartmentLoading = true;
        state.currentDepartmentError = null;
        state.currentDepartment = null;
      })
      .addCase(fetchDepartmentById.fulfilled, (state, action) => {
        state.currentDepartmentLoading = false;
        state.currentDepartment = action.payload;
      })
      .addCase(fetchDepartmentById.rejected, (state, action) => {
        state.currentDepartmentLoading = false;
        state.currentDepartmentError = action.payload;
      });
    builder
      .addCase(deleteDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.loading = false;
        // remove deleted department from list
        state.list = state.list.filter((d) => d._id !== action.payload.departmentId);
      })
      .addCase(deleteDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    builder
      .addCase(updateDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        // update list item if present
        state.list = state.list.map((d) => (d._id === updated._id ? updated : d));
        // update currentDepartment if open
        if (state.currentDepartment && state.currentDepartment._id === updated._id) {
          state.currentDepartment = updated;
        }
      })
      .addCase(updateDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSearch, setIsActive, setPagination } = departmentSlice.actions;
export default departmentSlice.reducer;
