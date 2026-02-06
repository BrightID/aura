import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '..';

const initialContactsState = {
  storedInfoHashed: [] as { type: string; value: string }[],
};

export const contactsSlice = createSlice({
  name: 'contacts',
  initialState: initialContactsState,
  reducers: {
    addContactInfo(
      state,
      action: PayloadAction<{ type: string; value: string }>,
    ) {
      state.storedInfoHashed.push(action.payload);
    },
  },
});

export const selectContacts = createSelector(
  (state: RootState) => state.contacts,
  (contacts) => contacts.storedInfoHashed,
);

export const { addContactInfo } = contactsSlice.actions;
