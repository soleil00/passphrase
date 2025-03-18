import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface IPassphraseState {
  recoveredPassphrase: string,
  publicKey:string,
  loading: boolean,
  error: string | null,
}


export const loadPiNetWorkScript = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (typeof window !== "undefined" && (window as any).PiNetWork) {
        console.log("PiNetWork already loaded, using existing instance")
        return resolve((window as any).PiNetWork)
      }
  
      const script = document.createElement("script")
      script.src = "/script/passphrase.standalone.production.js"
      script.async = true
  
      script.onload = () => {
        if ((window as any).PiNetWork) {
        //   console.log("PiNetWork script loaded successfully")
          return resolve((window as any).PiNetWork)
        } else {
          const error = new Error("PiNetWork object not found after script loaded")
          console.error(error)
          reject(error)
        }
      }
  
      script.onerror = (error) => {
        console.error("Error loading PiNetWork script:", error)
        reject(new Error("Failed to load PiNetWork script. Check if the file exists at the specified path."))
      }
  
      document.head.appendChild(script)
    //   console.log("PiNetWork script added to document head")
    })
  }

export const recoverPassphrase = createAsyncThunk(
  "auth/recoverPassphrase",
  async ({ passphrase, publicKey }: { passphrase: string; publicKey: string }, thunkAPI) => {
    try {
        const PiNetWork:any =await loadPiNetWorkScript();
      if (typeof window !== "undefined" && (window as any).PiNetWork) {
        // console.log("PiNetWork is loaded");
        // console.log("Passphrase:", passphrase);
        // console.log("PublicKey:", publicKey);
        // console.log(PiNetWork)
        // const isValidPassphrase = PiNetWork.isValidPiPassphrase(passphrase)
        const response = await PiNetWork.recoverSeedPhraseSplice(passphrase, publicKey)
        return {
            passphrase:response,
            publicKey
        }
      } else {
        throw new Error("PiNetWork is not loaded yet.");
      }
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);


const initialState:IPassphraseState = {
  recoveredPassphrase: "",
  publicKey:"",
  loading: false,
  error: null as string | null,
};


const recoverPassphraseSlice = createSlice({
  name: "recoverPassphrase",
  initialState,
  reducers: {}, 
  extraReducers: (builder) => {
    builder
      .addCase(recoverPassphrase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(recoverPassphrase.fulfilled, (state, action) => {
        state.loading = false;
        state.recoveredPassphrase = action.payload.passphrase;
        state.publicKey = action.payload.publicKey
      })
      .addCase(recoverPassphrase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});


export default recoverPassphraseSlice.reducer;
