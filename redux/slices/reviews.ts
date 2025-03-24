import axiosClient from "@/lib/axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";


interface Feedback {
  _id?: string;
  username: string;
  comment: string;
  rating: number;
  createdAt: Date;
  updatedAt: string;
  image?: string;
}
interface FeedbackR {

  comment: string;
  rating: number;
//   image?: string;
}


interface FeedbackState {
  feedbacks: Feedback[];
  loading: boolean;
  error: string | null;
}


const initialState: FeedbackState = {
  feedbacks: [],
  loading: false,
  error: null,
};


export const fetchFeedbacks = createAsyncThunk(
  "feedback/fetchFeedbacks",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token"); 
      const response = await axiosClient.get("/reviews", {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch feedback");
    }
  }
);

// Create new feedback
export const createFeedback = createAsyncThunk(
  "feedback/createFeedback",
  async (feedback: FeedbackR, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token"); 
      const response = await axiosClient.post("/reviews", feedback, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create feedback");
    }
  }
);

// Redux slice
const feedbackSlice = createSlice({
  name: "feedback",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch feedbacks
      .addCase(fetchFeedbacks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeedbacks.fulfilled, (state, action) => {
        state.loading = false;
        state.feedbacks = action.payload;
      })
      .addCase(fetchFeedbacks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create feedback
      .addCase(createFeedback.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createFeedback.fulfilled, (state, action) => {
        state.loading = false;
        state.feedbacks.push(action.payload);
      })
      .addCase(createFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default feedbackSlice.reducer;
