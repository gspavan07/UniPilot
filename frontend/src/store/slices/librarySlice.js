import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

const initialState = {
  books: [],
  myBooks: [],
  status: "idle",
  error: null,
};

export const fetchBooks = createAsyncThunk(
  "library/fetchBooks",
  async (search = "", { rejectWithValue }) => {
    try {
      const response = await api.get(`/library/books?search=${search}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch books"
      );
    }
  }
);

export const addBook = createAsyncThunk(
  "library/addBook",
  async (bookData, { rejectWithValue }) => {
    try {
      const response = await api.post("/library/books", bookData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to add book"
      );
    }
  }
);

export const issueBook = createAsyncThunk(
  "library/issueBook",
  async (issueData, { rejectWithValue }) => {
    try {
      const response = await api.post("/library/issue", issueData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to issue book"
      );
    }
  }
);

export const returnBook = createAsyncThunk(
  "library/returnBook",
  async (returnData, { rejectWithValue }) => {
    try {
      const response = await api.post("/library/return", returnData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to return book"
      );
    }
  }
);

export const fetchMyBooks = createAsyncThunk(
  "library/fetchMyBooks",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/library/my-books");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch my books"
      );
    }
  }
);

export const librarySlice = createSlice({
  name: "library",
  initialState,
  reducers: {
    clearLibraryError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.books = action.payload;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchMyBooks.fulfilled, (state, action) => {
        state.myBooks = action.payload;
      })
      .addCase(addBook.fulfilled, (state, action) => {
        state.books.push(action.payload);
      });
  },
});

export const { clearLibraryError } = librarySlice.actions;

export default librarySlice.reducer;
