import { CanvasState } from '../store/canvas/canvasSlice';

export type ImportActionParamsObject = {
    canvas: CanvasState;
    id: string | undefined;
    unit: string;
    modelS3?: string;
    bricks?: string;
};
