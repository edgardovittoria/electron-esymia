import { ComponentEntity } from "../model/componentEntity/componentEntity";

export const updateOpacityRecursively = (entity: ComponentEntity, opacity: number): ComponentEntity => {
    const newEntity = { ...entity, opacity: opacity };
    if (newEntity.children) {
        newEntity.children = newEntity.children.map(child => updateOpacityRecursively(child, opacity));
    }
    return newEntity;
}
