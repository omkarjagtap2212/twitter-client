"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tweet = void 0;
const mutation_1 = require("./mutation");
const resolvers_1 = require("./resolvers");
const types_1 = require("./types");
const queries_1 = require("./queries");
exports.Tweet = { mutations: mutation_1.mutations, resolvers: resolvers_1.resolvers, types: types_1.types, queries: queries_1.queries };
