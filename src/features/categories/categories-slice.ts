import { createSlice, createEntityAdapter, createAsyncThunk } from '@reduxjs/toolkit';
import { getCategories } from '../../services/categories';
import { CategoryEntity, CategoryView } from '../../models/category';
import { RootState } from '../../store';
import { conditionToReloadData } from '../../lib/utils';

const categoriesAdapter = createEntityAdapter<CategoryEntity>({
  selectId: (entity) => entity.id,
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});

export const fetchCategories = createAsyncThunk(
  'categories/fetchAll',
  async (_, thunkApi) => {
    const results = await getCategories();
    return results;
  },
  {
    condition: (_, { getState }) => {
      const categoriesState = (getState() as RootState).categories;
      if (conditionToReloadData(categoriesState) === false) return false;
    },
  }
);

export const categoriesSlice = createSlice({
  name: 'categories',
  initialState: categoriesAdapter.getInitialState({
    isUpdating: false,
    lastFetched: -1,
  }),
  reducers: {
    categoriesReceived: categoriesAdapter.setAll,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCategories.fulfilled, (state, action) => {
      categoriesAdapter.setAll(state, action.payload);
      state.lastFetched = Date.now();
      state.isUpdating = false;
    });
    builder.addCase(fetchCategories.pending, (state) => {
      state.isUpdating = true;
    });
  },
});

export const { categoriesReceived } = categoriesSlice.actions;

export const categoriesSelector = categoriesAdapter.getSelectors<RootState>((state) => state.categories);

export const allCategories = (state: RootState): CategoryView[] => categoriesSelector.selectAll(state);

export const categoriesFromIds = (state: RootState, ids: CategoryEntity['id'][]): CategoryEntity[] => {
  const categories: CategoryEntity[] = [];
  ids.forEach((y) => {
    const category = categoriesSelector.selectById(state, y);
    if (category) {
      categories.push(category);
    }
  });
  return categories;
};
export const isCategoriesUpdating = (state: RootState): boolean => state.categories.isUpdating;

export default categoriesSlice.reducer;
