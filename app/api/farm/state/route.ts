import {NextResponse} from 'next/server';
export function GET(){return NextResponse.json({error:'NOT_IMPLEMENTED',message:'Authentication and PostgreSQL persistence are planned for V0.1B.'},{status:501});}
