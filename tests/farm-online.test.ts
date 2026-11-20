import {describe,expect,it} from 'vitest';
import {parseOnlineResult,validateCommand} from '../lib/farm-online';
const farmId='123e4567-e89b-42d3-a456-426614174000';
describe('V1.0 online boundary',()=>{
 it('accepts all server commands',()=>{
  expect(()=>validateCommand({action:'plant',index:63,crop:4})).not.toThrow();
  expect(()=>validateCommand({action:'harvest',index:0})).not.toThrow();
  expect(()=>validateCommand({action:'sell',crop:2,quantity:5})).not.toThrow();
  expect(()=>validateCommand({action:'claim',quest:2})).not.toThrow();
 });
 it('rejects invalid bounds',()=>{
  expect(()=>validateCommand({action:'plant',index:-1,crop:0})).toThrow();
  expect(()=>validateCommand({action:'plant',index:64,crop:0})).toThrow();
  expect(()=>validateCommand({action:'plant',index:0,crop:5})).toThrow();
  expect(()=>validateCommand({action:'sell',crop:0,quantity:0})).toThrow();
  expect(()=>validateCommand({action:'sell',crop:0,quantity:100001})).toThrow();
  expect(()=>validateCommand({action:'claim',quest:3})).toThrow();
 });
 it('rejects forged or malformed results',()=>{
  expect(()=>parseOnlineResult(null)).toThrow();
  expect(()=>parseOnlineResult({farm_id:farmId,coins:-1,harvested:0,revision:1,xp:0,sold:0,action:'plant'})).toThrow();
  expect(()=>parseOnlineResult({farm_id:'x',coins:100,harvested:0,revision:1,xp:0,sold:0,action:'plant'})).toThrow();
 });
 it('accepts V1 result',()=>{
  expect(parseOnlineResult({farm_id:farmId,coins:99,harvested:0,revision:1,xp:0,sold:0,action:'plant'}).coins).toBe(99);
 });
});