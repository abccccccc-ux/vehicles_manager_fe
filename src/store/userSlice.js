import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userApi from '../api/userApi';

// Async actions
export const fetchUsers = createAsyncThunk('users/fetchUsers', async (params, { rejectWithValue }) => {
	try {
		const response = await userApi.getUsers(params);
		return response;
	} catch (err) {
		return rejectWithValue(err.response?.data || err.message);
	}
});

export const fetchUserById = createAsyncThunk('users/fetchUserById', async (userId, { rejectWithValue }) => {
	try {
		const response = await userApi.getUserById(userId);
		return response;
	} catch (err) {
		return rejectWithValue(err.response?.data || err.message);
	}
});

export const deleteUser = createAsyncThunk('users/deleteUser', async (userId, { rejectWithValue }) => {
	try {
		const response = await userApi.deleteUser(userId);
		return { userId, response };
	} catch (err) {
		return rejectWithValue(err.response?.data || err.message);
	}
});

export const editUser = createAsyncThunk('users/editUser', async ({ userId, data }, { rejectWithValue }) => {
	try {
		// call api.editUser(userId, data)
		const response = await userApi.editUser(userId, data);
		return response;
	} catch (err) {
		return rejectWithValue(err.response?.data || err.message);
	}
});

const initialState = {
	users: [],
	userDetails: null,
	loading: false,
	error: null,
	userDetailsLoading: false,
	userDetailsError: null,
};

const userSlice = createSlice({
	name: 'users',
	initialState,
	reducers: {
		clearUserDetails(state) {
			state.userDetails = null;
			state.userDetailsError = null;
			state.userDetailsLoading = false;
		},
	},
	extraReducers: (builder) => {
		builder
			// Fetch users
			.addCase(fetchUsers.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchUsers.fulfilled, (state, action) => {
				state.loading = false;
				state.users = action.payload;
			})
			.addCase(fetchUsers.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})

			// Fetch user by id
			.addCase(fetchUserById.pending, (state) => {
				state.userDetailsLoading = true;
				state.userDetailsError = null;
				state.userDetails = null;
			})
			.addCase(fetchUserById.fulfilled, (state, action) => {
				state.userDetailsLoading = false;
				// Normalize: store the user object itself (not the full axios response)
				if (action.payload?.data?.success && action.payload.data.data?.user) {
					state.userDetails = action.payload.data.data.user;
				} else {
					state.userDetails = action.payload;
				}
			})
			.addCase(fetchUserById.rejected, (state, action) => {
				state.userDetailsLoading = false;
				state.userDetailsError = action.payload;
			})

			// Delete user
			.addCase(deleteUser.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(deleteUser.fulfilled, (state, action) => {
				state.loading = false;
				// remove the deleted user from users list if present (assuming users is an array of objects with _id)
				if (state.users && Array.isArray(state.users)) {
					state.users = state.users.filter((u) => u._id !== action.payload.userId);
				}
			})
			.addCase(deleteUser.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Edit user
			.addCase(editUser.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(editUser.fulfilled, (state, action) => {
				state.loading = false;
				// Update userDetails and users list based on API response shape
				if (action.payload?.data?.success && action.payload.data.data?.user) {
					const updated = action.payload.data.data.user;
					state.userDetails = updated;
					// update users array if present (by matching _id)
					if (Array.isArray(state.users)) {
						state.users = state.users.map((u) => (u._id === updated._id ? { ...u, ...updated } : u));
					}
				}
			})
			.addCase(editUser.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});
	},
});

export const { clearUserDetails } = userSlice.actions;
export default userSlice.reducer;
