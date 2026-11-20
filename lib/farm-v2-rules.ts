/** V2.2–V2.3 shared economy rules. Server RPC must independently enforce these rules. */
export const MAX_WAREHOUSE_LEVEL = 10;
export const MAX_BARN_LEVEL = 5;
export const MAX_PLOTS = 64;
export const INITIAL_PLOTS = 16;
export function warehouseCapacity(level:number):number {
 if(!Number.isSafeInteger(level)||level<0||level>MAX_WAREHOUSE_LEVEL) throw new Error('Invalid warehouse level');
 return 40+level*20;
}
export function unlockedPlotCount(level:number):number {
 if(!Number.isSafeInteger(level)||level<1) throw new Error('Invalid farm level');
 return Math.min(MAX_PLOTS,INITIAL_PLOTS+Math.floor((level-1)/2)*4);
}
export function isPlotUnlocked(plotIndex:number,level:number):boolean {
 return Number.isSafeInteger(plotIndex)&&plotIndex>=0&&plotIndex<unlockedPlotCount(level);
}
export function cropUnlockLevel(crop:number):number {
 const levels=[1,2,3,5,8];
 if(!Number.isSafeInteger(crop)||crop<0||crop>=levels.length) throw new Error('Invalid crop');
 return levels[crop];
}
export function canPlantCrop(crop:number,level:number):boolean {
 return Number.isSafeInteger(level)&&level>=cropUnlockLevel(crop);
}
export function canStore(current:number,incoming:number,capacity:number):boolean {
 return [current,incoming,capacity].every(x=>Number.isSafeInteger(x)&&x>=0)&&current<=capacity&&incoming<=capacity-current;
}
