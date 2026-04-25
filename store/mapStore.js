import {create} from 'zustand'

export const useMapStore = create((set) => ({
  searchResults: [],
  selectedLocation: null,
  activeFilters: [],

  setSearchResults: (results) => set({
    searchResults: results
  }),

  setSelectedLocation: (loc) => set({
    selectedLocation: loc
  }),

  setActiveFilters: (filters) => set({
    activeFilters: filters
  }),

  toggleFilter: (filter) => set((state) => ({
    activeFilters: state.activeFilters.includes(filter)
      ? state.activeFilters.filter((f) => f !== filter)
      : [...state.activeFilters, filter]
  })),

  clearFilters: () => set({
    activeFilters: []
  }),

  routeEnd: null,
  setRouteEnd: (loc) => set({
    routeEnd: loc
  })
}));


