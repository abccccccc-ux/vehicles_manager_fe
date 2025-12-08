import { createSlice } from '@reduxjs/toolkit';
import { getUserPermissions } from '../utils/permissions';

const initialState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  userPermissions: [],
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action) {
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
      state.isAuthenticated = true;
      // Tự động tính toán permissions dựa trên role
      state.userPermissions = getUserPermissions(action.payload.user?.role);
    },
    logout(state) {
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
      state.userPermissions = [];
    },
    updateUserPermissions(state, action) {
      // Action để cập nhật permissions khi cần
      state.userPermissions = action.payload;
    },
  },
});

export const { loginSuccess, logout, updateUserPermissions } = authSlice.actions;
export default authSlice.reducer;
