import { Stack } from 'expo-router';

export default function FacilitiesLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Facilities Management' }} />
      <Stack.Screen name="campuses" options={{ title: 'Manage Campuses' }} />
      <Stack.Screen name="buildings" options={{ title: 'Manage Buildings' }} />
      <Stack.Screen name="halls" options={{ title: 'Manage Halls' }} />
    </Stack>
  );
}
