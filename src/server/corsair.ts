import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { createCorsair } from 'corsair';
import { googlecalendar } from '@corsair-dev/googlecalendar';
import { gmail } from '@corsair-dev/gmail';
import { conn } from './db';


export const corsair = createCorsair({
    plugins: [gmail(), googlecalendar()],
    database: conn,
    kek: process.env.CORSAIR_KEK!,
    multiTenancy: true,
});