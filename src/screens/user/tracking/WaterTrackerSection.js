import React from 'react';
import { View } from 'react-native';

import { WaterIntakeSelector } from '../../../components/molecules';

const WaterTrackerSection = ({ todayData, waterGoalLiters, onDrink, saving }) => (
  <View>
    <WaterIntakeSelector
      totalConsumed={todayData.water || 0}
      dailyGoalLiters={waterGoalLiters / 1000}
      onDrink={onDrink}
      loading={saving}
    />
  </View>
);

export default WaterTrackerSection;
