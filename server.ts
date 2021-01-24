import * as Mongo from "mongodb";
import * as Url from "url";
import * as Http from "http";


let mongo: Mongo.MongoClient;

//Datenbank-Connection
async function DbConnect (url: string): Promise<void> {
    mongo = new Mongo.MongoClient(url);
    await mongo.connect();
}

//zu Db verbinden
DbConnect("mongodb+srv://mile:010408@mike.et3um.mongodb.net/projekt?retryWrites=true&w=majority");

//in http-Server gehen
export namespace A08Server {
    console.log("Starting server..");

    //port aus Umgebungsvariabeln auslesen
    let port: number = Number(process.env.PORT);
    if (!port)                                  //wenn kein Port in den Umgebungsvariabeln gefunden wird, Port: 8100 nehmen
        port = 8100;


    let server: Http.Server = Http.createServer();  //http-Server wird erstellt
    server.addListener("request", onRequest);       //wenn Anfrage reinkommt, Funktion ausführen
    server.addListener("listening", onListen);      //wenn Server gestartet wird
    server.listen(port);



    function onListen(): void {
        console.log("Listening..");
    }

    async function doRegister(request: URLSearchParams): Promise<string> {      //params auslesen
        let vorname: string | null = request.get("vorname");                                   //auf Key zugreifen und Value zurückgegeben
        let nachname: string | null = request.get("nachname");
        let password: string | null = request.get("password");
        let email: string | null = request.get("email");

        if (!vorname || !nachname || !password || !email) {                     //wenn eines der Felder nicht gefüllt ist, dann wird der String zurückgegeben
            return "Nicht alle Pflichtfelder sind gefüllt.";
        }

        let result: string[] = await mongo.db("projekt").collection("users").find({email: email}).toArray();      //Datenbankabfrage 
        if (result.length > 0) {                                                                        // Wenn größer null: Es existiert bereits ein User
            return "Es gibt bereits einen Nutzer mit der Emailadresse " + email;
        }


        await mongo.db("projekt").collection("users").insertOne({vorname: vorname, nachname: nachname, password: password, email: email});  //falls User noch nicht existiert, dann lege einen an
        return "User erfolgreich registriert!";
    }

    async function doLogin(request: URLSearchParams): Promise<string> {             //E-Mail und Passwort werden ausgelesen
        let email: string | null = request.get("email");
        let password: string | null = request.get("password");
        if (!email || !password) {                                                  //Falls eines der beiden nicht gesetzt ist, dann Fehlermeldung 
            return "Nicht alle Felder wurden ausgefüllt.";
        }
        let result: string[] = await mongo.db("projekt").collection("users").find({email: email, password: password}).toArray();
        if (result.length > 0) {                                                    //Wird ein Nutzer gefunden, dann erfolgreich
            return "Erfolgreich angemeldet!";
        }
        return "Diese Benutzername/Passwort-Kombination konnte nicht gefunden werden";  //Falls Funktion vorher nicht beendet wurde, Fehlermeldung für die falsche KombinationF
    }

    async function userlist(): Promise<string> {
        let result = await mongo.db("projekt").collection("users").find({}).toArray();  // Alle User in "result" speichern
        let names: string[] = result.map((user) => {
            return user.vorname + " " + user.nachname;
        });
        return names.join("<br/>");
    }

    async function calculateResponseText(url: string | undefined): Promise<string> {    // URL auslesesen
        let antwortText: string = "Die URL konnte nicht gefunden werden.";
        if (!url) {
            console.log("URL ist leer");
            return antwortText;
        }
        

        let urlNew: Url.URL  = new Url.URL(url, "http://localhost:8100");
        

        if (urlNew.pathname === "/liste") {                             //wenn if-Bedingung greift, Antwort beschreiben und zurückgeben
            antwortText = await userlist();                                 
        }
        else if (urlNew.pathname === "/registrierung") {
            antwortText = await doRegister(urlNew.searchParams);
        }
        else if (urlNew.pathname === "/login") {
            antwortText = await doLogin(urlNew.searchParams);
        }


        return antwortText;
    }

    async function onRequest(_request: Http.IncomingMessage, _response: Http.ServerResponse): Promise<void> {
        

        let response: string = await calculateResponseText(_request.url);                   //Antwort empfangen

        _response.setHeader("content-type", "text/html; charset=utf-8");
        _response.setHeader("Access-Control-Allow-Origin", "*");

        _response.write(response);                                                  //Antwort herausgeben

        _response.end();
    }
}
