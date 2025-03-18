
import axiosClient from '@/lib/axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface IService {
    id: string; 
    _id: string; 
    type: "protection" | "recovery";
    name: string;
    description: string;
    usageInstructions: string;
    whenToUse:string;
    buttonText: string;
    subtitle: string;
    howItWorks: string[];
    createdAt: Date; 
    updatedAt: Date;
  }
  

interface IServiceState {
  services: IService[];
  loading: boolean;
  error: string | null;
}

export const fetchServices = createAsyncThunk(
  "service/fetchService",
  async (_, thunkAPI) => {
    try {
      const response = await axiosClient.get(`/services`);
      return response.data as IService[];
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const initialState: IServiceState = {
  services: [],
  loading: false,
  error: null,
};

const serviceSlice = createSlice({
  name: "service",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default serviceSlice.reducer;
