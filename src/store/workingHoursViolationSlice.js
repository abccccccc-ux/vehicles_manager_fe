import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getWorkingHoursViolations } from '../api/workingHoursViolationApi';

// Async thunk để fetch working hours violations
export const fetchWorkingHoursViolations = createAsyncThunk(
  'workingHoursViolation/fetchWorkingHoursViolations',
  async (params, { rejectWithValue }) => {
    try {
      const response = await getWorkingHoursViolations(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const workingHoursViolationSlice = createSlice({
  name: 'workingHoursViolation',
  initialState: {
    list: [],
    loading: false,
    error: null,
    selectedViolation: null,
    detailLoading: false,
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
    // Filters
    search: '',
    violationType: '',
    severity: '',
    status: '',
    startDate: '',
    endDate: '',
  },
  reducers: {
    setSelectedViolation: (state, action) => {
      state.selectedViolation = action.payload;
    },
    setDetailLoading: (state, action) => {
      state.detailLoading = action.payload;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setSearch: (state, action) => {
      state.search = action.payload;
      // Reset to first page when search changes
      state.pagination.current = 1;
    },
    setViolationType: (state, action) => {
      state.violationType = action.payload;
      state.pagination.current = 1;
    },
    setSeverity: (state, action) => {
      state.severity = action.payload;
      state.pagination.current = 1;
    },
    setStatus: (state, action) => {
      state.status = action.payload;
      state.pagination.current = 1;
    },
    setStartDate: (state, action) => {
      state.startDate = action.payload;
      state.pagination.current = 1;
    },
    setEndDate: (state, action) => {
      state.endDate = action.payload;
      state.pagination.current = 1;
    },
    clearFilters: (state) => {
      state.search = '';
      state.violationType = '';
      state.severity = '';
      state.status = '';
      state.startDate = '';
      state.endDate = '';
      state.pagination.current = 1;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkingHoursViolations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkingHoursViolations.fulfilled, (state, action) => {
        state.loading = false;
        
        // Xử lý response từ API /access-logs/stats/violations
        const responseData = action.payload.data || action.payload;
        const violations = responseData.violations || [];
        
        // Flatten violations từ cấu trúc nested thành danh sách đơn giản
        const flattenedViolations = [];
        violations.forEach(userViolation => {
          // Xử lý lateEntries
          userViolation.lateEntries?.forEach(entry => {
            flattenedViolations.push({
              _id: `${userViolation.user._id}-late-${entry.date}-${entry.time}`,
              licensePlate: entry.licensePlate,
              owner: userViolation.user,
              violationType: 'late_entry',
              createdAt: `${entry.date}T${entry.time}:00`,
              violationTime: `${entry.date}T${entry.time}:00`,
              lateMinutes: entry.lateMinutes,
              severity: entry.lateMinutes > 60 ? 'high' : entry.lateMinutes > 30 ? 'medium' : 'low',
              verificationStatus: 'pending',
              notes: `Đi muộn ${entry.lateMinutes} phút`,
              allowedTime: responseData.summary?.workingHoursConfig?.startTime || '08:00'
            });
          });
          
          // Xử lý earlyExits
          userViolation.earlyExits?.forEach(exit => {
            flattenedViolations.push({
              _id: `${userViolation.user._id}-early-${exit.date}-${exit.time}`,
              licensePlate: exit.licensePlate,
              owner: userViolation.user,
              violationType: 'early_exit',
              createdAt: `${exit.date}T${exit.time}:00`,
              violationTime: `${exit.date}T${exit.time}:00`,
              earlyMinutes: exit.earlyMinutes,
              severity: exit.earlyMinutes > 60 ? 'high' : exit.earlyMinutes > 30 ? 'medium' : 'low',
              verificationStatus: 'pending',
              notes: `Về sớm ${exit.earlyMinutes} phút`,
              allowedTime: responseData.summary?.workingHoursConfig?.endTime || '16:30'
            });
          });
        });
        
        state.list = flattenedViolations;
        state.pagination = {
          ...state.pagination,
          total: responseData.summary?.totalViolations || flattenedViolations.length,
        };
      })
      .addCase(fetchWorkingHoursViolations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.list = [];
      });
  },
});

export const {
  setSelectedViolation,
  setDetailLoading,
  setPagination,
  setSearch,
  setViolationType,
  setSeverity,
  setStatus,
  setStartDate,
  setEndDate,
  clearFilters,
  clearError,
} = workingHoursViolationSlice.actions;

export default workingHoursViolationSlice.reducer;
