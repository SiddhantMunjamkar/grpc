import path from "path";
import * as grpc from "@grpc/grpc-js";
import { GrpcObject, ServiceClientConstructor } from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { ProtoGrpcType } from "./generated/a";
import {
  AddressBookServiceHandlers,
} from "./generated/AddressBookService";
import { Status } from "@grpc/grpc-js/build/src/constants";

const packageDefinition = protoLoader.loadSync(
  path.join(__dirname, "../a.proto")
);

const personProto = grpc.loadPackageDefinition(
  packageDefinition
) as unknown as ProtoGrpcType;

const PERSON: any[] = [];

// @ts-ignore
function addPerson(call, callback) {
  console.log(call);

  let person = {
    name: call.request.name,
    age: call.request.age,
  };
  PERSON.push(person);

  callback(null, person);
}

// @ts-ignore
function getPersonByName(call, callback) {
  const name = call.request.name;
  const person = PERSON.find((x) => x.name === name);

  callback(null, person);
}

const handlers: AddressBookServiceHandlers = {
  AddPerson: (call, callback) => {
    let person = {
      name: call.request.name,
      age: call.request.age,
    };
    PERSON.push(person);
    callback(null, person);
  },

  GetPersonByName: (call, callback) => {
    const name = call.request.name;
    const person = PERSON.find((x) => x.name === name);
    callback(
      {
        code: Status.NOT_FOUND,
        details: "Not found",
      },
      null);
  },
};

const server = new grpc.Server();

server.addService(personProto.AddressBookService.service, handlers);
server.bindAsync(
  "0.0.0.0:50051",
  grpc.ServerCredentials.createInsecure(),
  () => {
    server.start();
  }
);
