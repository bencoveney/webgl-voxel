export interface TimeTrigger {
  frequency: "hourly";
  action: "moveToRandomLocation";
}

export function timeTriggerFactory(): TimeTrigger {
  return {
    frequency: "hourly",
    action: "moveToRandomLocation"
  };
}
