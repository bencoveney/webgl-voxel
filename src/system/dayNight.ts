import { EntityPool } from "entity-component-system";
import { SearchNames, ComponentNames as ComponentNames } from "../constants";
import { TimeTrigger } from "../component/timeTrigger";
import { getRandomDestination } from "./pathFind";

let time = -1;

export const hms = msToHMS(time);

const msInASecond = 1000;
const msInAMinute = 60 * msInASecond;
const msInAnHour = 60 * msInAMinute;
const hoursInADay = 24;

function msToHMS(timeMs) {
	let hours = Math.floor(timeMs / msInAnHour);
	const minutesRemaining = timeMs - (hours * msInAnHour);
	const minutes = Math.floor(minutesRemaining / msInAMinute);
	const secondsRemaining = minutesRemaining - (minutes * msInAMinute);
	const seconds = Math.floor(secondsRemaining / msInASecond);

	hours = hours % hoursInADay;

	return { hours, minutes, seconds };
}

const timeMultiplier = 250;

export function dayNightSystem(entities: EntityPool, deltaTime: number) {
	time += deltaTime;
	const { hours, minutes, seconds } = msToHMS(time * timeMultiplier);

	if (hours < 0 || minutes < 0 || seconds < 0) {
		throw new Error("Bad Time!");
	}

	const hourChanged = hours != hms.hours;

	if (hourChanged) {
		entities.find(SearchNames.TRIGGERABLE).forEach(entityId => {
			const {frequency, action} = entities.getComponent<TimeTrigger>(entityId, ComponentNames.TIME_TRIGGER);
			if (frequency == "hourly" && action == "moveToRandomLocation") {
				const dest = getRandomDestination();
				const path = entities.addComponent(entityId, ComponentNames.PATH)
				path.x = dest.x;
				path.y = dest.y;
				path.z = dest.z;
			}
		})
	}

	hms.hours = hours;
	hms.minutes = minutes;
	hms.seconds = seconds;
}