import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  productDetailDraft: null,
};

const designerSessionSlice = createSlice({
  name: 'designerSession',
  initialState,
  reducers: {
    saveProductDetailDraft(state, action) {
      state.productDetailDraft = action.payload || null;
    },
    clearProductDetailDraft(state) {
      state.productDetailDraft = null;
    },
  },
});

export const { saveProductDetailDraft, clearProductDetailDraft } = designerSessionSlice.actions;
export default designerSessionSlice.reducer;
