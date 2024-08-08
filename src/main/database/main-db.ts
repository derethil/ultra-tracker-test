import fs from "fs";
import Database, { Statement } from "better-sqlite3";
import global from "../../shared/global";
import { Runner } from "../../shared/models";

export abstract class dblocal {
  public static ConnectToDB() {
    let db: Database.Database;
    const dbPath = global.shared.dbPath;
    const dbFullPath = global.shared.dbFullPath;
    const tableCount: number = 5;

    if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath);

    try {
      db = global.shared.dbConnection = new Database(dbFullPath);
      db.pragma("journal_mode = WAL");
      console.log("Connected to SQLite Database:" + dbFullPath);

      const query = db.prepare(`SELECT count(*) FROM sqlite_master WHERE type='table'`);
      const result = query.get() as Record<string, number>;

      if (result["count(*)"] < tableCount) CreateTables();
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log(`Unable to connect or create database: ${e.message}`);
        return;
      }
    }
  }
}

export function LookupStartListRunnerByBib(bibNumber: number): Runner | undefined {
  const db: Database.Database = global.shared.dbConnection;

  let result: Runner | undefined;

  try {
    const query = db.prepare(`SELECT * FROM StartList WHERE Bib = ?`);
    const startListRunner = query.get(bibNumber);

    // neither of these checks seem to work that well
    if (startListRunner.Bib === undefined || typeof startListRunner.Bib !== "number")
      return undefined;

    const runner: Runner = {
      index: startListRunner.index,
      bib: startListRunner.Bib,
      firstname: startListRunner.FirstName,
      lastname: startListRunner.LastName,
      gender: startListRunner.gender,
      age: startListRunner.Age,
      city: startListRunner.City,
      state: startListRunner.State,
      emPhone: startListRunner.EmergencyPhone,
      emName: startListRunner.EmergencyName,
      dns: false,
      dnf: false,
      dnfStation: 0,
      dnfDateTime: undefined
    };

    result = runner;
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.log(e.message);
      result = undefined;
    }
  }

  return result;
}

export function CreateTables(): boolean {
  const db: Database.Database = global.shared.dbConnection;
  let CmdResult: Statement;

  //Create each of the tables

  //Create Runners table
  try {
    CmdResult = db.prepare(`CREATE TABLE IF NOT EXISTS Runners (
        "index" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        bib_id INTEGER DEFAULT (0),
        station_id INTEGER,
        time_in DATETIME,
        time_out DATETIME,
        last_changed TEXT,
        sent BOOLEAN DEFAULT (FALSE)
        )`);
    CmdResult.run();
  } catch (e) {
    if (e instanceof Error) {
      console.log(`Failed to create'Runners'table ${e.message}`);
      return false;
    }
  }

  //Create Events table
  try {
    CmdResult = db.prepare(`CREATE TABLE IF NOT EXISTS Events (
        "index" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        bib_id INTEGER DEFAULT (0),
        station_id INTEGER,
        time_in DATETIME,
        time_out DATETIME,
        last_changed TEXT,
        note TEXT,
        sent BOOLEAN DEFAULT (FALSE)
        )`);

    CmdResult.run();
  } catch (e) {
    if (e instanceof Error) {
      console.log(`Failed to create'Runners'table ${e.message}`);
      return false;
    }
  }

  //Create StartList table
  try {
    CmdResult = db.prepare(`CREATE TABLE IF NOT EXISTS StartList (
        "index" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        Bib INTEGER DEFAULT (0),
        FirstName TEXT,
        LastName TEXT,
        gender TEXT,
        Age INTEGER DEFAULT (0),
        City TEXT,
        State TEXT,
        EmergencyPhone INTEGER,
        EmergencyName TEXT
        )`);

    CmdResult.run();
  } catch (e) {
    if (e instanceof Error) {
      console.log(`Failed to create'Runners'table ${e.message}`);
      return false;
    }
  }

  //Create Stations table
  try {
    CmdResult = db.prepare(`CREATE TABLE IF NOT EXISTS Stations (
        "index" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        StaName TEXT,
        Last_changed DATETIME
        )`);

    CmdResult.run();
  } catch (e) {
    if (e instanceof Error) {
      console.log(`Failed to create'Runners'table ${e.message}`);
      return false;
    }
  }

  //Create Output table
  try {
    CmdResult = db.prepare(`CREATE TABLE IF NOT EXISTS Output (
        "index" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        Bib INTEGER DEFAULT (0),
        Sta1_in DATETIME,
        Sta1_out DATETIME,
        Sta2_in DATETIME,
        Sta2_out DATETIME,
        Sta3_in DATETIME,
        Sta3_out DATETIME,
        Sta4_in DATETIME,
        Sta4_out DATETIME,
        Sta5_in DATETIME,
        Sta5_out DATETIME,
        Sta6_in DATETIME,
        Sta6_out DATETIME,
        Sta7_in DATETIME,
        Sta7_out DATETIME,
        Sta8_in DATETIME,
        Sta8_out DATETIME,
        Sta9_in DATETIME,
        Sta9_out DATETIME,
        Sta10_in DATETIME,
        Sta10_out DATETIME,
        Sta11_in DATETIME,
        Sta11_out DATETIME,
        Sta12_in DATETIME,
        Sta12_out DATETIME,
        Sta13_in DATETIME,
        Sta13_out DATETIME,
        Sta14_in DATETIME,
        Sta14_out DATETIME,
        Sta15_in DATETIME,
        Sta15_out DATETIME,
        Sta16_in DATETIME,
        Sta16_out DATETIME,
        Sta17_in DATETIME,
        Sta17_out DATETIME,
        Sta18_in DATETIME,
        Sta18_out DATETIME,
        Sta19_in DATETIME,
        Sta19_out DATETIME,
        Sta20_in DATETIME,
        Sta20_out DATETIME,
        Dnf BOOLEAN,
        Dns BOOLEAN,
        Last_changed DATETIME
        )`);

    CmdResult.run();
  } catch (e) {
    if (e instanceof Error) {
      console.log(`Failed to create'Runners'table ${e.message}`);
      return false;
    }
  }

  console.log(`Default tables were successfully created.`);
  return true;
}

function clearTable(tableName: string): boolean {
  const db: Database.Database = global.shared.dbConnection;
  try {
    const query = db.prepare(`DELETE * FROM ?`);
    query.run(tableName);
    return true;
  } catch (e: unknown) {
    if (e instanceof Error) console.log(`Failed to delete'${tableName}'table: ${e.message}`);
    return false;
  }
}

export const clearStartListTable = () => clearTable("StartList");
export const clearEventsTable = () => clearTable("Events");
export const clearRunnersTable = () => clearTable("Runners");
export const clearStationsTable = () => clearTable("Stations");
export const clearOutputTable = () => clearTable("Output");
