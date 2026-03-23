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
import { mealLogsApi } from './api/mealLogsApi';
import { ingredientsApi } from './api/ingredientsApi';
import { supplementsApi } from './api/supplementsApi';
import { workoutsApi } from './api/workoutsApi';
import { userWorkoutsApi } from './api/userWorkoutsApi';
import { pricingApi } from './api/pricingApi';
import { stripeApi } from './api/stripeApi';
import { referralsApi } from './api/referralsApi';
import { helpApi } from './api/helpApi';

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
    [mealLogsApi.reducerPath]: mealLogsApi.reducer,
    [ingredientsApi.reducerPath]: ingredientsApi.reducer,
    [supplementsApi.reducerPath]: supplementsApi.reducer,
    [workoutsApi.reducerPath]: workoutsApi.reducer,
    [userWorkoutsApi.reducerPath]: userWorkoutsApi.reducer,
    [pricingApi.reducerPath]: pricingApi.reducer,
    [stripeApi.reducerPath]: stripeApi.reducer,
    [referralsApi.reducerPath]: referralsApi.reducer,
    [helpApi.reducerPath]: helpApi.reducer,
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
      .concat(favoritesApi.middleware)
      .concat(mealLogsApi.middleware)
      .concat(ingredientsApi.middleware)
      .concat(supplementsApi.middleware)
      .concat(workoutsApi.middleware)
      .concat(userWorkoutsApi.middleware)
      .concat(pricingApi.middleware)
      .concat(stripeApi.middleware)
      .concat(referralsApi.middleware)
      .concat(helpApi.middleware),
});
