import { hms } from "../system/dayNight";
import { intersectionPoint } from "../system/render";

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

function getSelection() {
	if (intersectionPoint.x !== undefined && intersectionPoint.y !== undefined && intersectionPoint.z !== undefined) {
		return `x ${intersectionPoint.x}, y ${intersectionPoint.y}, z ${intersectionPoint.z}`;
	}
	else {
		return "Nothing";
	}
}

export function renderUi(deltaTime: number) {
	setUi(`Time: ${getTime()}
FPS: ${getFps(deltaTime)}
Selected: ${getSelection()}
`);
}

let previousUi = ""
function setUi(text: string) {
	if (previousUi != text) {
		container.innerText = text;
		previousUi = text;
	}
}
