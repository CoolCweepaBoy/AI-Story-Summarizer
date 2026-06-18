import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import * as schema from "./schema.js";
import fs from "fs";
import path from "path";

const { Pool } = pkg;

let pool = null;
let dbInstance = null;

function dbToJsKey(dbKey) {
  if (dbKey === 'uid') return 'uid';
  return dbKey.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
}

function getSQLParamsAndCols(sqlObj) {
  if (!sqlObj || !sqlObj.queryChunks) return [];
  const results = [];
  
  const chunks = sqlObj.queryChunks;
  if (chunks.some((c) => c && c.queryChunks)) {
    chunks.forEach((c) => {
      results.push(...getSQLParamsAndCols(c));
    });
    return results;
  }
  
  let colName = null;
  let paramVal = null;
  let hasParam = false;
  
  for (const chunk of chunks) {
    if (chunk && typeof chunk === 'object') {
      if (chunk.table && chunk.name) {
        colName = chunk.name;
      }
      if ('value' in chunk && !chunk.table && chunk.constructor.name === 'Param') {
        paramVal = chunk.value;
        hasParam = true;
      }
    }
  }
  
  if (colName && hasParam) {
    results.push({ col: colName, val: paramVal });
  }
  
  return results;
}

function getTableName(tableObj) {
  if (!tableObj) return "";
  const symbols = Object.getOwnPropertySymbols(tableObj);
  for (const sym of symbols) {
    if (sym.description === "drizzle:Name") {
      return tableObj[sym];
    }
  }
  if (tableObj.sessionToken !== undefined) return "sessions";
  if (tableObj.uid !== undefined) return "users";
  return "generations";
}

const dbPath = path.join(process.cwd(), "local_db.json");

function readDb() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ users: [], generations: [], sessions: [] }, null, 2));
  }
  try {
    const data = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
    if (!data.sessions) data.sessions = [];
    return data;
  } catch (err) {
    return { users: [], generations: [], sessions: [] };
  }
}

function writeDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

const mockDb = {
  select: () => ({
    from: async (tableObj) => {
      const tableName = getTableName(tableObj);
      const data = readDb();
      return data[tableName] || [];
    }
  }),
  insert: (tableObj) => {
    const tableName = getTableName(tableObj);
    return {
      values: (valueObj) => {
        const execute = async () => {
          const data = readDb();
          const rows = data[tableName] || [];
          const newId = rows.length > 0 ? Math.max(...rows.map((r) => r.id || 0)) + 1 : 1;
          const record = {
            id: newId,
            createdAt: new Date().toISOString(),
            ...valueObj,
          };
          rows.push(record);
          data[tableName] = rows;
          writeDb(data);
          return [record];
        };
        return {
          onConflictDoUpdate: ({ target, set }) => ({
            returning: async () => {
              const data = readDb();
              const rows = data[tableName] || [];
              const conflictUid = valueObj.uid;
              const existingIndex = rows.findIndex((r) => r.uid === conflictUid);
              if (existingIndex !== -1) {
                rows[existingIndex] = {
                  ...rows[existingIndex],
                  ...set,
                };
                data[tableName] = rows;
                writeDb(data);
                return [rows[existingIndex]];
              } else {
                return execute();
              }
            }
          }),
          returning: async () => execute()
        };
      }
    };
  },
  delete: (tableObj) => {
    const tableName = getTableName(tableObj);
    return {
      where: async (whereSql) => {
        const data = readDb();
        const rows = data[tableName] || [];
        const conds = getSQLParamsAndCols(whereSql);
        const remaining = rows.filter((item) => {
          return !conds.every(({ col, val }) => {
            const jsKey = dbToJsKey(col);
            return item[jsKey] === val;
          });
        });
        data[tableName] = remaining;
        writeDb(data);
      }
    };
  },
  update: (tableObj) => {
    const tableName = getTableName(tableObj);
    return {
      set: (updateValues) => ({
        where: async (whereSql) => {
          const data = readDb();
          const rows = data[tableName] || [];
          const conds = getSQLParamsAndCols(whereSql);
          const updated = rows.map((item) => {
            const matches = conds.every(({ col, val }) => {
              const jsKey = dbToJsKey(col);
              return item[jsKey] === val;
            });
            if (matches) {
              return { ...item, ...updateValues };
            }
            return item;
          });
          data[tableName] = updated;
          writeDb(data);
        }
      })
    };
  },
  query: {
    users: {
      findFirst: async (options) => {
        const data = readDb();
        const rows = data.users;
        if (!options || !options.where) return rows[0] || null;
        const conds = getSQLParamsAndCols(options.where);
        const matched = rows.find((item) => {
          return conds.every(({ col, val }) => {
            const jsKey = dbToJsKey(col);
            return item[jsKey] === val;
          });
        });
        return matched || null;
      }
    },
    sessions: {
      findFirst: async (options) => {
        const data = readDb();
        const rows = data.sessions || [];
        if (!options || !options.where) return rows[0] || null;
        const conds = getSQLParamsAndCols(options.where);
        const matched = rows.find((item) => {
          return conds.every(({ col, val }) => {
            const jsKey = dbToJsKey(col);
            return item[jsKey] === val;
          });
        });
        return matched || null;
      }
    },
    generations: {
      findFirst: async (options) => {
        const data = readDb();
        const rows = data.generations;
        if (!options || !options.where) return rows[0] || null;
        const conds = getSQLParamsAndCols(options.where);
        const matched = rows.find((item) => {
          return conds.every(({ col, val }) => {
            const jsKey = dbToJsKey(col);
            return item[jsKey] === val;
          });
        });
        return matched || null;
      },
      findMany: async (options) => {
        const data = readDb();
        let rows = [...(data.generations || [])];
        if (options && options.where) {
          const conds = getSQLParamsAndCols(options.where);
          rows = rows.filter((item) => {
            return conds.every(({ col, val }) => {
              const jsKey = dbToJsKey(col);
              return item[jsKey] === val;
            });
          });
        }
        rows.sort((a, b) => {
          const timeA = new Date(a.createdAt || 0).getTime();
          const timeB = new Date(b.createdAt || 0).getTime();
          return timeB - timeA;
        });
        return rows;
      }
    }
  }
};

if (process.env.SQL_HOST) {
  pool = new Pool({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB_NAME,
    connectionTimeoutMillis: 15000,
  });
  pool.on("error", (err) => {
    console.error("Unexpected error on idle SQL pool client:", err);
  });
  dbInstance = drizzle(pool, { schema });
  console.log("Database connection: Initialized PostgreSQL Pool");
} else {
  dbInstance = mockDb;
  console.log("Database connection: SQL_HOST not set, using local file-based database (local_db.json)");
}

export const db = dbInstance;
