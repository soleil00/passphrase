import { configureStore } from "@reduxjs/toolkit";
import recoverPassphraseslice from "./slices/passphrase";
import serviceSlice from "./slices/service";
import authSlice from "./slices/auth"
import requestSlice from "./slices/requests"
import reviewsSlice from "./slices/reviews";
import earningSlice from "./slices/earning";


export function makeStore() {
  return configureStore({
    reducer: {
      passphrase: recoverPassphraseslice,
      services:serviceSlice,
      auth:authSlice,
      requests:requestSlice,
      reviews:reviewsSlice,
      earnings:earningSlice
    },
  });
}
const store = makeStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
