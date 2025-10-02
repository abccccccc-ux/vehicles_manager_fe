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
				state.userDetails = action.payload;
			})
			.addCase(fetchUserById.rejected, (state, action) => {
				state.userDetailsLoading = false;
				state.userDetailsError = action.payload;
			});
	},
});

export const { clearUserDetails } = userSlice.actions;
export default userSlice.reducer;
