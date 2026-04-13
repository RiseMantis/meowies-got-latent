import {create} from 'zustand'

export const useMapStore = create((set) => ({
  searchResults: [],
  selectedLocation: null,

  setSearchResults: (results) => set({
    searchResults: results
  }),

  setSelectedLocation: (loc) => set({
    selectedLocation: loc
  })
}));


