import axiosClient from "@/lib/axios"
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { IUser } from "./auth";
import { IRequest } from "./requests";

export interface IEarning {
    _id: string; 
    handler: IUser;
    amount: number;
    request: IRequest;
    transactionId: string;
    isPaid: boolean; 
    note?: string; 
    createdAt: Date;
    updatedAt: Date;
}

interface EarningsState {
    earnings: IEarning[]; 
    loading: boolean;
    updating: boolean,
    error: string | null;
}

const initialState: EarningsState = {
  earnings: [],
  loading: false,
  updating: false,
  error: null,
}

export const fetchEarnings = createAsyncThunk("earnings/fetchEarnings", async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token")
    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await axiosClient.get("/earnings", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data || error.message)
  }
})

interface IUpdateEarningNotesPayload {
    earningId: string;
    note: string;
}

export const updateEarningNotes = createAsyncThunk(
    "earnings/updateNotes",
    async ({ earningId, note }: IUpdateEarningNotesPayload, { rejectWithValue }) => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("No authentication token found")
        }
  
        const response = await axiosClient.patch(
          `/earnings/${earningId}`,
          { note },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
  
        return response.data
      } catch (error:any) {
        return rejectWithValue(error.response?.data || error.message)
      }
    },
  )
  
  export const updateEarningPaymentStatus = createAsyncThunk(
    "earnings/updatePaymentStatus",
    async (id:string, { rejectWithValue }) => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("No authentication token found")
        }
  
        const response = await axiosClient.patch(
          `/earnings/${id}/paid`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
  
        return response.data
      } catch (error:any) {
        return rejectWithValue(error.response?.data || error.message)
      }
    },
  )

const earningsSlice = createSlice({
  name: "earnings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEarnings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEarnings.fulfilled, (state, action) => {
        state.earnings = action.payload
        state.loading = false
      })
      .addCase(fetchEarnings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(updateEarningNotes.pending, (state) => {
        state.updating = true
        state.error = null
      })
      .addCase(updateEarningNotes.fulfilled, (state, action) => {
        state.updating = false
        // Update the specific earning in the array
        const index = state.earnings.findIndex((earning) => earning._id === action.payload._id)
        if (index !== -1) {
          state.earnings[index] = action.payload
        }
      })
      .addCase(updateEarningNotes.rejected, (state, action) => {
        state.updating = false
        state.error = action.payload as never
      })

      // Update payment status cases
      .addCase(updateEarningPaymentStatus.pending, (state) => {
        state.updating = true
        state.error = null
      })
      .addCase(updateEarningPaymentStatus.fulfilled, (state, action) => {
        state.updating = false
        // Update the specific earning in the array
        const index = state.earnings.findIndex((earning) => earning._id === action.payload._id)
        if (index !== -1) {
          state.earnings[index] = action.payload
        }
      })
      .addCase(updateEarningPaymentStatus.rejected, (state, action) => {
        state.updating = false
        state.error = action.payload as never
      })
  },
})

export default earningsSlice.reducer
