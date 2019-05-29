import { hms } from "../system/dayNight";

const container = document.createElement("div");
container.id = "ui";
document.body.appendChild(container);

function getTime() {
	function leftPad(value: number) {
		const current = value.toString();
		return "0".repeat(2 - current.length) + current;
	}

	return `${leftPad(hms.hours)}:${leftPad(hms.minutes)}`
}

function getFps(deltaTime) {
	return Math.floor(1000 / deltaTime);
}

export function renderUi(deltaTime: number) {
	setUi(`Time: ${getTime()}
FPS: ${getFps(deltaTime)}`);
}

let previousUi = ""
function setUi(text: string) {
	if (previousUi != text) {
		container.innerText = text;
		previousUi = text;
	}
}
