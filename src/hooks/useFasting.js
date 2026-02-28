import { useCallback, useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';

import {
  useGetFastingPlanQuery,
  useGetOngoingSessionQuery,
  useStartFastingSessionMutation,
  useEndFastingSessionMutation,
  useGetProfileQuery,
  useUpsertUserMutation,
} from '../store/api';
import { getStagesReachedLabels } from '../constants/fasting';
import { secondsToTime } from '../utils/fasting';

export const useFasting = () => {
  const [fastingPlan, setFastingPlan] = useState(null);

  const { data: profileData } = useGetProfileQuery();
  const { data: fastingPlanData } = useGetFastingPlanQuery(
    profileData?.fastingSettings?.fastingPlanId,
    { skip: !profileData?.fastingSettings?.fastingPlanId },
  );
  const { data: ongoingSession } = useGetOngoingSessionQuery(undefined, {
    skip: !profileData?._id,
  });

  const [upsertUser] = useUpsertUserMutation();
  const [startFastingSession] = useStartFastingSessionMutation();
  const [endFastingSession] = useEndFastingSessionMutation();

  useEffect(() => {
    if (fastingPlanData) {
      setFastingPlan(fastingPlanData);
    }
  }, [fastingPlanData]);

  const startFasting = useCallback(async () => {
    try {
      await upsertUser({
        id: profileData?._id,
        fastingSettings: {
          ...profileData?.fastingSettings,
          lastFastingStarted: new Date().toISOString(),
          lastFastingEnded: null,
        },
      }).unwrap();

      if (fastingPlan) {
        await startFastingSession({
          plannedDurationHours: fastingPlan.fastingTime,
          fastingPlanId: fastingPlan._id,
          fastingPlanTitle: fastingPlan.title,
        }).unwrap();
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to start fasting session. Please try again.' });
    }
  }, [profileData, upsertUser, fastingPlan, startFastingSession]);

  const stopFasting = useCallback(
    async (elapsedSeconds, stagesReached = []) => {
      try {
        await upsertUser({
          id: profileData?._id,
          fastingSettings: {
            ...profileData?.fastingSettings,
            lastFastingStarted: null,
            lastFastingEnded: new Date().toISOString(),
          },
        }).unwrap();

        if (ongoingSession?._id) {
          const goalAchieved = fastingPlan
            ? elapsedSeconds >= fastingPlan.fastingTime * 3600
            : false;

          await endFastingSession({
            sessionId: ongoingSession._id,
            actualDurationSeconds: Math.round(elapsedSeconds),
            goalAchieved,
            stagesReached,
          }).unwrap();
        }

        Toast.show({ type: 'success', text1: 'Great job!', text2: `You fasted for ${secondsToTime(elapsedSeconds)}` });
      } catch {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to end fasting session. Please try again.' });
      }
    },
    [profileData, upsertUser, ongoingSession, fastingPlan, endFastingSession],
  );

  return {
    profileData,
    fastingPlan,
    ongoingSession,
    isFasting: !!profileData?.fastingSettings?.lastFastingStarted,
    fastingStarted: profileData?.fastingSettings?.lastFastingStarted,
    startFasting,
    stopFasting,
  };
};
