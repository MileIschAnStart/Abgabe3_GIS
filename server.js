"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.A08Server = void 0;
var Mongo = __importStar(require("mongodb"));
var Url = __importStar(require("url"));
var Http = __importStar(require("http"));
var mongo;
//Datenbank-Connection
function DbConnect(url) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mongo = new Mongo.MongoClient(url);
                    return [4 /*yield*/, mongo.connect()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
//zu Db verbinden
DbConnect("mongodb+srv://mile:010408@mike.et3um.mongodb.net/projekt?retryWrites=true&w=majority");
//in http-Server gehen
var A08Server;
(function (A08Server) {
    console.log("Starting server..");
    //port aus Umgebungsvariabeln auslesen
    var port = Number(process.env.PORT);
    if (!port) //wenn kein Port in den Umgebungsvariabeln gefunden wird, Port: 8100 nehmen
        port = 8100;
    var server = Http.createServer(); //http-Server wird erstellt
    server.addListener("request", onRequest); //wenn Anfrage reinkommt, Funktion ausführen
    server.addListener("listening", onListen); //wenn Server gestartet wird
    server.listen(port);
    function onListen() {
        console.log("Listening..");
    }
    function doRegister(request) {
        return __awaiter(this, void 0, void 0, function () {
            var vorname, nachname, password, email, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        vorname = request.get("vorname");
                        nachname = request.get("nachname");
                        password = request.get("password");
                        email = request.get("email");
                        if (!vorname || !nachname || !password || !email) { //wenn eines der Felder nicht gefüllt ist, dann wird der String zurückgegeben
                            return [2 /*return*/, "Nicht alle Pflichtfelder sind gefüllt."];
                        }
                        return [4 /*yield*/, mongo.db("projekt").collection("users").find({ email: email }).toArray()];
                    case 1:
                        result = _a.sent();
                        if (result.length > 0) { // Wenn größer null: Es existiert bereits ein User
                            return [2 /*return*/, "Es gibt bereits einen Nutzer mit der Emailadresse " + email];
                        }
                        return [4 /*yield*/, mongo.db("projekt").collection("users").insertOne({ vorname: vorname, nachname: nachname, password: password, email: email })];
                    case 2:
                        _a.sent(); //falls User noch nicht existiert, dann lege einen an
                        return [2 /*return*/, "User erfolgreich registriert!"];
                }
            });
        });
    }
    function doLogin(request) {
        return __awaiter(this, void 0, void 0, function () {
            var email, password, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        email = request.get("email");
                        password = request.get("password");
                        if (!email || !password) { //Falls eines der beiden nicht gesetzt ist, dann Fehlermeldung 
                            return [2 /*return*/, "Nicht alle Felder wurden ausgefüllt."];
                        }
                        return [4 /*yield*/, mongo.db("projekt").collection("users").find({ email: email, password: password }).toArray()];
                    case 1:
                        result = _a.sent();
                        if (result.length > 0) { //Wird ein Nutzer gefunden, dann erfolgreich
                            return [2 /*return*/, "Erfolgreich angemeldet!"];
                        }
                        return [2 /*return*/, "Diese Benutzername/Passwort-Kombination konnte nicht gefunden werden"]; //Falls Funktion vorher nicht beendet wurde, Fehlermeldung für die falsche KombinationF
                }
            });
        });
    }
    function userlist() {
        return __awaiter(this, void 0, void 0, function () {
            var result, names;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, mongo.db("projekt").collection("users").find({}).toArray()];
                    case 1:
                        result = _a.sent();
                        names = result.map(function (user) {
                            return user.vorname + " " + user.nachname;
                        });
                        return [2 /*return*/, names.join("<br/>")];
                }
            });
        });
    }
    function calculateResponseText(url) {
        return __awaiter(this, void 0, void 0, function () {
            var antwortText, urlNew;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        antwortText = "Die URL konnte nicht gefunden werden.";
                        if (!url) {
                            console.log("URL ist leer");
                            return [2 /*return*/, antwortText];
                        }
                        urlNew = new Url.URL(url, "http://localhost:8100");
                        if (!(urlNew.pathname === "/liste")) return [3 /*break*/, 2];
                        return [4 /*yield*/, userlist()];
                    case 1:
                        antwortText = _a.sent();
                        return [3 /*break*/, 6];
                    case 2:
                        if (!(urlNew.pathname === "/registrierung")) return [3 /*break*/, 4];
                        return [4 /*yield*/, doRegister(urlNew.searchParams)];
                    case 3:
                        antwortText = _a.sent();
                        return [3 /*break*/, 6];
                    case 4:
                        if (!(urlNew.pathname === "/login")) return [3 /*break*/, 6];
                        return [4 /*yield*/, doLogin(urlNew.searchParams)];
                    case 5:
                        antwortText = _a.sent();
                        _a.label = 6;
                    case 6: return [2 /*return*/, antwortText];
                }
            });
        });
    }
    function onRequest(_request, _response) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, calculateResponseText(_request.url)];
                    case 1:
                        response = _a.sent();
                        _response.setHeader("content-type", "text/html; charset=utf-8");
                        _response.setHeader("Access-Control-Allow-Origin", "*");
                        _response.write(response); //Antwort herausgeben
                        _response.end();
                        return [2 /*return*/];
                }
            });
        });
    }
})(A08Server = exports.A08Server || (exports.A08Server = {}));
