>Zurück zur **[Dokumentation Masterportal](doc.md)**.

[TOC]


# Masterportal - Sensor Layer #
Im Folgenden wird das auf der SensorThingsAPI basierende Sensor-Layer des Masterportals beschrieben.


## Begriffsklärungen ##


### OGC SensorThings API ###
Die Open Geospatial Consortium (OGC) SensorThingsAPI stellt ein Framework für geographische Daten im Open-Standard zur Verfügung.
Die SensorThingsAPI ermöglicht die Vernetzung von Geräten, Daten und Applikationen im IoT (Internet of Things).

> "[The SensorThingsAPI] provides an open standard-based and geospatial-enabled framework to interconnect the Internet of Things devices, data, and applications over the Web." ([Quelle](https://docs.opengeospatial.org/is/15-078r6/15-078r6.html#6))

Das Framework beinhaltet ein Datenmodel das die Verbindung zwischen dem sog. "Broker" (der Server) und einem Netz aus sog. Publishern (Sensoren) und sog. Clients (z.B. das Masterportal im Browser) abbildet.

Unter folgenden Links gibt es mehr hilfreiche Informationen über die SensorThingsAPI:

 - [https://docs.opengeospatial.org/is/15-078r6/15-078r6.html#1](https://docs.opengeospatial.org/is/15-078r6/15-078r6.html#1)
 - [http://developers.sensorup.com/docs/](http://developers.sensorup.com/docs/)
 - [https://gost1.docs.apiary.io/#reference/0/things](https://gost1.docs.apiary.io/#reference/0/things)

Hier ein Direktlink zum Datenmodel:

 - [http://docs.opengeospatial.org/is/15-078r6/15-078r6.html#24](http://docs.opengeospatial.org/is/15-078r6/15-078r6.html#24)


### FROST Server ###
Der FROST Server wird vom Fraunhofer-Institut entwickelt. Der FROST Server ist die serverseitige Implementierung der SensorThingsAPI.

> "[It is] a Server implementation of the OGC SensorThings API." ([Quelle](https://github.com/FraunhoferIOSB/FROST-Server))

Der FROST Server ist der Broker zwischen dem Publisher (Sensor) und dem Client (Masterportal bzw. Browser).
Der FROST Server kann klassisch per http auf seiner REST Schnittstelle aufgerufen werden und bidirektional per mqtt oder CoAP.


### Die REST API - http ###
Die zum Abonnieren benötigten IDs der Things erhält man am besten mithilfe eines initialen http-Aufrufes an die REST Schnittstelle.

*Wichtig: Nur auf http-Basis lassen sich die expand- und filter-Funktionen der REST-Schnittstelle nutzen.
Ein Abonnement lässt sich nur über das mqtt Protokoll und nur mit einem reinen Pfad (keine Querys) abschließen. Queries (also alles in der URL nach dem "?") wird ignoriert.*

Hier einige Beispiele für den Abruf von Daten über die REST Schnittstelle:

 - Übersicht: [https://iot.hamburg.de/](https://iot.hamburg.de/)
 - alle Things der SensorThingsAPI: [https://iot.hamburg.de/v1.0/Things](https://iot.hamburg.de/v1.0/Things)
 - ein Thing der SensorThingsAPI: [https://iot.hamburg.de/v1.0/Things(26)](https://iot.hamburg.de/v1.0/Things(26))
 - ein Datastream: [https://iot.hamburg.de/v1.0/Datastreams(74)](https://iot.hamburg.de/v1.0/Datastreams(74))
 - alle Datastreams eines Things: [https://iot.hamburg.de/v1.0/Things(26)/Datastreams](https://iot.hamburg.de/v1.0/Things(26)/Datastreams)
 - alle Observations eines Datastreams: [https://iot.hamburg.de/v1.0/Datastreams(74)/Observations](https://iot.hamburg.de/v1.0/Datastreams(74)/Observations)

Der FROST Server hat mit seiner REST Schnittstelle expand- und filter-Funktionen implementiert, die an eine SQL-Syntax erinnern und sich ähnlich benutzen lassen.
Um z.B. zwei Tabellen miteinander zu verknüpfen, wird der $expand-Parameter verwendet. Um weitere Tabellen zu joinen können diese kommasepariert aufgelistet werden.

 - ein Thing mit seiner Location: [https://iot.hamburg.de/v1.0/Things(26)?$expand=Locations](https://iot.hamburg.de/v1.0/Things(26)?$expand=Locations)
 - ein Thing mit seiner Location und Observation (bitte beachten Sie, dass Observations in Relation zum Datastream steht - nicht in direkter Relation zum Thing): [https://iot.hamburg.de/v1.0/Things(26)?$expand=Locations,Datastreams/Observations](https://iot.hamburg.de/v1.0/Things(26)?$expand=Locations,Datastreams/Observations)

Um nach Things zu filtern - ohne eine eindeutige ID zu verwenden - kann der $filter Parameter verwendet werden.

 - finde ein Thing anhand seines Names mit $filter=name eq '...': [https://iot.hamburg.de/v1.0/Things?$filter=name%20eq%20%27StadtRad-Station%20Grandweg%20/%20Veilchenweg%27](https://iot.hamburg.de/v1.0/Things?$filter=name%20eq%20%27StadtRad-Station%20Grandweg%20/%20Veilchenweg%27)

Mit $orderby lassen sich Things sortieren. Um z.B. an die neuest Observation zu kommen, muss die Observations-Liste absteigend nach Datum sortiert und mit $top=1 der erste Datensatz dem Ergebnis entnommen werden.

 - sortiere Observations nach Datum und nimm den ersten Datensatz mit $orderby=phenomenonTime desc&$top=1: [https://iot.hamburg.de/v1.0/Datastreams(74)/Observations?$orderby=phenomenonTime%20desc&$top=1](https://iot.hamburg.de/v1.0/Datastreams(74)/Observations?$orderby=phenomenonTime%20desc&$top=1)

Sie können auch verschachtelte Statements verwenden:

 - [http://iot.hamburg.de/v1.0/Things(614)?$expand=Datastreams($expand=Observations),Locations](http://iot.hamburg.de/v1.0/Things(614)?$expand=Datastreams($expand=Observations),Locations)

Um Things innerhalb eines Karten-Bereiches (z.B. dem aktuellen Browser-Ausschnitt) abzurufen, kann der relevante Bereich als POLYGON übergeben werden.

 - [https://iot.hamburg.de/v1.0/Things?$filter=startswith(Things/name,%27StadtRad-Station%27)%20and%20st_within(Locations/location,geography%27POLYGON%20((10.0270%2053.5695,10.0370%2053.5695,10.0370%2053.5795,10.0270%2053.5795,10.0270%2053.5695))%27)&$expand=Locations](https://iot.hamburg.de/v1.0/Things?$filter=startswith(Things/name,%27StadtRad-Station%27)%20and%20st_within(Locations/location,geography%27POLYGON%20((10.0270%2053.5695,10.0370%2053.5695,10.0370%2053.5795,10.0270%2053.5795,10.0270%2053.5695))%27)&$expand=Locations)

Im Detail:

 - https://iot.hamburg.de/v1.0/Things?
 - $filter=
   - startswith(Things/name,'StadtRad-Station')
   - and st_within(
     - Locations/location,geograph'POLYGON ((
       - 10.0270 53.5695,
       - 10.0370 53.5695,
       - 10.0370 53.5795,
       - 10.0270 53.5795,
       - 10.0270 53.5695
     - ))'
   - )
 - &$expand=Locations

Die Antwort vom Server enthält nur die Things, deren Location innerhalb des gewünschten POLYGON liegt.
Ruft man initial nur den relevanten Bereich vom Server ab, kann sich dies positiv auf die Geschwindigkeit auswirken - zumal man im zweiten Schritt dann auch nur die Things abonnieren könnte, die im aktuellen Browser-Fenster liegen.



### Die REST API - mqtt ###
Das mqtt Protokoll wurde für das Intenet of Things (IoT) entwickelt. Es hält eine bidirektionale Verbindung zum Server offen und kommuniziert über pull- und push-Nachrichten.
Die meisten Browser-Implementierungen nutzen unter dem mqtt Protokoll socket.io, da Browser direktes mqtt normalerweise nicht können. Das mqtt-Paket von npm ist ein gutes Beispiel für eine solche Implementierung.

Mithilfe des mqtt Protokolls abonniert der Client (Browser) ein Topic (Thema).
Ein Topic verweist mithilfe eines REST Pfads auf eine Entität (die Tabellen aus dem Daten-Model), über deren Änderung informiert werden soll (z.B. "v1.0/Datastreams(74)/Observations").
*Hinweis: Der host wird beim Connect mit mqtt übergeben und wird aus dem Topic immer weggelassen.*

Ist eine solches Topic über mqtt abonniert worden, pushed der Broker alle Änderungen an der dahinter liegenden Tabelle an den Client.
Alle Entitäten (Tabellen des Daten-Models) können abonniert und deabonniert werden.
Da mqtt nur auf das Abonnieren und Deabonnieren ausgelegt ist, müssen alle anderen Aktionen (z.B. Initiales Abfragen relevanter IDs) über http abgewickelt werden.

Wie bereits erwähnt, sind Topics reine REST Pfade ohne Query. Beispiel:

 - dies kann man abonnieren: mqtt://iot.hamburg.de/v1.0/Datastreams(74)/Observations
 - dies kann man nicht abonnieren: mqtt://iot.hamburg.de/v1.0/Datastreams(74)?$expand=Observations

Die aktuelle mqtt Version im Masterportal ist: 3.1.1

 - Informationen zu mqtt 3.1.1: [https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/mqtt-v3.1.1.html](https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/mqtt-v3.1.1.html)
 - Informationen zu mqtt 5.0.0: [https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html)



### mqtt - Retained Messages ###

Laut mqtt Protokoll muss ein Publisher (Sensor) dem Broker (Server) mitteilen, wenn er selten Aktualisierungen vornimmt.
Der Publisher motiviert den Broker dazu seine jeweils letzte Nachricht im Arbeitsspeicher zu halten, um sie neu abonnierenden Clients direkt zur Verfügung zu stellen, da er selbst erst in später Zukunft wieder von sich hören lassen wird.
Hat ein Publisher hingegen eine hohe Nachrichten-Frequenz (z.B. jede Sekunde), teilt er dem Broker mit, dass sich ein Bereithalten seiner Nachrichten nicht lohnt, da er eh sofort die nächste schickt.

Als *Retained Messages* werden solche Nachrichten bezeichnet, die der Broker zwar ganz normal im Permaspeicher speichert, die jedoch zusätzlich im Arbeitsspeicher für künftige Abonnements bereit hält.
Würde es keine *Retained Messages* geben, würden immer nur gerade empfangene Nachrichten vom Broker an die abonnierten Clients gesendet.

 - Mehr Informationen zu *Retained Messages* wie der Publisher sie vom Broker verlangt: [https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901104](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901104)
 - Mehr Informationen zu *Retained Messages* wie der Client sie vom Broker verlangt: [https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc384800440](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc384800440)



### FROST Server und Retained Messages ###
Der FROST Server unterstützt aktuell keine *Retained Messages*.
Wenn Sie beim Abonnement eines Topics die letzte Nachricht empfangen möchten, die der Broker für dieses Topic erhalten hat, müssen Sie diese Nachricht über einen anderen Weg abrufen.
Dies ist immer der Fall - unabhängig davon was der Publisher dem Broker zur Behandlung seiner Nachrichten als *Retained Messages* mitteilt.

Um das Problem fehlender *Retained Messages* zu lösen, haben wir für das Masterportal eine Software-Schicht implemntiert die *Retained Messages* simulieren kann. Diese Software-Schicht heißt **[sensorThingsMqtt](#sensorthingsmqtt)**.



## sensorThingsMqtt ##
Der FROST Server unterstützt aktuell keine *Retained Messages*.
Das Masterportal bietet Ihnen eine eigene mqtt Software Schicht an die *Retained Messages* simulieren kann.
So können Sie verhindern, dass Sie Ihre eigene Software Architektur wegen fehlender *Retained Messages* im mqtt Protokoll umbauen müssen.
Die *sensorThingsMqtt*-Schicht lässt sich wie das npm-Paket mqtt bedienen.


### Wie man mqtt implementiert ###
Hier ein einfaches Beispiel zur Implementierung des npm-Paketes mqtt mit Javascript:

```
#!javascript

import mqtt from "mqtt";

const client = mqtt.connect({
    host: "iot.example.com",
    protocol: "mqtt",
    path: "/"
});

client.on("connect", function () {
    client.subscribe("v1.0/Datastreams(74)/Observations", {
        qos: 0,
        retain: 0
    });
});

client.on("message", function (topic, payload) {
    if (topic === "v1.0/Datastreams(74)/Observations") {
        // note that payload is an Uint8Array and needs to be converted to JSON first
        const jsonPayload = JSON.parse(payload);

        // do something with jsonPayload
    }
});
```

Da der FROST Server keine *Retained Messages* unterstützt, wird das *on message*-Event nach dem Abonnement nicht sofort mit der letzten empfangenen Nachricht vom Broker aufgerufen (getriggert).
Wenn der hinter dem Topic stehende Publisher (Sensor) langsam ist (z.B. eine Ladesäule), würde das *on message*-Event vielleicht erst in einigen Stunden das erste Mal feuern.


### Simulation von Retained Messages ###
Die Lösung im Masterportal ist die Simulation von *Retained Messages* mit der *SensorThingsMqtt*-Schicht.
Nach außen hin sieht es so aus, als sei alles normal. Hier eine Beispiel-Implementierung der *SensorThingsMqtt*-Schicht. Beachten Sie die starke Ähnlichkeit zum Beispiel der Implementierung des npm-Paketes mqtt mit Javascript (s.o.):

```
#!javascript

import {SensorThingsMqtt} from "@modules/core/modelList/layer/sensorThingsMqtt";

const client = mqtt.connect({
    host: "iot.example.com",
    protocol: "mqtt",
    path: "/",
    context: this
});

client.on("connect", function () {
    client.subscribe("v1.0/Datastreams(74)/Observations", {
        qos: 0,
        retain: 0,
        rm_simulate: true
    });
});

client.on("message", function (topic, jsonPayload) {
    if (topic === "v1.0/Datastreams(74)/Observations") {
        // note that we already converted the payload to JSON - so no JSON.parse necessary at this point
        // do something with jsonPayload
    }
});
```

Die Änderungen im Detail:

 - context: hier übergeben Sie den für die Events zu verwendenden Scope (dann brauchen Sie kein .bind(this) zu benutzen)
 - rm_simulate: wenn dieses Flag auf true steht, werden *Retained Messages* simuliert. Steht das Flag auf false, gibt es keinen Unterschied zwischen SensorThingsMqtt und dem npm-Paket mqtt.
 - jsonPayload: die *sensorThingsMqtt*-Schicht wandelt alle Antworten vom Broker nach JSON um - daher kein eigenes Umwandeln mehr nötig.
 - bitte beachten Sie, dass wenn Sie *retain* auf 2 stellen, keine Simulation von Retained Messages stattfindet (selbst wenn rm_simulate auf true steht). Nehmen Sie hierzu die mqtt Spezifikation zur Kenntnis: "If the Retain Handling option is not 2, all matching retained messages are sent to the Client." ([Quelle](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc384800440))


### Konfiguration ###
Die *SensorThingsMqtt*-Schicht kann wie das npm-Paket mqtt verwendet werden. Es gibt jedoch Erweiterungen der Funktionen mqtt.connect und client.subscribe.

#### Optionen: SensorThingsMqtt.connect ####
|Name|Verpflichtend|Typ|default|Beschreibung|Beispiel|
|----|-------------|---|-------|------------|--------|
|host|Ja|String|-|der Host mit dem sich über mqtt verbunden wird|iot.hamburg.de|
|protocol|Nein|String|mqtt|das zu verwendende Protokoll|mqtt, mqtts, ws, wss, wx, wxs|
|path|Nein|String|emtpy|der vom Standard abweichende Pfad zur mqtt-Applikation auf dem Server. Dies kann der Fall sein, wenn ein anderes Protokoll als mqtt verwendet wird.|host: "iot.hamburg.de", protocol: "wss", path: "/mqtt" -> results in wss://iot.hamburg.de/mqtt|
|context|Nein|JavaScript Scope|Der Scope in dem die Events ausgeführt werden.|Wenn hier *this* eingetragen wird, kann *this* in den Events ohne extra binding verwendet werden.|

Beispiel:

```
#!javascript

import {SensorThingsMqtt} from "@modules/core/modelList/layer/sensorThingsMqtt";

const client = mqtt.connect({
    host: "iot.hamburg.de",
    protocol: "wss",
    path: "/mqtt",
    context: this
});
```

#### Optionen: SensorThingsMqttClient.subscribe ####
|Name|Verpflichtend|Typ|default|Beschreibung|Beispiel|
|----|-------------|---|-------|------------|--------|
|qos|Nein|Number|0|"The maximum Quality of Service level at which the Server can send Application Messages to the Client." [link](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901169)|0, 1 or 2|
|retain|Nein|Number|0|"flag of how to use Retained Messages for this subscription" [link](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc385349265)|0: get latest message on subscription, 1: get latest message only if first to subscribe on topic, 2: do not send messages on subscription|
|rm_simulate|Nein|Boolean|false|Flag zum Aktivieren der Simulation von *Retained Messages*|true oder false|
|rm_path|Nein|String|empty|der Pfad-Anteil in dem sich http- und mqtt-Abrufe unterscheiden|wenn http REST http://test.com/subpath/Datastreams , aber mqtt liegt unter mqtt://test.com/Datastreams , dann muss rm_path auf "subpath/" gestellt werden|
|rm_protocol|Nein|String|"https"|das für die Simulation von *Retained Messages* zu verwendende Protokoll|http, https, ...|
|rm_httpClient|Nein|Function|SensorThingsClientHttp|Eine Alternativ-Funktion mit der http Aufrufe stattfinden sollen. Per Default wird intern Axios verwendet.|Wenn Sie eine andere Art des Aufrufs von URLs wünschen, stellen Sie rm_httpClient ein als eine Funktion function(url, onsuccess) mit onsuccess als function(resp)|

Beispiel:

```
#!javascript

import {SensorThingsMqtt} from "@modules/core/modelList/layer/sensorThingsMqtt";

const client = mqtt.connect({
    host: "test.geoportal-hamburg.de",
    protocol: "wss",
    path: "/mqtt",
    context: this
});

client.on("connect", function () {
    client.subscribe("v1.0/Datastreams(74)/Observations", {
        qos: 0,
        retain: 0,
        rm_simulate: true,
        rm_path: "itsLGVhackathon/",
        rm_protocol: "https",
        rm_httpClient: function (url, onsuccess) {
            $.ajax({
                dataType: "json",
                url: url,
                async: true,
                type: "GET",
                success: onsuccess
            });
        }
    });
});
```



### Skalierbarkeit und Performanz ###
Der FROST Server unterstützt aktuell keine *Retained Messages*.
Unsere Lösung ist die Arbeit mit simulierten *Retained Messages* per http für jedes Abonnement. Diese Lösung skaliert nicht und hat eine geringe Performanz.
Wir hatten fünf Möglichkeiten zur Auswahl. Um Transparenz zu schaffen werden diese fünf Möglichkeiten hier dargestellt.
Bitte beachten Sie, dass die performanteste skalierende Methode die Verwendung "echter" *Retained Messages* auf Broker-Seite wäre.

 1. der FROST Server unterstützt Retained Messages
    - skaliert, hohe Performanz
    - aktuell nicht verfügbar
 2. ein initialer Abruf aller Nachrichten für alle Topics die abonniert werden sollen
    - skaliert nicht
    - Performanz hängt vom Server und dem Netzwerk des Clients ab
    - clientseitig schwer zu sauber zu implementieren
 3. Einzelabrufe von Topics bei jedem Abonnement: (Simulation von *Retained Messages*)
    - skaliert nicht
    - die Performanz hängt vom Netzwerk des Clients ab
 4. Schätzen der maximalen Anzahl gleichzeitig abrufbaren Datastream-Observations, ohne dass die Performanz dieses Einen Aufrufes leidet - und dann asynchroner Abruf in entsprechend großen Häppchen.
    - Die geschätzte maximale Anzahl ist abhängig vom Endanwender (Computer, Browser, Netzwerk) und von der Größen der Datenbank-Tabellen die sortiert werden müssen. Das variiert und macht die Schätzung unmöglich.
    - Wahrscheinlich wäre ein Zufalls-Wert für die Größe der Häppchen performanter als die Festlegung auf einen Wert.
    - Wir stoßen hier an die Grenzen dessen, was als Programmierer vertretbar ist.
 5. Wir legen ein Maximum an gleichzeitig abonnierbaren Features fest (z.B. 200 Features). Wird der Wert überstiegen, wird der Aufruf der Datastream-Observations entsprechend beschnitten und ein Hinweis an den Kunden ausgegeben, dass wir nicht mehr Features unterstützen können.
    - braucht nicht zu skalieren
    - hohe Performanz
    - aus UI-Sicht nicht vertretbar
    - widerspricht der Philosophie des Masterportals

Am 30. Januar 2020 haben wir uns für die 3. Möglichkeit entschieden:

  - diese ist am einfachsten zu implementieren
  - diese ist einfach austauschbar, wenn der FROST Server in Zukunft einmal *Retained Messages* anbietet


