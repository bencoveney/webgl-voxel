import { EntityPool } from "entity-component-system";
import { SearchNames, EntityNames as ComponentNames } from "../names";
import { TimeTrigger } from "../entity/timeTrigger";

let time = -1;

export const hms = msToHMS(time);

const msInASecond = 1000;
const msInAMinute = 60 * msInASecond;
const msInAnHour = 60 * msInAMinute;

function msToHMS(timeMs) {
	const hours = Math.floor(timeMs / msInAnHour);
	const minutesRemaining = timeMs - (hours * msInAnHour);
	const minutes = Math.floor(minutesRemaining / msInAMinute);
	const secondsRemaining = minutesRemaining - (minutes * msInAMinute);
	const seconds = Math.floor(secondsRemaining / msInASecond);
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
				const path = entities.addComponent(entityId, ComponentNames.PATH)
				path.x = Math.floor(Math.random() * 5),
				path.y = 0,
				path.z = Math.floor(Math.random() * 5)
				console.log(`Moving to ${path.x}, ${path.z}`)
			}
		})
	}

	hms.hours = hours;
	hms.minutes = minutes;
	hms.seconds = seconds;
}