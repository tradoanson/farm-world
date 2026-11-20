import type {OnlineSnapshot} from './farm-online';
/** Reject stale snapshots and snapshots belonging to another farm. */
export function reconcileSnapshot(current:OnlineSnapshot|null,incoming:OnlineSnapshot|null):OnlineSnapshot|null {
 if(!incoming)return current;
 if(!current)return incoming;
 if(current.farmId!==incoming.farmId)return current;
 return incoming.revision>=current.revision?incoming:current;
}
