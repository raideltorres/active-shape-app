import { configureStore } from '@reduxjs/toolkit';

import authReducer from './slices/authSlice';
import { authApi } from './api/authApi';
import { usersApi } from './api/usersApi';
import { trackingApi } from './api/trackingApi';
import { recipesApi } from './api/recipesApi';
import { fastingApi } from './api/fastingApi';
import { constantsApi } from './api/constantsApi';
import { aiNutritionApi } from './api/aiNutritionApi';
import { favoritesApi } from './api/favoritesApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [trackingApi.reducerPath]: trackingApi.reducer,
    [recipesApi.reducerPath]: recipesApi.reducer,
    [fastingApi.reducerPath]: fastingApi.reducer,
    [constantsApi.reducerPath]: constantsApi.reducer,
    [aiNutritionApi.reducerPath]: aiNutritionApi.reducer,
    [favoritesApi.reducerPath]: favoritesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(usersApi.middleware)
      .concat(trackingApi.middleware)
      .concat(recipesApi.middleware)
      .concat(fastingApi.middleware)
      .concat(constantsApi.middleware)
      .concat(aiNutritionApi.middleware)
      .concat(favoritesApi.middleware),
});
