import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '@/lib/axios';
import { IRequest } from './requests';
import { onIncompletePaymentFound } from '@/lib/pi';

export interface IUser {
    username: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    uid: string;
    requests: IRequest[];
    role: "admin" | "user";
}
const scopes = ["username", "payments"];

export type AuthResult = {
    accessToken: string;
    user: {
      uid: string;
      username: string;
    };
  };

interface AuthState {
  token: string | null;
  loading: boolean;
  error: string | null;
  currentUser: IUser | null;
  isPiBrowser:boolean
}

const initialState: AuthState = {
  token: null,
  loading: false,
  error: null,
  currentUser: null,
  isPiBrowser:false
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, thunkAPI) => {
    try {
      const response = await axiosClient.post('/users/login', credentials);
      const token = response.data.token;
      return {
        token,
        currentUser:response.data.user
      }
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const authenticateUser = createAsyncThunk(
    "user/authenticateUser", 
    async (_, { rejectWithValue }) => {
      try {
        await (window as any).Pi.init({
          version: "2.0",
          sandbox: process.env.NODE_ENV !== "production" ? true : false,
        });
        const authResult: AuthResult = await (window as any).Pi.authenticate(
          scopes,
          onIncompletePaymentFound
        );
        const response = await axiosClient.post("/users/signin", { authResult });
        return response.data;
      } catch (error: any) {
        console.error("Authentication failed:", error);
        return rejectWithValue(error.response?.data || "Authentication failed");
      }
    }
  );

export const initializePiSDK = createAsyncThunk(
    "auth/initializePiSDK",
    async (_, { dispatch }) => {
      const script = document.createElement("script");
      script.src = "https://sdk.minepi.com/pi-sdk.js";
      document.body.appendChild(script);

      await new Promise((resolve) => {
        script.onload = resolve;
      });

      if ((window as any).Pi) {
        await (window as any).Pi.init({
          version: "2.0",
          sandbox: process.env.NODE_ENV !== "production",
        });

        const checkInitialized = () => {
          return new Promise<void>((resolve) => {
            const interval = setInterval(() => {
              if ((window as any).Pi?.initialized) {
                clearInterval(interval);
                dispatch(setPiBrowser())
                resolve();
              }
            }, 100);
          });
        };

        console.log("SDK initialized successfully");

        await checkInitialized();
      } else {
        console.error("Pi SDK not loaded.");
      }
    }
  );
  

export const getUserInfo = createAsyncThunk(
  'auth/users/me',
  async (_, thunkAPI) => {
    try {
      const response = await axiosClient.get('/users/me');
      const token = response.data.token;
      localStorage.setItem('token', token);
      return response.data.user
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
  logout: (state) => {
    state.token = null;
    state.currentUser = null;
    localStorage.removeItem('token');
  },
  setPiBrowser: (state) => {
    state.isPiBrowser=true
  },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.currentUser = action.payload.currentUser;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getUserInfo.pending, (state, action) => {
        // state.loading = true
      })
      .addCase(getUserInfo.rejected, (state, action) => {
        state.loading = false
      })
      .addCase(getUserInfo.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.loading = false
      })
      .addCase(authenticateUser.pending, (state, action) => {
        state.loading = true
      })
      .addCase(authenticateUser.rejected, (state, action) => {
        state.loading = false
      })
      .addCase(authenticateUser.fulfilled, (state, action) => {
        localStorage.setItem("token",action.payload.token)
        state.currentUser = action.payload.currentUser;
      // alert(action.payload.currentUser.username)
      });
  },
});

export const { logout ,setPiBrowser} = authSlice.actions;
export default authSlice.reducer;
