import appSettings from "electron-settings";
import { DatabaseStatus } from "$shared/enums";
import { DatabaseResponse, SetStationIdentityParams } from "$shared/types";
import { getDatabaseConnection } from "./connect-db";
import { clearStationsTable, createStationsTable } from "./tables-db";
import { Station, StationDB } from "../../shared/models";
import * as dialogs from "../lib/file-dialogs";

export async function LoadStations() {
  //const devStationData = require("$resources/config/stations.json");
  const stationFilePath = await dialogs.selectStationsFile();
  const stationData = require(stationFilePath[0]); // natively imports JSON data to object

  if (!stationData) return "Invalid JSON file.";

  for (const index in stationData) {
    if (GetStations().length > 0) {
      clearStationsTable();
      createStationsTable();
    }

    if (index == "event") {
      await appSettings.set("event.name", stationData.event.name);
      await appSettings.set("event.starttime", stationData.event.starttime);
      await appSettings.set("event.endtime", stationData.event.endtime);
    }

    if (index == "stations") {
      const [stations] = GetStations();
      if (stations == null) createStationsTable();

      if (GetStations().length > 0) {
        clearStationsTable();
        createStationsTable();
      }

      for (const key in stationData.stations) {
        if (key == "0")
          await appSettings.set("event.startline", stationData[index][key].identifier);
        if (key == (stationData.stations.length - 1).toString())
          await appSettings.set("event.finishline", stationData[index][key].identifier);

        insertStation(stationData[index][key]);
      }
    }
  }
  const stationIdentifier = appSettings.getSync("station.identifier") as string;
  setStation(stationIdentifier);

  return `${stationFilePath}\r\n${stationData.stations.length} stations imported`;
}

export async function setStation(stationIdentifier: string) {
  const selectedStation: Station | null = GetStationByIdentifier(stationIdentifier)?.[0];
  if (!selectedStation) return;

  await appSettings.set("station.name", selectedStation.name);
  await appSettings.set("station.id", Number(selectedStation.identifier.split("-", 1)[0]));
  await appSettings.set("station.identifier", selectedStation.identifier);
  await appSettings.set("station.entrymode", selectedStation.entrymode);
  await appSettings.set(`station.shiftBegin`, selectedStation.shiftBegin as unknown as string);
  await appSettings.set(`station.cutofftime`, selectedStation.cutofftime as unknown as string);
  await appSettings.set(`station.shiftEnd`, selectedStation.shiftEnd as unknown as string);

  for (const key in selectedStation.operators) {
    await appSettings.set(
      `station.operators.${key}.fullname`,
      selectedStation.operators[key].fullname
    );
    await appSettings.set(
      `station.operators.${key}.callsign`,
      selectedStation.operators[key].callsign
    );
    await appSettings.set(`station.operators.${key}.phone`, selectedStation.operators[key].phone);
    await appSettings.set(`station.operators.${key}.active`, false);
  }

  await appSettings.set("station.operators.primary.active", true);
}

export async function SetStationIdentity(params: SetStationIdentityParams) {
  await setStation(params.identifier);
  const settings = appSettings.getSync("station") as unknown as Station;

  const key = Object.keys(settings.operators).find(
    (operator) => settings.operators[operator].callsign == params.callsign
  );

  for (const operator in settings.operators) {
    await appSettings.set(`station.operators.${operator}.active`, false);
  }

  appSettings.setSync(`station.operators.${key}.active`, true);

  return settings;
}

export function GetStations(): DatabaseResponse<StationDB[]> {
  const db = getDatabaseConnection();
  let message: string = "";
  let queryResult: StationDB[] | null = null;

  try {
    const query = db.prepare(`SELECT * FROM Stations`);
    queryResult = query.all() as StationDB[] | null;
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message);
      return [null, DatabaseStatus.Error, e.message];
    }
  }

  if (queryResult == null) return [null, DatabaseStatus.NotFound, message];

  message = `table Read Stations - records:${queryResult?.length}`;

  console.log(message);
  return [queryResult, DatabaseStatus.Success, message];
}

export function GetStationByIdentifier(identifier: string): DatabaseResponse<Station> {
  const db = getDatabaseConnection();
  let queryResult;
  let message: string = "";

  try {
    queryResult = db.prepare(`SELECT * FROM Stations WHERE identifier = ?`).get(identifier);
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message);
      return [null, DatabaseStatus.Error, e.message];
    }
  }

  if (queryResult == null) return [null, DatabaseStatus.NotFound, message];

  queryResult = queryResult as StationDB;

  const loc = JSON.parse(queryResult.location);
  const ops = JSON.parse(queryResult.operators);

  // map result to station object
  const station: Station = {
    name: queryResult.name,
    identifier: queryResult.identifier,
    description: queryResult.description,
    location: { latitude: loc.latitude, longitude: loc.latitude, elevation: loc.elevation },
    distance: queryResult.distance,
    dropbags: queryResult.dropbags,
    crewaccess: queryResult.crewaccess,
    paceraccess: queryResult.paceraccess,
    shiftBegin: new Date(queryResult.shiftBegin),
    cutofftime: new Date(queryResult.cutofftime),
    shiftEnd: new Date(queryResult.shiftEnd),
    entrymode: queryResult.entrymode,
    operators: ops
  };

  message = `stations:Found station with identifier: ${station.identifier}`;
  console.log(message);
  return [station, DatabaseStatus.Success, message];
}

export function insertStation(station: Station): DatabaseResponse {
  const db = getDatabaseConnection();

  const name: string = station.name;
  const identifier: string = station.identifier;
  const description: string = station.description;
  const location: string = JSON.stringify(station.location);
  const distance: number = station.distance;
  const dropbags: number = Number(station.dropbags);
  const crewaccess: number = Number(station.crewaccess);
  const paceraccess: number = Number(station.paceraccess);
  const shiftBegin: string = new Date(station.shiftBegin).toISOString();
  const cutofftime: string = new Date(station.cutofftime).toISOString();
  const shiftEnd: string = new Date(station.shiftEnd).toISOString();
  const entrymode: number = Number(station.entrymode);
  const operators: string = JSON.stringify(station.operators);

  try {
    const query = db.prepare(
      `INSERT INTO Stations (name, identifier, description, location, dropbags, crewaccess, paceraccess, distance, shiftBegin, cutofftime, shiftEnd, entrymode, operators) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    query.run(
      name,
      identifier,
      description,
      location,
      dropbags,
      crewaccess,
      paceraccess,
      distance,
      shiftBegin,
      cutofftime,
      shiftEnd,
      entrymode,
      operators
    );
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message);
      return [DatabaseStatus.Error, e.message];
    }
  }

  const message = `station:add ${identifier}, ${location}, ${distance}`;
  return [DatabaseStatus.Created, message];
}
