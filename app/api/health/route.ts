export const dynamic = 'force-static';
import {NextResponse} from 'next/server';
export function GET(){return NextResponse.json({status:'ok',version:'0.1.0-alpha',mode:'prototype',database:'not-connected'});}
