import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import RecipesScreen from '../../screens/user/RecipesScreen';
import RecipeDetailsScreen from '../../screens/user/RecipeDetailsScreen';

const Stack = createNativeStackNavigator();

const RecipesStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Recipes" component={RecipesScreen} />
      <Stack.Screen name="RecipeDetails" component={RecipeDetailsScreen} />
    </Stack.Navigator>
  );
};

export default RecipesStack;
