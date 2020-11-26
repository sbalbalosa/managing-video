import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import videosReducer from './features/videos/videosSlice';
import authorsReducer from './features/authors/authorsSlice';
import categoriesReducer from './features/categories/categoriesSlice';

export const store = configureStore({
  reducer: {
    videos: videosReducer,
    authors: authorsReducer,
    categories: categoriesReducer,
  },
});

// export const createNewStore = (): typeof store => {
//   return configureStore({
//     reducer: {
//       videos: videosReducer,
//     },
//   });
// };

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;

export default store;
