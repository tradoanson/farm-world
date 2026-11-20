import {describe,it,expect} from 'vitest';
import {readFileSync,existsSync} from 'node:fs';
describe('2.5D graphics isolation',()=>{
 const page=readFileSync('app/page.tsx','utf8');
 const css=readFileSync('app/style.css','utf8');
 it('ships all five original crop illustrations and landscape',()=>{
  for(let i=0;i<5;i++)expect(existsSync('public/art/crop-'+i+'.svg')).toBe(true);
  expect(existsSync('public/art/farm-landscape.svg')).toBe(true);
 });
 it('uses actual artwork rather than only emoji and old diamond rotation',()=>{
  expect(page).toContain('url(art/crop-');
  expect(page).toContain('url(art/farm-landscape.svg)');
  expect(css).toContain('.tile.illustrated.ripe>span');
  expect(css).toContain('transform:perspective(1100px) rotateX(17deg)');
 });
 it('keeps original command and realtime integration',()=>{
  expect(page).toContain('applyOnlineCommand(');
  expect(page).toContain('readOnlineSnapshot(');
  expect(page).toContain('reconcileSnapshot(');
  expect(page).toContain('clickTile(i)');
 });
});
