import * as Mongo from "mongodb";
import * as Url from "url";
import * as Http from "http";


let mongo: Mongo.MongoClient;

//Datenbank-Connection
async function DbConnect(url: string) {
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
        let vorname = request.get('vorname');                                   //auf Key zugreifen und Value zurückgegeben
        let nachname = request.get('nachname');
        let password = request.get('password');
        let email = request.get('email');

        if (!vorname || !nachname || !password || !email) {                     //wenn eines der Felder nicht gefüllt ist, dann wird der String zurückgegeben
            return "Nicht alle Pflichtfelder sind gefüllt.";
        }

        let result = await mongo.db("projekt").collection("users").find({email: email}).toArray();      //Datenbankabfrage 
        if (result.length > 0) {                                                                        // Wenn größer null: Es existiert bereits ein User
            return "Es gibt bereits einen Nutzer mit der Emailadresse " + email;
        }


        await mongo.db("projekt").collection("users").insertOne({vorname: vorname, nachname: nachname, password: password, email: email});  //falls User noch nicht existiert, dann lege einen an
        return "User erfolgreich registriert!";
    }

    async function doLogin(request: URLSearchParams): Promise<string> {             //E-Mail und Passwort werden ausgelesen
        let email = request.get('email');
        let password = request.get('password');
        if (!email || !password) {                                                  //Falls eines der beiden nicht gesetzt ist, dann Fehlermeldung 
            return "Nicht alle Felder wurden ausgefüllt.";
        }
        let result = await mongo.db("projekt").collection("users").find({email: email, password: password}).toArray();
        if (result.length > 0) {                                                    //Wird ein Nutzer gefunden, dann erfolgreich
            return "Erfolgreich angemeldet!";
        }
        return "Diese Benutzername/Passwort-Kombination konnte nicht gefunden werden";  //Falls Funktion vorher nicht beendet wurde, Fehlermeldung für die falsche KombinationF
    }

    async function userlist(): Promise<string> {
        let result = await mongo.db("projekt").collection("users").find({}).toArray();  // Alle User in "result" speichern
        let names: string[] = result.map((user) => {
            return user.vorname + " " + user.nachname
        });
        return names.join('<br/>');
    }

    async function calculateResponseText(url: string | undefined): Promise<string> {
        let antwortText = 'Die URL konnte nicht gefunden werden.';
        if (!url) {
            console.log("URL ist leer");
            return antwortText;
        }
        

        let urlNew = new Url.URL(url, "http://localhost:8100");
        

        if (urlNew.pathname === "/liste") {
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
        

        let response = await calculateResponseText(_request.url);

        _response.setHeader("content-type", "text/html; charset=utf-8");
        _response.setHeader("Access-Control-Allow-Origin", "*");

        _response.write(response);

        _response.end();
    }
}
