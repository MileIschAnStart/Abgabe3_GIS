import * as Mongo from "mongodb";
import * as Url from "url";
import * as Http from "http";


let mongo: Mongo.MongoClient;

async function DbConnect(url: string){
    mongo = new Mongo.MongoClient(url);
    await mongo.connect();
}

DbConnect("mongodb+srv://mile:010408@mike.et3um.mongodb.net/projekt?retryWrites=true&w=majority");

export namespace A08Server {
    console.log("Starting server..");


    let port: number = Number(process.env.PORT);
    if (!port)
        port = 8100;


    let server: Http.Server = Http.createServer();
    server.addListener("request", onRequest);
    server.addListener("listening", onListen);
    server.listen(port);



    function onListen(): void {
        console.log("Listening..");
    }

    async function doRegister(request: URLSearchParams) : Promise<string>{
        let vorname = request.get('vorname');
        let nachname = request.get('nachname');
        let password = request.get('password');
        let email = request.get('email');

        if(!vorname || !nachname || !password || !email){
            return "Nicht alle Pflichtfelder sind gefüllt.";
        }

        let result = await mongo.db("projekt").collection("users").find({email: email}).toArray();
        if(result.length > 0){
            return "Es gibt bereits einen Nutzer mit der Emailadresse "+email;
        }


        await mongo.db("projekt").collection("users").insertOne({vorname: vorname, nachname: nachname, password: password, email: email});

        return "User erfolgreich registriert!";
    }

    async function doLogin(request: URLSearchParams): Promise<string> {
        let email = request.get('email');
        let password = request.get('password');
        if(!email || !password){
            return "Nicht alle Felder wurden ausgefüllt.";
        }
        let result = await mongo.db("projekt").collection("users").find({email: email, password: password}).toArray();
        if(result.length > 0){
            return "Erfolgreich angemeldet!";
        }
        return "Diese Benutzername/Passwort-Kombination konnte nicht gefunden werden";
    }

    async function userlist() : Promise<string> {
        let result = await mongo.db("projekt").collection("users").find({}).toArray();
        let names: string[] = result.map((user) => {
            return user.vorname+" "+user.nachname
        });
        return names.join('<br/>');
    }

    async function calculateResponseText(url: string | undefined) : Promise<string>{
        let antwortText = 'Die angefragte URL konnte nicht gefunden werden (404).';
        if(!url){
            console.log("URL ist leer");
            return antwortText;
        }
        //console.log(url);

        let urlNew = new Url.URL(url, "http://localhost:8100");
        //console.log(urlNew);

        if(urlNew.pathname === "/liste"){
            antwortText = await userlist();
        }
        else if(urlNew.pathname === "/registrierung"){
            antwortText = await doRegister(urlNew.searchParams);
        }
        else if(urlNew.pathname === "/login"){
            antwortText = await doLogin(urlNew.searchParams);
        }


        return antwortText;
    }

    async function onRequest(_request: Http.IncomingMessage, _response: Http.ServerResponse): Promise<void> {
        //console.log("I hear voices!", _request.url);

        let response = await calculateResponseText(_request.url);

        _response.setHeader("content-type", "text/html; charset=utf-8");
        _response.setHeader("Access-Control-Allow-Origin", "*");

        _response.write(response);

        _response.end();
    }
}
