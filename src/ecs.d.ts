declare module "entity-component-system" {
  export class EntityComponentSystem {
    constructor();
    add(system: System): void;
    addEach(system: System, search: string): void;
    run(entityPool: EntityPool, elapsedTime: number): void;
    runs(): number;
    timings(): { [key: string]: number };
    resetTimings(): void;
  }

  export class EntityPool {
    constructor();
    create(): number;
    destroy(id: number): void;
    registerComponent<Component>(
      component: string,
      factory: () => Component,
      reset?: (component: Component) => void,
      size?: number
    ): void;
    addComponent<Component>(id: number, component: string): Component;
    getComponent<Component>(id: number, component: string): Component;
    setComponent<Component>(
      id: number,
      component: string,
      value: Component
    ): void;
    removeComponent<Component>(id: number, component: string): Component;
    onAddComponent<Component>(
      component: string,
      callback: Callback<Component>
    ): void;
    onRemoveComponent<Component>(
      component: string,
      callback: Callback<Component>
    ): void;
    registerSearch(search: string, components: string[]): void;
    find(search: string): number[];
    load(entities: EntityJson[]): void;
    save(): EntityJson[];
  }

  export interface System {
    (entityPool: EntityPool, elapsedTime: number): void;
  }

  export interface Callback<Component> {
    (id: number, component: string, value: Component): void;
  }

  export interface EntityJson {
    id: number;
    [componentName: string]: any;
  }
}
