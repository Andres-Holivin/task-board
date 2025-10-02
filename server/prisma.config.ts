import "dotenv/config";
import type { PrismaConfig } from "prisma";
import path from "node:path";


export default {
    schema: path.join("prisma"),
    migrations: {
        path: path.join("prisma", "migrations")
    },
    views: {
        path: path.join("prisma", "views"),
    },
    typedSql: {
        path: path.join("prisma", "queries"),
    },
} satisfies PrismaConfig;
