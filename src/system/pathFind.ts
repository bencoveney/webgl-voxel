import { EntityPool } from "entity-component-system";
import { SearchNames, EntityNames } from "../names";
import { Position } from "../entity/position";
import { PathTo } from "../entity/pathTo";

export function pathFindSystem(entities: EntityPool, deltaTime: number): void {
	entities.find(SearchNames.PATHABLE).forEach(entityId => {
    const path = entities.getComponent<PathTo>(entityId, EntityNames.PATH);
		const position = entities.getComponent<Position>(entityId, EntityNames.POSITION);

		const speed = deltaTime * 0.0003;

		const deltaX = path.x - position.x;
		const deltaY = path.y - position.y;
		const deltaZ = path.z - position.z;

		const magnitude = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY) + (deltaZ * deltaZ))

		if (magnitude <= speed) {
			position.x = path.x;
			position.y = path.y;
			position.z = path.z;
			entities.removeComponent(entityId, EntityNames.PATH);
			return;
		}

		position.x += (deltaX / magnitude) * speed;
		position.y += (deltaY / magnitude) * speed;
		position.z += (deltaZ / magnitude) * speed;
	})
}