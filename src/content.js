'use strict';
/* ============================================================
   CONTENT — everything the game teaches comes from gz-biologia.pdf
   ============================================================ */
const TOPICS = { aussen:'Äußerer Körperbau', skelett:'Das Skelett', organe:'Die Organe', schnabel:'Die Schnäbel', merkmale:'Die Merkmale', op:'Aufgaben-Wörter' };
const TOPICS_ES = { aussen:'Cuerpo por fuera', skelett:'El esqueleto', organe:'Los órganos', schnabel:'Los picos', merkmale:'Las características', op:'Palabras de los ejercicios' };

const WORDS = [];
function slug(s){ return s.toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }
// N = noun: article, word, plural ('*' = only plural, null = no plural), Spanish, topic, German definition, example, Spanish tip, extra accepted answers
function N(art,de,pl,es,t,def,ex,tip,alt){ WORDS.push({ id:slug(de), art, de, pl: pl==='*'?null:pl, po: pl==='*', es, t, def, ex, tip, alt }); }
// V = verb / adjective / expression (no article)
function V(de,es,t,def,ex,tip){ WORDS.push({ id:slug(de), art:null, de, pl:null, es, t, def, ex, tip }); }

/* ---- Seite 2: der äußere Körperbau ---- */
N('der','Vogel','Vögel','el pájaro / el ave','aussen','Ein Wirbeltier mit Federn, Flügeln und Schnabel.','Alle Vögel haben einen gemeinsamen Körperbau.');
N('die','Vogelart','Vogelarten','la especie de ave','aussen','Eine Gruppe von gleichen Vögeln, z. B. die Amsel.','Es gibt viele verschiedene Vogelarten.');
N('der','Greifvogel','Greifvögel','el ave rapaz','aussen','Ein großer Vogel, der Tiere mit seinen Krallen greift.','Der Adler und der Falke sind Greifvögel.','greifen = agarrar → el pájaro que agarra a sus presas.');
N('der','Singvogel','Singvögel','el pájaro cantor','aussen','Ein kleiner Vogel, der singt.','Die Amsel und der Haussperling sind Singvögel.','singen = cantar');
N('der','Wasservogel','Wasservögel','el ave acuática','aussen','Ein Vogel, der am oder im Wasser lebt.','Der Pelikan ist ein Wasservogel.');
N('der','Adler','Adler','el águila','aussen',null,'Der Adler ist ein großer Greifvogel.','¡Ojo! der Adler es masculino, pero en español decimos LA águila.');
N('der','Falke','Falken','el halcón','aussen',null,'Der Falke ist ein Greifvogel.');
N('die','Amsel','Amseln','el mirlo','aussen',null,'Die Amsel ist ein Singvogel.','¡Ojo! die Amsel es femenino, pero EL mirlo.');
N('der','Haussperling','Haussperlinge','el gorrión común','aussen',null,'Der Haussperling ist ein kleiner Singvogel.','Haus (casa) + Sperling (gorrión)');
N('der','Pelikan','Pelikane','el pelícano','aussen',null,'Der Pelikan ist ein Wasservogel.');
N('der','Körperbau',null,'la estructura del cuerpo','aussen','Wie der Körper aufgebaut ist.','Alle Vögel haben einen gemeinsamen Körperbau.','Körper (cuerpo) + Bau (construcción)');
N('der','Körper','Körper','el cuerpo','aussen',null,'Der Körper ist in Kopf, Rumpf und Schwanz gegliedert.');
N('der','Kopf','Köpfe','la cabeza','aussen',null,'Der Körper ist in Kopf, Rumpf und Schwanz gegliedert.','¡Ojo! der Kopf es masculino, pero LA cabeza.');
N('der','Rumpf','Rümpfe','el tronco (del cuerpo)','aussen','Der mittlere Teil des Körpers, ohne Kopf, Flügel und Beine.','Der Körper ist in Kopf, Rumpf und Schwanz gegliedert.');
N('der','Schwanz','Schwänze','la cola','aussen',null,'Der Körper ist in Kopf, Rumpf und Schwanz gegliedert.','¡Ojo! der Schwanz, pero LA cola.');
N('der','Schnabel','Schnäbel','el pico','aussen','Der harte Mund des Vogels. Vögel haben keine Zähne.','Alle Vögel besitzen einen Schnabel.');
N('die','Brust',null,'el pecho / la pechuga','aussen','Der vordere Teil des Rumpfes, unter dem Kopf.','Die Brust ist vorne am Rumpf.');
N('der','Bauch','Bäuche','el vientre / la barriga','aussen','Der untere Teil des Rumpfes.','Der Bauch ist unten am Rumpf.');
N('das','Bein','Beine','la pata / la pierna','aussen',null,'Die Haut an den Beinen ist mit Schuppen bedeckt.','das Bein es neutro — igual que das Brustbein.');
N('die','Kralle','Krallen','la garra','aussen','Der spitze, harte Nagel an den Zehen.','Die Hintergliedmaßen besitzen Krallen zum Laufen, Klettern, Greifen oder Schwimmen.',null,['die Krallen']);
N('der','Flügel','Flügel','el ala','aussen','Der Körperteil zum Fliegen.','Die Vordergliedmaßen sind zu Flügeln umgebildet.','Se escribe Flügel (con L al final), no «Flügen». El plural es igual: die Flügel. ¡Y es DER Flügel, pero EL ala!',['die Flügel']);
N('die','Gliedmaßen','*','las extremidades','aussen','Arme und Beine. Beim Vogel: Flügel und Beine.','Die Vordergliedmaßen sind zu Flügeln umgebildet.','Solo existe en plural: die Gliedmaßen.');
N('die','Vordergliedmaßen','*','las extremidades anteriores','aussen','Die vorderen Gliedmaßen. Beim Vogel sind das die Flügel.','Die Vordergliedmaßen sind zu Flügeln umgebildet.','vorne = delante → las extremidades de delante = las alas.');
N('die','Hintergliedmaßen','*','las extremidades posteriores','aussen','Die hinteren Gliedmaßen. Beim Vogel sind das die Beine.','Die Hintergliedmaßen besitzen Krallen.','hinten = detrás → las extremidades de atrás = las patas.');
N('die','Feder','Federn','la pluma','aussen',null,'Die Federn bedecken den ganzen Körper.');
V('fliegen','volar','aussen',null,'Die Flügel dienen dem Fliegen.');
V('laufen','andar / correr','aussen',null,'Mit den Krallen kann der Vogel laufen.');
V('klettern','trepar','aussen',null,'Mit den Krallen kann der Vogel klettern.');
V('greifen','agarrar','aussen',null,'Greifvögel greifen Tiere mit den Krallen.');
V('schwimmen','nadar','aussen',null,'Wasservögel können schwimmen.');
V('gegliedert','dividido (en partes)','aussen',null,'Der Körper ist in Kopf, Rumpf und Schwanz gegliedert.');
V('umgebildet','transformado','aussen',null,'Die Vordergliedmaßen sind zu Flügeln umgebildet.');

/* ---- Seite 3: das Skelett ---- */
N('das','Wirbeltier','Wirbeltiere','el vertebrado','skelett','Ein Tier mit einer Wirbelsäule.','Die Vögel sind Wirbeltiere, die fliegen können.','Wirbel (vértebra) + Tier (animal). das Tier → das Wirbeltier.');
N('das','Skelett','Skelette','el esqueleto','skelett','Alle Knochen eines Körpers zusammen.','Vögel haben ein Skelett aus sehr leichten Knochen.');
N('der','Knochen','Knochen','el hueso','skelett',null,'Das Skelett besteht aus sehr leichten Knochen.');
N('der','Schädel','Schädel','el cráneo','skelett','Die Knochen des Kopfes.','Wie alle Wirbeltiere besitzen Vögel einen Schädel.');
N('die','Wirbelsäule','Wirbelsäulen','la columna vertebral','skelett','Die Kette aus Wirbeln im Rücken.','Vögel besitzen eine Wirbelsäule mit den Rippen.','die Säule = la columna → die Wirbelsäule.');
N('der','Wirbel','Wirbel','la vértebra','skelett',null,'Die Wirbelsäule besteht aus vielen Wirbeln.');
N('die','Rippe','Rippen','la costilla','skelett',null,'Die Wirbelsäule hat Rippen.',null,['die Rippen']);
N('die','Schwanzwirbelsäule','Schwanzwirbelsäulen','las vértebras de la cola','skelett','Der hintere Teil der Wirbelsäule.','Die Schwanzwirbelsäule ist viel kürzer als bei den Reptilien.','Es DIE Schwanzwirbelsäule: en alemán la ÚLTIMA palabra decide el artículo → die Säule.');
N('das','Reptil','Reptilien','el reptil','skelett',null,'Die Schwanzwirbelsäule ist kürzer als bei den Reptilien.');
N('der','Oberarm','Oberarme','el brazo (hueso: el húmero)','skelett','Der obere Knochen im Flügel, nah am Körper.','Die Flügel bestehen aus dem Oberarm, dem Unterarm und der Hand.','ober = de arriba');
N('der','Unterarm','Unterarme','el antebrazo','skelett','Der Teil des Flügels zwischen Oberarm und Hand. Er hat zwei Knochen.','Am Unterarm können wir zwei Knochen unterscheiden.','unter = de abajo');
N('die','Hand','Hände','la mano','skelett',null,'Die Flügel bestehen aus dem Oberarm, dem Unterarm und der Hand.');
N('der','Handknochen','Handknochen','los huesos de la mano','skelett','Die Knochen an der Spitze des Flügels.','Die Handknochen bilden die Spitze des Flügels.',null,['die Handknochen']);
N('die','Elle','Ellen','el cúbito','skelett','Einer der zwei Knochen im Unterarm.','Am Unterarm unterscheiden wir die Elle und die Speiche.');
N('die','Speiche','Speichen','el radio (hueso)','skelett','Einer der zwei Knochen im Unterarm.','Am Unterarm unterscheiden wir die Elle und die Speiche.','die Speiche también es el «rayo» de una rueda de bici.');
N('das','Becken','Becken','la pelvis','skelett','Der Knochen, der die Beine mit der Wirbelsäule verbindet.','Die hinteren Gliedmaßen sind durch das Becken mit der Wirbelsäule verbunden.','das Becken también significa «la pileta / el lavabo».');
N('der','Oberschenkel','Oberschenkel','el muslo (hueso: el fémur)','skelett','Der obere Knochen im Bein.','Die hinteren Gliedmaßen bestehen aus dem Oberschenkel, dem Unterschenkel und den Zehen.');
N('der','Unterschenkel','Unterschenkel','la pierna (parte de abajo; hueso: la tibia)','skelett','Der untere Teil des Beins.','Die Beine bestehen aus Oberschenkel, Unterschenkel und Zehen.');
N('die','Zehe','Zehen','el dedo del pie','skelett',null,'An den Zehen befinden sich Krallen.',null,['die Zehen']);
N('das','Brustbein','Brustbeine','el esternón','skelett','Der große Knochen vorne an der Brust. Dort sitzen die Flugmuskeln.','Am Brustbein befinden sich die Muskeln, die die Flügel bewegen.','Brust (pecho) + Bein (antiguamente: hueso) → das Brustbein. ¡No «Bruntbein»!');
N('der','Muskel','Muskeln','el músculo','skelett',null,'Am Brustbein befinden sich die Muskeln, die die Flügel bewegen.');
N('der','Röhrenknochen','Röhrenknochen','el hueso hueco (en forma de tubo)','skelett','Ein hohler Knochen mit Luft innen. Er ist sehr leicht.','Vögel haben hohle Röhrenknochen.','die Röhre = el tubo');
V('leicht','ligero / liviano','skelett',null,'Das Skelett besteht aus sehr leichten Knochen.');
V('hohl','hueco','skelett',null,'Vögel haben hohle Röhrenknochen.');
V('kürzer','más corto','skelett',null,'Die Schwanzwirbelsäule ist viel kürzer als bei den Reptilien.');

/* ---- Seite 4: die Organe ---- */
N('das','Organ','Organe','el órgano','organe',null,'Bei den Organen gibt es Unterschiede zu anderen Wirbeltieren.');
N('die','Lunge','Lungen','el pulmón','organe','Das Organ zum Atmen.','Die Lunge eines Vogels hat mehrere Luftsäcke.','¡Ojo! die Lunge, pero EL pulmón.');
N('der','Luftsack','Luftsäcke','el saco aéreo','organe','Ein Sack voll Luft an der Lunge. So bekommt der Vogel mehr Sauerstoff.','Die Lunge eines Vogels besitzt mehrere Luftsäcke.','Singular: der Luftsack. Plural: die Luftsäcke. «Luft» va SIN diéresis (no «Lüftsäcke»).',['die Luftsäcke']);
N('der','Sauerstoff',null,'el oxígeno','organe','Ein Gas in der Luft. Tiere brauchen es zum Leben.','Mit den Luftsäcken kann ein Vogel besser den Sauerstoff aus der Luft aufnehmen.');
N('die','Luft',null,'el aire','organe',null,'Die Luftröhre transportiert die Luft zur Lunge.');
N('die','Luftröhre','Luftröhren','la tráquea','organe','Das Rohr, das die Luft von außen zur Lunge bringt.','Die Luftröhre transportiert die Luft von außen zur Lunge.','Luft (aire) + Röhre (tubo) = el tubo del aire.');
N('der','Zahn','Zähne','el diente','organe',null,'Vögel haben keine Zähne.',null,['die Zähne']);
N('die','Nahrung',null,'el alimento / la comida','organe','Das, was ein Tier frisst.','Vögel müssen ihre Nahrung in den Verdauungsorganen zerkleinern.');
N('die','Verdauungsorgane','*','los órganos digestivos','organe','Die Organe, in denen die Nahrung verarbeitet wird.','Vögel zerkleinern ihre Nahrung in den Verdauungsorganen.','verdauen = digerir');
N('der','Kropf','Kröpfe','el buche','organe','Eine Erweiterung am Hals. Hier kommt die Nahrung zuerst hin und wird weich.','Die Nahrung kommt zunächst in den Kropf.','¡Ojo! der Kropf = EL buche. Es la PRIMERA parada de la comida.');
N('der','Drüsenmagen','Drüsenmägen','el proventrículo (estómago glandular)','organe','Der erste Teil des Magens. Hier kommen Verdauungssäfte dazu.','Aus dem Kropf kommt die Nahrung in den Drüsenmagen.','die Drüse = la glándula. Segunda parada.');
N('der','Kaumagen','Kaumägen','la molleja','organe','Ein starker Muskelmagen. Er zerkleinert die Nahrung, weil Vögel keine Zähne haben.','Danach kommt die Nahrung in den Kaumagen.','kauen = masticar → el estómago que «mastica». Tercera parada.');
N('der','Magen','Mägen','el estómago','organe',null,'Vögel haben einen Drüsenmagen und einen Kaumagen.');
N('der','Darm','Därme','el intestino','organe','Ein langer Schlauch. Hier nimmt der Körper die Nährstoffe auf.','Schließlich kommt die Nahrung in den Darm.','Cuarta parada, antes de la cloaca.');
N('die','Kloake','Kloaken','la cloaca','organe','Die gemeinsame Körperöffnung für Kot, Urin und Eier (oder Spermazellen).','Vögel besitzen wie die Reptilien eine Kloake.');
N('die','Niere','Nieren','el riñón','organe','Das Organ, das den Urin macht.','Der Urin kommt aus der Niere.','¡Ojo! die Niere, pero EL riñón.');
N('der','Urin',null,'la orina','organe',null,'Der Urin aus der Niere verlässt durch die Kloake den Körper.');
N('der','Kot',null,'las heces / el excremento','organe',null,'Der Kot verlässt durch die Kloake den Körper.');
N('die','Spermazelle','Spermazellen','el espermatozoide','organe',null,'Die Spermazellen des Männchens verlassen durch die Kloake den Körper.');
N('das','Männchen','Männchen','el macho','organe',null,'Die Spermazellen des Männchens verlassen durch die Kloake den Körper.','Todas las palabras que terminan en -chen son «das».');
N('das','Weibchen','Weibchen','la hembra','organe',null,'Das Weibchen legt die Eier.','-chen → siempre das.');
V('zerkleinern','triturar / desmenuzar','organe','In kleine Stücke machen.','Vögel müssen ihre Nahrung in den Verdauungsorganen zerkleinern.','klein = pequeño');
V('transportieren','transportar','organe',null,'Die Luftröhre transportiert die Luft zur Lunge.');
V('aufnehmen','tomar / absorber','organe',null,'Der Vogel kann besser Sauerstoff aus der Luft aufnehmen.');

/* ---- Seiten 6–7, 9: die Schnäbel ---- */
N('das','Horn',null,'el cuerno / la queratina','schnabel','Ein hartes Material, wie bei Fingernägeln.','Der Schnabel trägt eine Hülle aus hartem Horn.');
N('die','Hülle','Hüllen','la envoltura / la funda','schnabel',null,'Der Schnabel trägt eine Hülle aus hartem Horn.');
N('das','Werkzeug','Werkzeuge','la herramienta','schnabel',null,'Schnäbel sind wie Werkzeuge.');
N('die','Pinzette','Pinzetten','la pinza','schnabel',null,'Manche Schnäbel gleichen langen Pinzetten.');
N('der','Meißel','Meißel','el cincel','schnabel','Ein Werkzeug, mit dem man Löcher in Holz oder Stein schlägt.','Manche Schnäbel gleichen kräftigen Meißeln.');
N('die','Zange','Zangen','la tenaza / el alicate','schnabel',null,'Manche Schnäbel gleichen starken Zangen.');
N('der','Tastsinn',null,'el sentido del tacto','schnabel','Der Sinn, mit dem man etwas fühlt.','Ihr feiner Tastsinn verrät ihr, wann sie zupacken muss.');
N('der','Schlamm',null,'el barro / el lodo','schnabel',null,'Die Uferschnepfe stochert im feuchten Schlamm nach Würmern.');
N('der','Wurm','Würmer','el gusano','schnabel',null,'Die Amsel frisst Würmer.',null,['die Würmer']);
N('die','Larve','Larven','la larva','schnabel',null,'Der Buntspecht frisst Larven im Holz.');
N('die','Beere','Beeren','la baya','schnabel',null,'Die Amsel frisst auch Beeren und Obst.');
N('das','Obst',null,'la fruta','schnabel',null,'Die Amsel frisst Beeren und Obst.');
N('das','Insekt','Insekten','el insecto','schnabel',null,'Der Gartenbaumläufer frisst Insekten und Spinnen.','Se escribe Insekt / Insekten (sin «ck»).');
N('die','Spinne','Spinnen','la araña','schnabel',null,'Der Gartenbaumläufer frisst Insekten und Spinnen an Bäumen.');
N('das','Säugetier','Säugetiere','el mamífero','schnabel','Ein Tier, das seine Jungen mit Milch säugt.','Der Mäusebussard frisst kleine Säugetiere.','saugen = mamar');
N('die','Maus','Mäuse','el ratón','schnabel',null,'Der Mäusebussard frisst vor allem Mäuse.','¡Ojo! die Maus, pero EL ratón.');
N('der','Samen','Samen','la semilla','schnabel',null,'Der Buntspecht frisst Samen von Nadelbäumen.');
N('der','Nadelbaum','Nadelbäume','la conífera (árbol de agujas)','schnabel',null,'Der Buntspecht frisst Samen von Nadelbäumen.','die Nadel = la aguja');
N('das','Holz','Hölzer','la madera','schnabel',null,'Der Buntspecht frisst Insekten, die im Holz leben.');
N('die','Pflanze','Pflanzen','la planta','schnabel',null,'Die Stockente frisst kleine Wassertiere und Pflanzen.');
N('das','Wassertier','Wassertiere','el animal acuático','schnabel',null,'Die Stockente frisst kleine Wassertiere.');
N('die','Hornlamelle','Hornlamellen','la lámina córnea','schnabel','Kleine Plättchen aus Horn am Schnabel der Ente. Damit siebt sie das Wasser.','Die Stockente hat einen Seihschnabel mit Hornlamellen.');
N('der','Pinzettenschnabel','Pinzettenschnäbel','el pico en forma de pinza','schnabel','Ein feiner, dünner Schnabel wie eine Pinzette.','Der Gartenbaumläufer hat einen Pinzettenschnabel.');
N('der','Hakenschnabel','Hakenschnäbel','el pico en forma de gancho','schnabel','Ein gebogener Schnabel mit scharfer Spitze.','Der Mäusebussard hat einen Hakenschnabel.','der Haken = el gancho');
N('der','Meißelschnabel','Meißelschnäbel','el pico en forma de cincel','schnabel','Ein kräftiger, gerader Schnabel zum Hacken im Holz.','Der Buntspecht hat einen Meißelschnabel.');
N('der','Seihschnabel','Seihschnäbel','el pico filtrador','schnabel','Ein flacher Schnabel mit Hornlamellen, der das Wasser siebt.','Die Stockente hat einen Seihschnabel.','seihen = colar / filtrar');
N('die','Uferschnepfe','Uferschnepfen','la aguja colinegra','schnabel',null,'Die Uferschnepfe zeigt, wie beweglich ein Schnabel ist.','das Ufer = la orilla');
N('der','Austernfischer','Austernfischer','el ostrero','schnabel',null,'Der Schnabel des Austernfischers wächst ständig nach.','die Auster = la ostra');
N('der','Gartenbaumläufer','Gartenbaumläufer','el agateador (europeo)','schnabel',null,'Der Gartenbaumläufer hat einen feinen Pinzettenschnabel.','Garten (jardín) + Baum (árbol) + Läufer (corredor)');
N('der','Mäusebussard','Mäusebussarde','el busardo ratonero','schnabel',null,'Der Mäusebussard hat einen gebogenen Hakenschnabel.','Mäuse (ratones) + Bussard (busardo)');
N('der','Buntspecht','Buntspechte','el pico picapinos (pájaro carpintero)','schnabel',null,'Der Buntspecht hat einen kräftigen Meißelschnabel.','bunt = de colores; der Specht = el pájaro carpintero. Se escribe Buntspecht (sin «ck»).');
N('der','Storch','Störche','la cigüeña','schnabel',null,'Der Storch hat einen langen, spitzen Schnabel.','¡Ojo! der Storch, pero LA cigüeña.');
N('die','Stockente','Stockenten','el ánade real (pato)','schnabel',null,'Die Stockente hat einen flachen Seihschnabel.','die Ente = el pato');
V('schlank','delgado / esbelto','schnabel',null,'Die Amsel hat einen schlanken, kräftigen Schnabel.');
V('kräftig','fuerte','schnabel',null,'Der Buntspecht hat einen kräftigen Meißelschnabel.');
V('fein','fino','schnabel',null,'Der Gartenbaumläufer hat einen feinen Schnabel.');
V('gebogen','curvado','schnabel',null,'Der Mäusebussard hat einen gebogenen Hakenschnabel.','biegen = doblar');
V('spitz','puntiagudo','schnabel',null,'Der Storch hat einen langen, spitzen Schnabel.');
V('scharf','afilado','schnabel',null,'Der Hakenschnabel hat eine scharfe Spitze.');
V('flach','plano','schnabel',null,'Die Stockente hat einen flachen Schnabel.');
V('beweglich','móvil / flexible','schnabel',null,'Der Schnabel ist viel beweglicher, als die meisten denken.');
V('empfindlich','sensible','schnabel',null,'Der Schnabel ist beweglich und empfindlich.');
V('stochern','hurgar','schnabel','Mit etwas Langem in etwas herumsuchen.','Die Uferschnepfe stochert im Schlamm nach Würmern.');
V('nachwachsen','volver a crecer','schnabel',null,'Die Hülle aus Horn wächst ständig nach.');
V('abnutzen','desgastar','schnabel',null,'Durch Gebrauch wird die Hornhülle abgenutzt.');
V('fressen','comer (animales)','schnabel',null,'Der Schnabel verrät, was ein Vogel frisst.','Animales: fressen. Personas: essen.');

/* ---- Seite 8: die Merkmale ---- */
N('das','Merkmal','Merkmale','la característica','merkmale','Etwas, woran man etwas erkennen kann.','Vögel haben gemeinsame Merkmale.');
N('das','Federkleid',null,'el plumaje','merkmale','Alle Federn zusammen. Sie bedecken den ganzen Körper.','Alle Vögel haben ein Federkleid.','das Kleid = el vestido → el «vestido de plumas».');
N('das','Ei','Eier','el huevo','merkmale',null,'Alle Vögel legen Eier.',null,['die Eier']);
N('die','Schuppe','Schuppen','la escama','merkmale',null,'Die Haut an den Beinen ist mit Schuppen bedeckt.');
N('die','Haut','Häute','la piel','merkmale',null,'Die Haut an den Beinen ist mit Schuppen bedeckt.');
N('die','Körpertemperatur','Körpertemperaturen','la temperatura corporal','merkmale',null,'Die Körpertemperatur der Vögel liegt zwischen 38 °C und 42 °C.');
N('die','Außentemperatur','Außentemperaturen','la temperatura exterior','merkmale',null,'Die Körpertemperatur bleibt gleich, auch wenn sich die Außentemperatur ändert.');
N('der','Strauß','Strauße','el avestruz','merkmale',null,'Der Strauß kann nicht fliegen.','der Strauß también es «el ramo de flores».');
N('der','Emu','Emus','el emú','merkmale',null,'Der Emu ist ein flugunfähiger Vogel.');
N('der','Pinguin','Pinguine','el pingüino','merkmale',null,'Der Pinguin kann nicht fliegen, aber gut schwimmen.');
N('der','Kiwi','Kiwis','el kiwi (ave)','merkmale',null,'Der Kiwi ist ein flugunfähiger Vogel.');
V('gleichwarm','de sangre caliente (temperatura constante)','merkmale','Die Körpertemperatur bleibt immer gleich.','Vögel sind, so wie Säugetiere, gleichwarme Wirbeltiere.');
V('wechselwarm','de sangre fría (temperatura variable)','merkmale','Die Körpertemperatur ändert sich mit der Außentemperatur.','Reptilien sind wechselwarm, Vögel nicht.');
V('flugunfähig','que no puede volar','merkmale','Kann nicht fliegen.','Der Strauß, der Emu, der Pinguin und der Kiwi sind flugunfähige Vögel.');
V('schwer','pesado','merkmale',null,'Flugunfähige Vögel sind zu schwer zum Fliegen.');
V('Eier legen','poner huevos','merkmale',null,'Alle Vögel legen Eier.');
V('speichern','almacenar','merkmale',null,'Dadurch kann ihr Körper viel mehr Luft speichern.');
V('bedecken','cubrir','merkmale',null,'Das Federkleid bedeckt den ganzen Körper.');

/* ---- Wörter aus den Aufgaben (Operatoren) ---- */
V('nennen','nombrar / mencionar (solo decir, sin explicar)','op',null,'Nenne die zehn Merkmale der Vögel.');
V('beschriften','rotular (escribir los nombres en un dibujo)','op',null,'Beschrifte die Abbildung.');
V('beschreiben','describir','op',null,'Beschreibe den Weg der Nahrung.');
V('erklären','explicar (por qué / cómo)','op',null,'Erkläre, was eine Kloake ist.');
V('markieren','marcar / subrayar','op',null,'Markiere die Fachbegriffe in grün.');
V('begründen','justificar (dar razones con «weil»)','op',null,'Begründe, warum der Strauß nicht fliegen kann.');
V('ergänzen','completar','op',null,'Ergänze den Satz.');
V('zuordnen','relacionar / asignar','op',null,'Ordne jedem Vogel die Schnabelform zu.');
N('der','Fachbegriff','Fachbegriffe','el término técnico','op',null,'Nenne den Fachbegriff mit Artikel.');
N('die','Abbildung','Abbildungen','la figura / la ilustración (Abb.)','op',null,'Beschrifte die Abbildung 2.');
N('die','Aufgabe','Aufgaben','la tarea / el ejercicio','op',null,'Lies die Aufgabe genau.');
N('der','Artikel','Artikel','el artículo (der, die, das)','op',null,'Nenne den Fachbegriff mit Artikel.');

const WMAP = {};
WORDS.forEach(w => { WMAP[w.id] = w; });
const PLMAP = {};
WORDS.forEach(w => { if (w.pl) PLMAP[w.pl] = w.id; });

/* ============================================================
   DIAGRAMS — simplified redrawings of Abb. 1, 2, 3
   ============================================================ */
function BONE(d){ return `<path d="${d}" stroke="#6b5a45" stroke-width="8" stroke-linecap="round" fill="none"/><path d="${d}" stroke="#f5eedc" stroke-width="4.5" stroke-linecap="round" fill="none"/>`; }
const DIAGRAMS = {
  aussen: {
    title: 'Abb. 1: Äußere Merkmale der Vögel',
    base: () => `
      <ellipse cx="210" cy="292" rx="130" ry="6" fill="#dccca6"/>
      <path d="M288 150 L386 126 L392 144 L384 160 L294 178 Z" fill="#5b6e82"/>
      <g stroke="#8a6d4b" stroke-linecap="round" fill="none"><path d="M185 208 L180 262 M210 208 L214 262" stroke-width="5"/><path d="M180 262 l-14 6 M180 262 l2 10 M180 262 l12 5 M214 262 l-12 6 M214 262 l3 10 M214 262 l13 4" stroke-width="3"/></g>
      <ellipse cx="205" cy="160" rx="92" ry="58" fill="#b9c3a8"/>
      <ellipse cx="150" cy="160" rx="44" ry="42" fill="#f0d27a"/>
      <ellipse cx="203" cy="199" rx="56" ry="19" fill="#f4e7bf"/>
      <path d="M172 128 Q250 108 314 150 Q262 192 190 180 Q162 160 172 128 Z" fill="#56788c"/>
      <path d="M198 140 Q250 134 292 152 M203 156 Q250 152 286 163 M210 169 Q246 168 272 173" stroke="#35505f" stroke-width="2" fill="none"/>
      <circle cx="122" cy="104" r="40" fill="#2b2d38"/>
      <ellipse cx="132" cy="117" rx="20" ry="14" fill="#f4f1ea"/>
      <circle cx="104" cy="95" r="5.5" fill="#fff"/><circle cx="103" cy="95" r="2.8" fill="#111"/>
      <path d="M85 97 L50 108 L86 117 Z" fill="#e0a13a"/>`,
    labels: [
      { n:1, id:'schnabel', x:58, y:108, mx:26, my:62 },
      { n:2, id:'kopf', x:122, y:76, mx:150, my:24 },
      { n:3, id:'brust', x:140, y:165, mx:38, my:176 },
      { n:4, id:'bauch', x:205, y:204, mx:108, my:250 },
      { n:5, id:'kralle', text:'die Krallen', accept:['das Bein','die Kralle','die Beine'], x:180, y:268, mx:122, my:288 },
      { n:6, id:'fluegel', x:250, y:150, mx:272, my:70 },
      { n:7, id:'schwanz', x:365, y:140, mx:398, my:96 },
    ],
  },
  skelett: {
    title: 'Abb. 2: Das Skelett der Vögel',
    base: () => `
      <path d="M180 150 Q200 80 250 45 Q290 20 332 16 Q300 60 262 100 Q232 140 206 160 Z" fill="#ebe1c9" stroke="#d3c39f" stroke-width="2"/>
      <path d="M92 92 Q110 60 142 78 Q160 100 170 140 Q220 118 300 150 L352 140 L350 160 L300 180 Q280 215 220 224 Q160 224 150 192 Q140 160 120 125 Q100 115 92 92 Z" fill="#ebe1c9" stroke="#d3c39f" stroke-width="2"/>
      ${BONE('M184 148 L206 96')}${BONE('M206 96 L252 52')}${BONE('M211 101 L257 58')}${BONE('M255 55 L302 28')}${BONE('M258 57 L288 50')}
      ${BONE('M142 112 Q160 138 178 150 L270 160')}
      <path d="M142 112 Q160 138 178 150 L270 160" stroke="#6b5a45" stroke-width="9" stroke-dasharray="1.5 6" fill="none"/>
      ${BONE('M270 160 L318 150')}
      <path d="M270 160 L318 150" stroke="#6b5a45" stroke-width="8" stroke-dasharray="1.5 5" fill="none"/>
      <path d="M316 144 L334 146 L318 158 Z" fill="#f5eedc" stroke="#6b5a45" stroke-width="2.5"/>
      ${[188,203,218,233,248].map(x=>BONE(`M${x} 153 Q${x-8} 176 ${x-2} 194`)).join('')}
      <path d="M158 192 Q205 202 252 196 Q236 206 226 214 Q200 240 178 214 Q168 204 158 192 Z" fill="#f5eedc" stroke="#6b5a45" stroke-width="3"/>
      <path d="M254 150 L294 157 L286 182 L258 176 Z" fill="#f5eedc" stroke="#6b5a45" stroke-width="3"/>
      ${BONE('M268 172 L248 212')}${BONE('M248 212 L266 254')}${BONE('M266 254 L254 280')}
      ${BONE('M254 280 L232 287')}${BONE('M254 280 L262 293')}${BONE('M254 280 L276 285')}
      <ellipse cx="122" cy="98" rx="25" ry="21" fill="#f5eedc" stroke="#6b5a45" stroke-width="3"/>
      <circle cx="114" cy="94" r="7" fill="#6b5a45"/>
      <path d="M99 90 L62 103 L100 110 Z" fill="#f5eedc" stroke="#6b5a45" stroke-width="3"/>`,
    labels: [
      { n:1, id:'handknochen', text:'die Handknochen', accept:['der Handknochen'], x:292, y:34, mx:345, my:20 },
      { n:2, id:'speiche', text:'die Speiche und die Elle', accept:['die Elle und die Speiche','die Speiche','die Elle'], x:230, y:76, mx:196, my:30 },
      { n:3, id:'oberarm', x:196, y:120, mx:150, my:62 },
      { n:4, id:'becken', x:274, y:166, mx:352, my:184 },
      { n:5, id:'rippe', text:'die Rippen', accept:['die Rippe'], x:203, y:178, mx:120, my:216 },
      { n:6, id:'brustbein', x:205, y:220, mx:168, my:268 },
      { n:7, id:'schnabel', x:74, y:103, mx:32, my:140 },
      { n:8, id:'schaedel', x:126, y:84, mx:92, my:34 },
      { n:9, id:'wirbelsaeule', x:228, y:155, mx:238, my:116 },
      { n:10, id:'schwanzwirbelsaeule', x:305, y:153, mx:370, my:126 },
      { n:11, id:'oberschenkel', x:258, y:192, mx:322, my:216 },
      { n:12, id:'unterschenkel', x:257, y:234, mx:320, my:252 },
      { n:13, id:'zehe', text:'die Zehen', accept:['die Zehe'], x:262, y:290, mx:320, my:288 },
    ],
  },
  organe: {
    title: 'Abb. 3: Die Organe der Vögel',
    base: () => `
      <path d="M200 234 L196 280 M232 234 L236 280" stroke="#d3c39f" stroke-width="6" stroke-linecap="round"/>
      <path d="M60 102 L92 94 Q100 70 124 70 Q150 72 152 100 Q156 130 180 138 Q240 118 300 140 L360 130 L362 150 L322 172 Q326 222 250 236 Q226 238 220 236 Q160 236 150 200 Q132 170 118 132 Q104 120 92 112 Z" fill="#ebe1c9" stroke="#d3c39f" stroke-width="2"/>
      <path d="M60 102 L92 94 L92 112 Z" fill="#e8c778" stroke="#c9a85a" stroke-width="1.5"/>
      <circle cx="118" cy="90" r="4" fill="#6b5a45"/>
      <g fill="#9fd0e6" fill-opacity=".8" stroke="#4e8fac" stroke-width="2"><circle cx="190" cy="142" r="11"/><circle cx="262" cy="150" r="13"/><circle cx="258" cy="186" r="10"/></g>
      <ellipse cx="226" cy="150" rx="22" ry="11" fill="#d45a6a" stroke="#8e2f3d" stroke-width="2"/>
      <path d="M96 106 Q128 128 150 144 Q180 152 208 150" stroke="#b5553c" stroke-width="6" fill="none" stroke-dasharray="3 2"/>
      <path d="M96 111 Q120 142 140 162" stroke="#a88355" stroke-width="5" fill="none"/>
      <path d="M160 178 Q176 190 186 196" stroke="#a88355" stroke-width="5" fill="none"/>
      <ellipse cx="148" cy="170" rx="16" ry="13" fill="#d9a35b" stroke="#8e6a35" stroke-width="2"/>
      <ellipse cx="195" cy="200" rx="13" ry="9" transform="rotate(25 195 200)" fill="#c9784b" stroke="#7d4128" stroke-width="2"/>
      <path d="M240 214 C258 234 250 198 268 210 C284 222 272 234 290 226 L299 212" stroke="#d98c6f" stroke-width="7" fill="none" stroke-linecap="round"/>
      <circle cx="224" cy="208" r="18" fill="#8e4a33" stroke="#5a2a1a" stroke-width="2"/>
      <ellipse cx="292" cy="172" rx="14" ry="8" fill="#7a3f58" stroke="#4a2034" stroke-width="2"/>
      <circle cx="304" cy="211" r="6" fill="#6a3b2a"/>`,
    labels: [
      { n:1, id:'luftroehre', x:128, y:128, mx:70, my:162 },
      { n:2, id:'kropf', x:148, y:170, mx:92, my:214 },
      { n:3, id:'luftsack', text:'die Luftsäcke', accept:['der Luftsack'], x:262, y:150, mx:284, my:96 },
      { n:4, id:'lunge', x:226, y:150, mx:226, my:98 },
      { n:5, id:'druesenmagen', x:195, y:200, mx:150, my:264 },
      { n:6, id:'kaumagen', x:224, y:208, mx:206, my:282 },
      { n:7, id:'darm', x:268, y:212, mx:266, my:282 },
      { n:8, id:'niere', x:292, y:172, mx:354, my:150 },
      { n:9, id:'kloake', x:304, y:211, mx:362, my:236 },
    ],
  },
};

/* ============================================================
   CLOZE TEXTS (Lückentexte) from the worksheets
   [[shown word]] or [[shown word|word-id]]
   ============================================================ */
const CLOZE = {
  p2: { title:'Der äußere Körperbau', src:'Seite 2', parts:[
    'Es gibt viele verschiedene [[Vogelarten]]: große [[Greifvögel]] wie der Adler oder der Falke, kleinere [[Singvögel]] wie die Amsel oder der Haussperling oder [[Wasservögel]] wie der Pelikan. Sie haben einen gemeinsamen [[Körperbau]].',
    'Der Körper ist in [[Kopf]], [[Rumpf]] und [[Schwanz]] gegliedert. Die [[Vordergliedmaßen]] sind zu [[Flügeln|fluegel]] umgebildet. Die [[Hintergliedmaßen]] besitzen [[Krallen]] zum Laufen, Klettern, Greifen oder Schwimmen. Alle Vögel besitzen einen [[Schnabel]].',
  ]},
  p3: { title:'Das Vogelskelett', src:'Seite 3', parts:[
    'Die Vögel sind [[Wirbeltiere]], die fliegen können. Dazu besitzen sie ein [[Skelett]], das aus sehr [[leichten|leicht]] [[Knochen]] besteht. Wie alle Wirbeltiere besitzen sie einen [[Schädel]] und eine [[Wirbelsäule]] mit den [[Rippen]]. Der hintere Teil der Wirbelsäule, die [[Schwanzwirbelsäule]], ist aber viel [[kürzer]] als bei den [[Reptilien]].',
    'Die Flügel sind die vorderen Gliedmaßen. Sie bestehen aus dem [[Oberarm]], dem [[Unterarm]] und der [[Hand]]. Am Unterarm unterscheiden wir zwei Knochen, die [[Elle]] und die [[Speiche]]. Die hinteren Gliedmaßen sind mit der Wirbelsäule durch das [[Becken]] verbunden. Sie bestehen aus dem [[Oberschenkel]], dem [[Unterschenkel]] und den [[Zehen]]. Am großen [[Brustbein]] befinden sich die [[Muskeln]], die die Flügel bewegen.',
  ]},
  p4: { title:'Die Organe des Vogels', src:'Seite 4', parts:[
    'Die [[Lunge]] eines Vogels besitzt mehrere [[Luftsäcke]]. Mit diesen Luftsäcken kann ein Vogel besser den [[Sauerstoff]] aus der Luft aufnehmen. Die [[Luftröhre]] transportiert die Luft von außen zur Lunge.',
    'Weil die Vögel keine [[Zähne]] haben, müssen sie ihre [[Nahrung]] in den Verdauungsorganen [[zerkleinern]]. Die Nahrung kommt zuerst in den [[Kropf]], dann in den [[Drüsenmagen]], danach in den [[Kaumagen]] und schließlich in den [[Darm]].',
    'Die Vögel besitzen wie die Reptilien eine [[Kloake]]. Der [[Urin]] aus der [[Niere]], der [[Kot]] und die [[Spermazellen]] des [[Männchens|maennchen]] verlassen durch die Kloake den Körper.',
  ]},
  p6: { title:'Der Schnabel verrät, was ein Vogel frisst', src:'Seite 6–7', parts:[
    'Der Schnabel besteht aus [[Knochen]]. Er trägt eine [[Hülle]] aus hartem [[Horn]], die ständig [[nachwächst|nachwachsen]]. Durch Gebrauch wird sie [[abgenutzt|abnutzen]]. Der Schnabel ist viel [[beweglicher|beweglich]] und [[empfindlicher|empfindlich]], als die meisten denken.',
    'Die [[Uferschnepfe]] [[stochert|stochern]] mit ihrem langen Schnabel im feuchten [[Schlamm]] nach [[Würmern|wurm]]. Ihr feiner [[Tastsinn]] verrät ihr, wann sie zupacken muss. Schnäbel sind wie [[Werkzeuge]]: Manche gleichen langen [[Pinzetten]], andere kräftigen [[Meißeln|meissel]], wieder andere starken [[Zangen]].',
  ]},
  p8: { title:'Die Merkmale der Vögel', src:'Seite 8', parts:[
    'Vögel gehören zu den [[Wirbeltieren|wirbeltier]]. Alle Vögel haben [[Flügel]] und ein [[Federkleid]], welches ihren ganzen Körper bedeckt. Außerdem haben sie einen [[Schnabel]], jedoch keine echten [[Zähne]]. Alle Vögel legen [[Eier]] und besitzen eine [[Kloake]], aus welcher Eier, Kot und Urin ausgeführt werden.',
    'Die Haut an den Beinen ist mit [[Schuppen]] bedeckt und an den Zehen befinden sich [[Krallen]]. Zusätzlich zur Lunge haben Vögel [[Luftsäcke]] und hohle [[Röhrenknochen]]. Die Körpertemperatur liegt zwischen 38 °C und 42 °C und bleibt immer gleich. Daher sind Vögel, so wie auch [[Säugetiere]], [[gleichwarme|gleichwarm]] Wirbeltiere.',
    'Fast alle Vögel können fliegen. Der [[Strauß]], der [[Emu]], der [[Pinguin]] und der [[Kiwi]] sind [[flugunfähige|flugunfaehig]] Vögel. Das liegt vor allem daran, dass sie zu [[schwer]] sind.',
  ]},
};

/* ============================================================
   RICHTIG / FALSCH
   ============================================================ */
const TF = [
  // aussen
  { t:'aussen', s:'Der Körper des Vogels ist in Kopf, Rumpf und Schwanz gegliedert.', a:true, es:'El cuerpo del ave se divide en cabeza, tronco y cola. ✔' },
  { t:'aussen', s:'Die Vordergliedmaßen sind zu Flügeln umgebildet.', a:true, es:'Las extremidades anteriores se transformaron en alas. ✔' },
  { t:'aussen', s:'Nur Greifvögel haben einen Schnabel.', a:false, why:'Alle Vögel haben einen Schnabel.', es:'Falso: TODAS las aves tienen pico.' },
  { t:'aussen', s:'Die Amsel ist ein Greifvogel.', a:false, why:'Die Amsel ist ein Singvogel.', es:'Falso: el mirlo es un pájaro cantor (Singvogel).' },
  { t:'aussen', s:'Der Pelikan ist ein Wasservogel.', a:true, es:'El pelícano es un ave acuática. ✔' },
  { t:'aussen', s:'Die Hintergliedmaßen besitzen Krallen.', a:true, es:'Las extremidades posteriores tienen garras. ✔' },
  { t:'aussen', s:'Die Flügel sind die Hintergliedmaßen.', a:false, why:'Die Flügel sind die Vordergliedmaßen.', es:'Falso: las alas son las extremidades ANTERIORES (de delante).' },
  // skelett
  { t:'skelett', s:'Vögel haben ein Skelett aus sehr leichten Knochen.', a:true, es:'Las aves tienen un esqueleto de huesos muy ligeros. ✔' },
  { t:'skelett', s:'Die Schwanzwirbelsäule der Vögel ist länger als bei den Reptilien.', a:false, why:'Sie ist viel kürzer als bei den Reptilien.', es:'Falso: es mucho MÁS CORTA que en los reptiles.' },
  { t:'skelett', s:'Am Unterarm gibt es zwei Knochen: die Elle und die Speiche.', a:true, es:'En el antebrazo hay dos huesos: cúbito y radio. ✔' },
  { t:'skelett', s:'Das Becken verbindet die Beine mit der Wirbelsäule.', a:true, es:'La pelvis une las patas con la columna. ✔' },
  { t:'skelett', s:'Am Brustbein befinden sich die Muskeln, die die Flügel bewegen.', a:true, es:'En el esternón están los músculos que mueven las alas. ✔' },
  { t:'skelett', s:'Der Oberschenkel ist ein Knochen im Flügel.', a:false, why:'Der Oberschenkel ist im Bein. Im Flügel ist der Oberarm.', es:'Falso: el muslo (Oberschenkel) está en la pata; en el ala está el Oberarm.' },
  { t:'skelett', s:'Vögel sind Wirbeltiere.', a:true, es:'Las aves son vertebrados. ✔' },
  // organe
  { t:'organe', s:'Die Nahrung kommt zuerst in den Kaumagen.', a:false, why:'Zuerst kommt sie in den Kropf.', es:'Falso: primero va al buche (Kropf).' },
  { t:'organe', s:'Die Luftröhre transportiert die Luft zur Lunge.', a:true, es:'La tráquea lleva el aire al pulmón. ✔' },
  { t:'organe', s:'Mit den Luftsäcken nimmt der Vogel besser Sauerstoff auf.', a:true, es:'Con los sacos aéreos el ave toma mejor el oxígeno. ✔' },
  { t:'organe', s:'Der Urin kommt aus der Niere.', a:true, es:'La orina viene del riñón. ✔' },
  { t:'organe', s:'Der Kaumagen zerkleinert die Nahrung.', a:true, es:'La molleja tritura el alimento. ✔' },
  { t:'organe', s:'Vögel zerkleinern die Nahrung mit ihren Zähnen.', a:false, why:'Vögel haben keine Zähne.', es:'Falso: las aves NO tienen dientes; trituran en la molleja.' },
  { t:'organe', s:'Vögel besitzen, wie die Reptilien, eine Kloake.', a:true, es:'Las aves, como los reptiles, tienen cloaca. ✔' },
  // schnabel
  { t:'schnabel', s:'Der Schnabel besteht aus Knochen mit einer Hülle aus Horn.', a:true, es:'El pico es hueso con una funda de queratina (Horn). ✔' },
  { t:'schnabel', s:'Die Hornhülle des Schnabels wächst ständig nach.', a:true, es:'La funda córnea del pico crece constantemente. ✔' },
  { t:'schnabel', s:'Der Buntspecht hat einen Hakenschnabel.', a:false, why:'Der Buntspecht hat einen Meißelschnabel.', es:'Falso: el pico picapinos tiene pico de cincel (Meißelschnabel).' },
  { t:'schnabel', s:'Die Stockente hat einen Seihschnabel mit Hornlamellen.', a:true, es:'El ánade real tiene pico filtrador con láminas córneas. ✔' },
  { t:'schnabel', s:'Der Mäusebussard frisst vor allem Mäuse.', a:true, es:'El busardo ratonero come sobre todo ratones. ✔' },
  { t:'schnabel', s:'Der Gartenbaumläufer hat einen Meißelschnabel.', a:false, why:'Er hat einen feinen Pinzettenschnabel.', es:'Falso: el agateador tiene pico fino de pinza.' },
  { t:'schnabel', s:'Die Form des Schnabels verrät, was ein Vogel frisst.', a:true, es:'La forma del pico revela lo que come el ave. ✔' },
  { t:'schnabel', s:'Der Schnabel ist hart und unbeweglich.', a:false, why:'Er ist viel beweglicher und empfindlicher, als man denkt.', es:'Falso: el pico es mucho más móvil y sensible de lo que se cree.' },
  // merkmale
  { t:'merkmale', s:'Vögel haben echte Zähne.', a:false, why:'Vögel haben keine echten Zähne.', es:'Falso: las aves no tienen dientes verdaderos.' },
  { t:'merkmale', s:'Alle Vögel legen Eier.', a:true, es:'Todas las aves ponen huevos. ✔' },
  { t:'merkmale', s:'Vögel sind wechselwarm.', a:false, why:'Vögel sind gleichwarm (38–42 °C).', es:'Falso: son de sangre caliente (gleichwarm), su temperatura no cambia.' },
  { t:'merkmale', s:'Die Körpertemperatur der Vögel liegt zwischen 38 °C und 42 °C.', a:true, es:'La temperatura corporal de las aves está entre 38 y 42 °C. ✔' },
  { t:'merkmale', s:'Der Pinguin kann fliegen.', a:false, why:'Der Pinguin ist flugunfähig.', es:'Falso: el pingüino no puede volar.' },
  { t:'merkmale', s:'Der Strauß ist ein flugunfähiger Vogel.', a:true, es:'El avestruz no puede volar. ✔' },
  { t:'merkmale', s:'Die Haut an den Beinen ist mit Schuppen bedeckt.', a:true, es:'La piel de las patas está cubierta de escamas. ✔' },
  { t:'merkmale', s:'Vögel haben hohle Röhrenknochen.', a:true, es:'Las aves tienen huesos huecos. ✔' },
  { t:'merkmale', s:'Aus der Kloake kommen Eier, Kot und Urin.', a:true, es:'Por la cloaca salen huevos, heces y orina. ✔' },
  { t:'merkmale', s:'Viele flugunfähige Vögel sind zu leicht zum Fliegen.', a:false, why:'Sie sind zu schwer.', es:'Falso: son demasiado PESADOS (zu schwer).' },
  { t:'merkmale', s:'Das Federkleid bedeckt nur die Flügel.', a:false, why:'Es bedeckt den ganzen Körper.', es:'Falso: el plumaje cubre TODO el cuerpo.' },
  { t:'merkmale', s:'Vögel und Säugetiere sind gleichwarm.', a:true, es:'Aves y mamíferos tienen temperatura constante. ✔' },
];

/* ============================================================
   SCHNÄBEL (Seite 7)
   ============================================================ */
const BEAKS = [
  { id:'amsel', art:'Die', name:'Amsel', key:'schlank', beakName:'schlanker, kräftiger Schnabel', beakShort:'schlank & kräftig', adj:'schlanken', noun:'Schnabel,', beakAcc:'einen schlanken, kräftigen Schnabel',
    food:'Würmer, Larven, Beeren, Obst', foodTile:'Würmer und Beeren', foodAcc:'Würmer, Larven, Beeren und Obst', foods:[{e:'🪱',n:'Wurm'},{e:'🫐',n:'Beeren'},{e:'🍎',n:'Obst'}],
    es:'pico delgado y fuerte → gusanos, larvas, bayas y fruta', shape:'short', col:{body:'#24242b',belly:'#34343c',head:'#24242b',beak:'#f2b632'},
    kwBeak:/schlank|kraeftig/, kwFood:/wuerm|wurm|larve|beere|obst/ },
  { id:'gartenbaumlaeufer', art:'Der', name:'Gartenbaumläufer', key:'pinzette', beakName:'feiner, leicht gebogener Pinzettenschnabel', beakShort:'Pinzettenschnabel', adj:'feinen', noun:'Pinzettenschnabel,', beakAcc:'einen feinen, leicht gebogenen Pinzettenschnabel',
    food:'Insekten und Spinnen an Bäumen', foodTile:'Insekten und Spinnen', foodAcc:'Insekten und Spinnen an Bäumen', foods:[{e:'🐞',n:'Insekt'},{e:'🕷️',n:'Spinne'}],
    es:'pico fino, un poco curvo, como una pinza → insectos y arañas de los árboles', shape:'thin', col:{body:'#8a6a48',belly:'#efe6d6',head:'#8a6a48',beak:'#4a3a2a'},
    kwBeak:/pinzette|fein|gebogen/, kwFood:/insekt|spinne/ },
  { id:'maeusebussard', art:'Der', name:'Mäusebussard', key:'haken', beakName:'gebogener Hakenschnabel mit scharfer Spitze', beakShort:'Hakenschnabel', adj:'gebogenen', noun:'Hakenschnabel,', beakAcc:'einen gebogenen Hakenschnabel mit scharfer Spitze',
    food:'kleine Säugetiere (vor allem Mäuse)', foodTile:'Mäuse', foodAcc:'kleine Säugetiere wie Mäuse', foods:[{e:'🐭',n:'Maus'}],
    es:'pico curvo en gancho con punta afilada → pequeños mamíferos, sobre todo ratones', shape:'hook', col:{body:'#6e4a2c',belly:'#d9c3a0',head:'#6e4a2c',beak:'#3a3a3a'},
    kwBeak:/haken|gebogen|scharf/, kwFood:/maus|maeuse|saeuge/ },
  { id:'buntspecht', art:'Der', name:'Buntspecht', key:'meissel', beakName:'kräftiger Meißelschnabel', beakShort:'Meißelschnabel', adj:'kräftigen', noun:'Meißelschnabel,', beakAcc:'einen kräftigen Meißelschnabel',
    food:'Insekten und Larven im Holz; Samen von Nadelbäumen', foodTile:'Larven im Holz', foodAcc:'Insekten und Larven im Holz', foods:[{e:'🪵',n:'Larve im Holz'},{e:'🌲',n:'Samen vom Nadelbaum'}],
    es:'pico fuerte de cincel → insectos y larvas en la madera; semillas de coníferas', shape:'chisel', col:{body:'#1f1f24',belly:'#f2efe8',head:'#1f1f24',beak:'#3f3f46',extra:'#d2322d'},
    kwBeak:/meissel|kraeftig/, kwFood:/larve|insekt|holz|samen|nadel/ },
  { id:'storch', art:'Der', name:'Storch', key:'lang', beakName:'langer, spitzer Schnabel', beakShort:'lang & spitz', adj:'langen', noun:'Schnabel,', beakAcc:'einen langen, spitzen Schnabel',
    food:'kleine Tiere', foodTile:'kleine Tiere', foodAcc:'kleine Tiere', foods:[{e:'🐸',n:'Frosch (kleines Tier)'}],
    es:'pico largo y puntiagudo → animales pequeños', shape:'long', col:{body:'#f4f2ee',belly:'#ffffff',head:'#f4f2ee',beak:'#e0452f'},
    kwBeak:/lang|spitz/, kwFood:/tier|frosch/ },
  { id:'stockente', art:'Die', name:'Stockente', key:'seih', beakName:'flacher Seihschnabel mit Hornlamellen', beakShort:'Seihschnabel', adj:'flachen', noun:'Seihschnabel,', beakAcc:'einen flachen Seihschnabel mit Hornlamellen',
    food:'kleine Wassertiere, Pflanzen', foodTile:'Wassertiere und Pflanzen', foodAcc:'kleine Wassertiere und Pflanzen', foods:[{e:'🦐',n:'kleines Wassertier'},{e:'🌿',n:'Wasserpflanze'}],
    es:'pico plano filtrador con láminas córneas → animalitos acuáticos y plantas', shape:'flat', col:{body:'#7a6048',belly:'#b99c7c',head:'#1f6b45',beak:'#d8b73a'},
    kwBeak:/flach|seih|lamelle/, kwFood:/wasser|pflanze/ },
];
const BEAK_FIX = [
  { s:'Die Stockente hat einen ___ Schnabel.', o:['flachen','flacher','flach','flache'], a:'flachen', es:'Después de «einen» (masculino, acusativo) el adjetivo termina en -en: einen flachEN Schnabel.' },
  { s:'Die Amsel hat einen ___ Schnabel.', o:['schlanken','Schlank','schlanker','schlank'], a:'schlanken', es:'einen schlankEN Schnabel. Los adjetivos van en minúscula.' },
  { s:'Der Gartenbaumläufer hat einen leicht ___ Schnabel.', o:['gebogenen','gebogener','gebogen','biegen'], a:'gebogenen', es:'einen leicht gebogenEN Schnabel = un pico ligeramente curvado.' },
  { s:'Der ___ hat einen Meißelschnabel.', o:['Buntspecht','Buntspeckt','Bundspecht','Buntspechte'], a:'Buntspecht', es:'Se escribe Buntspecht (bunt + Specht), sin «ck».' },
  { s:'Der Gartenbaumläufer hat einen Pinzettenschnabel, um ___ zu fressen.', o:['Insekten','Inseckten','Insekte','Insektten'], a:'Insekten', es:'Insekt → Insekten, sin «ck».' },
  { s:'Der Buntspecht hat einen Meißelschnabel, ___ Larven zu fressen.', o:['um','für','damit','zu'], a:'um', es:'«um … zu» + infinitivo = «para …». Ej.: um Larven zu fressen = para comer larvas.' },
];

/* ============================================================
   MERKMALE (Seite 8)
   ============================================================ */
const MERKMALE = [
  { short:'Flügel', de:'Alle Vögel haben Flügel.', es:'Tienen alas.', re:/fluegel/ },
  { short:'Federkleid', de:'Alle Vögel haben ein Federkleid.', es:'Tienen plumaje (plumas).', re:/feder/ },
  { short:'Schnabel', de:'Alle Vögel haben einen Schnabel.', es:'Tienen pico.', re:/schnabel/ },
  { short:'keine echten Zähne', de:'Vögel haben keine echten Zähne.', es:'No tienen dientes verdaderos.', re:/zaehn|zahn/ },
  { short:'legen Eier', de:'Alle Vögel legen Eier.', es:'Ponen huevos.', re:/\beier?\b|\blegen/ },
  { short:'Kloake', de:'Vögel besitzen eine Kloake.', es:'Tienen cloaca.', re:/kloake/ },
  { short:'Schuppen an den Beinen', de:'Die Haut an den Beinen hat Schuppen.', es:'Escamas en las patas.', re:/schupp/ },
  { short:'Krallen an den Zehen', de:'An den Zehen sind Krallen.', es:'Garras en los dedos.', re:/krall/ },
  { short:'Luftsäcke & hohle Röhrenknochen', de:'Vögel haben Luftsäcke und hohle Röhrenknochen.', es:'Sacos aéreos y huesos huecos.', re:/luftsa|roehren|hohl/ },
  { short:'gleichwarm (38–42 °C)', de:'Vögel sind gleichwarm (38–42 °C).', es:'Temperatura constante (38–42 °C).', re:/gleichwarm|temperatur|38|42/ },
];
const MERKMAL_EXTRA = { short:'Wirbeltiere', re:/wirbel/ };
const FAKES = [
  { de:'haben Zähne', es:'Falso: las aves NO tienen dientes.' },
  { de:'haben ein Fell', es:'Falso: tienen plumas, no pelo (Fell = pelaje).' },
  { de:'sind wechselwarm', es:'Falso: son gleichwarm (temperatura constante).' },
  { de:'bekommen lebende Junge', es:'Falso: las aves ponen huevos.' },
  { de:'haben keine Wirbelsäule', es:'Falso: son vertebrados, tienen columna.' },
  { de:'atmen mit Kiemen', es:'Falso: respiran con pulmones y sacos aéreos (Kiemen = branquias).' },
  { de:'alle können fliegen', es:'Falso: Strauß, Emu, Pinguin y Kiwi no pueden volar.' },
  { de:'haben schwere Knochen', es:'Falso: tienen huesos ligeros y huecos.' },
];
const FLIGHTLESS = ['strauss','emu','pinguin','kiwi'];
const FLYERS = ['adler','amsel','storch','stockente','falke','buntspecht'];

/* ============================================================
   ZONES, STATIONS, NPC DIALOGUES, BOSSES
   ============================================================ */
const ZONES = [
  { z:0, name:'Nest-Dorf', es:'Pueblo Nido' },
  { z:1, name:'Federwiese', es:'Prado de las Plumas', topic:'aussen', page:'Seite 2' },
  { z:2, name:'Knochenhöhle', es:'Cueva de los Huesos', topic:'skelett', page:'Seite 3' },
  { z:3, name:'Magen-Moor', es:'Pantano del Estómago', topic:'organe', page:'Seite 4' },
  { z:4, name:'Schnabel-Wald', es:'Bosque de los Picos', topic:'schnabel', page:'Seiten 6, 7, 9' },
  { z:5, name:'Merkmal-Gipfel', es:'Cumbre de las Características', topic:'merkmale', page:'Seite 8' },
];
const STATIONS = {
  1: [ { kind:'obby', arg:'aussen', name:'Artikel-Obby', icon:'🟦' }, { kind:'drones', arg:'aussen', name:'Drohnen-Jagd', icon:'🎯' }, { kind:'raid', arg:'aussen', name:'Beschriften-Raid', icon:'🏷️' }, { kind:'terminal', arg:'aussen', cloze:'p2', name:'Code-Terminal', icon:'💻' } ],
  2: [ { kind:'obby', arg:'skelett', name:'Artikel-Obby', icon:'🟦' }, { kind:'drones', arg:'skelett', name:'Drohnen-Jagd', icon:'🎯' }, { kind:'raid', arg:'skelett', name:'Beschriften-Raid', icon:'🦴' }, { kind:'terminal', arg:'skelett', cloze:'p3', name:'Code-Terminal', icon:'💻' } ],
  3: [ { kind:'foodrun', arg:'organe', name:'Verdauungs-Run', icon:'🚪' }, { kind:'drones', arg:'organe', name:'Drohnen-Jagd', icon:'🎯' }, { kind:'raid', arg:'organe', name:'Beschriften-Raid', icon:'🫁' }, { kind:'terminal', arg:'organe', cloze:'p4', name:'Code-Terminal', icon:'💻' } ],
  4: [ { kind:'beakblaster', arg:'schnabel', name:'Schnabel-Blaster', icon:'🔫' }, { kind:'beakrun', arg:'schnabel', name:'Schnabel-Türen', icon:'🚪' }, { kind:'obby', arg:'schnabel', name:'Artikel-Obby', icon:'🟦' }, { kind:'terminal', arg:'schnabel', cloze:'p6', name:'Code-Terminal', icon:'💻' } ],
  5: [ { kind:'collector', arg:'merkmale', name:'Merkmal-Jagd', icon:'🧭' }, { kind:'tfrun', arg:'all', name:'Wahr-oder-Falsch-Türen', icon:'🚪' }, { kind:'drones', arg:'op', name:'Aufgaben-Drohnen', icon:'🎯' }, { kind:'terminal', arg:'merkmale', cloze:'p8', name:'Code-Terminal', icon:'💻' } ],
};
const STATION_INFO = {
  obby:{ de:'Spring auf die Plattform mit dem richtigen Artikel. Die falsche fällt in die Lava!', es:'Salta a la plataforma con el artículo correcto. ¡La incorrecta cae a la lava!', how:'WASD laufen · Leertaste springen · Maus: Kamera. Blau = der, Rot = die, Grün = das.' },
  drones:{ de:'Schieß die Drohne mit der richtigen Antwort ab. Pass auf, die anderen schießen zurück!', es:'Derriba el dron con la respuesta correcta. ¡Cuidado, los otros disparan!', how:'Zielen mit der Maus · Klick = schießen · in Bewegung bleiben.' },
  raid:{ de:'Bring jedes Wort zur richtigen Nummer. Danach schreibst du fünf Wörter selbst.', es:'Lleva cada palabra a su número. Después escribes tú cinco palabras.', how:'Lauf in einen Kristall, um ihn zu tragen. Lauf dann auf die passende Nummer.' },
  terminal:{ de:'Knack das Terminal: Schreib die Wörter richtig, mit Artikel, bevor die Zeit abläuft.', es:'Hackea el terminal: escribe bien las palabras, con artículo, antes de que se acabe el tiempo.', how:'Tippen und Enter. Die Knöpfe ä, ö, ü, ß helfen dir.' },
  foodrun:{ de:'Lauf durch die richtige Tür, in der Reihenfolge der Verdauung. Hinter der falschen Tür ist ein Loch!', es:'Pasa por la puerta correcta, en el orden de la digestión. ¡Detrás de la incorrecta hay un agujero!', how:'Lies die Frage oben und wähle die Tür.' },
  beakblaster:{ de:'Wähle den richtigen Schnabel und schieß das Futter ab.', es:'Elige el pico correcto y dispara a la comida.', how:'Tasten 1 bis 6 = Schnabel wählen · Klick = schießen.' },
  beakrun:{ de:'Welcher Vogel, welcher Schnabel, welches Futter? Wähle die richtige Tür.', es:'¿Qué ave, qué pico, qué comida? Elige la puerta correcta.', how:'Lies die Frage oben und wähle die Tür.' },
  collector:{ de:'Sammle die zehn echten Merkmale der Vögel. Die Lügen-Geister jagen dich!', es:'Recoge las diez características verdaderas. ¡Los fantasmas mentirosos te persiguen!', how:'Lauf in die goldenen Rollen. Schieß die Geister, um sie zu stoppen.' },
  tfrun:{ de:'Richtig oder falsch? Lauf durch die richtige Tür.', es:'¿Verdadero o falso? Pasa por la puerta correcta.', how:'Links und rechts: Richtig oder Falsch.' },
};
const NPCS = {
  0: { name:'Professorin Eule', kind:'eule', lines:[
    ['Willkommen auf der Vogel-Insel! Ich bin Professorin Eule.','¡Bienvenido a la Isla de los Pájaros! Soy la profesora Búho.'],
    ['Der Vergess-Geier hat die Wörter der Insel gestohlen. Die Vögel wissen nicht mehr, wie ihre Körperteile heißen!','El Buitre del Olvido ha robado las palabras de la isla. ¡Los pájaros ya no saben cómo se llaman las partes de su cuerpo!'],
    ['Geh durch die fünf Zonen. Sprich mit den Vögeln, spiele an den Schreinen und besiege die Bosse.','Recorre las cinco zonas. Habla con los pájaros, juega en los santuarios y vence a los jefes.'],
    ['Steuerung: WASD oder Pfeiltasten zum Laufen. E zum Sprechen und Spielen. Esc öffnet das Menü, B das Lexikon.','Controles: WASD o flechas para caminar. E para hablar y jugar. Esc abre el menú, B el diccionario (Lexikon).'],
    ['Lerne jedes Wort MIT Artikel: der ist blau, die ist rot, das ist grün.','Aprende cada palabra CON su artículo: der es azul, die es rojo, das es verde.'],
    ['Jeden Tag gibt es am Morgen-Altar ein kurzes Training. Das hilft dir, nichts zu vergessen!','Cada día hay un entrenamiento corto en el Altar de la Mañana. ¡Así no olvidas nada!'],
    ['Die erste Zone ist die Federwiese. Folge dem goldenen Pfeil!','La primera zona es el Prado de las Plumas. ¡Sigue la flecha dorada!'],
  ]},
  1: { name:'Die Amsel', kind:'amsel', lines:[
    ['Hallo, Ranger! Ich bin die Amsel, ein Singvogel.','¡Hola, guardabosques! Soy el mirlo, un pájaro cantor.'],
    ['Es gibt viele Vogelarten: Greifvögel wie der Adler oder der Falke, Singvögel wie ich oder der Haussperling und Wasservögel wie der Pelikan.','Hay muchas especies de aves: rapaces como el águila o el halcón, pájaros cantores como yo o el gorrión, y aves acuáticas como el pelícano.'],
    ['Wir sehen verschieden aus, aber wir haben einen gemeinsamen Körperbau.','Somos distintos por fuera, pero tenemos la misma estructura del cuerpo.'],
    ['Der Körper ist in Kopf, Rumpf und Schwanz gegliedert.','El cuerpo se divide en cabeza, tronco y cola.'],
    ['Die Vordergliedmaßen sind zu Flügeln umgebildet. Sie dienen dem Fliegen.','Las extremidades anteriores se transformaron en alas. Sirven para volar.'],
    ['Die Hintergliedmaßen besitzen Krallen – zum Laufen, Klettern, Greifen oder Schwimmen.','Las extremidades posteriores tienen garras: para andar, trepar, agarrar o nadar.'],
    ['Alle Vögel besitzen einen Schnabel. Er hat verschiedene Formen.','Todas las aves tienen pico. Tiene formas distintas.'],
    ['Spiele an den vier Schreinen. Ab drei Schreinen kannst du den Krähen-König herausfordern!','Juega en los cuatro santuarios. ¡Con tres ya puedes desafiar al Rey Cuervo!'],
  ]},
  2: { name:'Der Adler', kind:'adler', lines:[
    ['Willkommen in der Knochenhöhle! Ich bin der Adler.','¡Bienvenido a la Cueva de los Huesos! Soy el águila.'],
    ['Vögel sind Wirbeltiere, die fliegen können. Unser Skelett besteht aus sehr leichten Knochen.','Las aves son vertebrados que pueden volar. Nuestro esqueleto es de huesos muy ligeros.'],
    ['Wie alle Wirbeltiere haben wir einen Schädel und eine Wirbelsäule mit den Rippen.','Como todos los vertebrados tenemos cráneo y columna vertebral con costillas.'],
    ['Die Schwanzwirbelsäule ist viel kürzer als bei den Reptilien.','Las vértebras de la cola son mucho más cortas que en los reptiles.'],
    ['Der Flügel hat einen Oberarm, einen Unterarm mit Elle und Speiche und die Hand.','El ala tiene brazo (húmero), antebrazo con cúbito y radio, y la mano.'],
    ['Das Becken verbindet die Beine mit der Wirbelsäule. Das Bein hat Oberschenkel, Unterschenkel und Zehen.','La pelvis une las patas con la columna. La pata tiene muslo, pierna y dedos.'],
    ['Am großen Brustbein sitzen die Muskeln, die die Flügel bewegen.','En el gran esternón están los músculos que mueven las alas.'],
    ['Das Knochen-Phantom bewacht die Höhle. Lerne die Knochen, dann besiege es!','El Fantasma de Huesos vigila la cueva. ¡Aprende los huesos y derrótalo!'],
  ]},
  3: { name:'Der Pelikan', kind:'pelikan', lines:[
    ['Hallo! Ich bin der Pelikan. Hier im Magen-Moor lernst du die Organe.','¡Hola! Soy el pelícano. Aquí en el Pantano del Estómago aprendes los órganos.'],
    ['Die Luftröhre bringt die Luft von außen zur Lunge.','La tráquea lleva el aire desde fuera hasta el pulmón.'],
    ['Die Lunge hat mehrere Luftsäcke. So nehmen wir mehr Sauerstoff auf.','El pulmón tiene varios sacos aéreos. Así tomamos más oxígeno.'],
    ['Vögel haben keine Zähne! Die Nahrung wird im Körper zerkleinert.','¡Las aves no tienen dientes! La comida se tritura dentro del cuerpo.'],
    ['Der Weg der Nahrung: zuerst in den Kropf, dann in den Drüsenmagen, danach in den Kaumagen und schließlich in den Darm.','El camino de la comida: primero al buche, luego al proventrículo, después a la molleja y al final al intestino.'],
    ['Am Ende ist die Kloake, wie bei den Reptilien. Der Urin aus der Niere, der Kot und die Spermazellen verlassen dort den Körper.','Al final está la cloaca, como en los reptiles. La orina del riñón, las heces y los espermatozoides salen del cuerpo por ahí.'],
    ['Merk dir: Kropf – Drüsenmagen – Kaumagen – Darm – Kloake. Der Kropf-Krake wartet auf dich!','Recuerda: buche – proventrículo – molleja – intestino – cloaca. ¡El Kraken del Buche te espera!'],
  ]},
  4: { name:'Der Buntspecht', kind:'buntspecht', lines:[
    ['Tock-tock! Ich bin der Buntspecht. Der Schnabel verrät, was ein Vogel frisst.','¡Toc-toc! Soy el pico picapinos. El pico revela lo que come un ave.'],
    ['Der Schnabel besteht aus Knochen mit einer Hülle aus hartem Horn. Das Horn wächst ständig nach und wird abgenutzt.','El pico es hueso con una funda de queratina dura. La queratina crece siempre y se desgasta.'],
    ['Der Schnabel ist beweglich und empfindlich. Die Uferschnepfe stochert damit im Schlamm nach Würmern.','El pico es móvil y sensible. La aguja colinegra hurga con él en el barro buscando gusanos.'],
    ['Schnäbel sind wie Werkzeuge: wie eine Pinzette, ein Meißel oder eine Zange.','Los picos son como herramientas: como una pinza, un cincel o una tenaza.'],
    ['Ich habe einen kräftigen Meißelschnabel, um Insekten und Larven im Holz zu fressen.','Tengo un pico fuerte de cincel para comer insectos y larvas en la madera.'],
    ['Die Amsel: schlank und kräftig – Würmer, Larven, Beeren, Obst. Der Gartenbaumläufer: feiner Pinzettenschnabel – Insekten und Spinnen.','El mirlo: delgado y fuerte – gusanos, larvas, bayas, fruta. El agateador: pico fino de pinza – insectos y arañas.'],
    ['Der Mäusebussard: Hakenschnabel – Mäuse. Der Storch: lang und spitz – kleine Tiere. Die Stockente: Seihschnabel – kleine Wassertiere und Pflanzen.','El busardo: pico de gancho – ratones. La cigüeña: largo y puntiagudo – animales pequeños. El ánade real: pico filtrador – animalitos acuáticos y plantas.'],
    ['Im Test schreibst du: „Der Buntspecht hat einen Meißelschnabel, um Larven zu fressen.“ Achtung: einen flachen, einen schlanken Schnabel!','En el examen escribes: «Der Buntspecht hat einen Meißelschnabel, um Larven zu fressen.» Ojo: einen flachEN, einen schlankEN Schnabel.'],
  ]},
  5: { name:'Der Pinguin', kind:'pinguin', lines:[
    ['Hallo! Ich bin der Pinguin. Ich bin ein Vogel – aber ich kann nicht fliegen!','¡Hola! Soy el pingüino. Soy un ave, ¡pero no puedo volar!'],
    ['Vögel gehören zu den Wirbeltieren. Man erkennt sie an gemeinsamen Merkmalen.','Las aves son vertebrados. Se reconocen por características comunes.'],
    ['Alle Vögel haben Flügel, ein Federkleid und einen Schnabel, aber keine echten Zähne.','Todas las aves tienen alas, plumaje y pico, pero no dientes verdaderos.'],
    ['Alle Vögel legen Eier und besitzen eine Kloake. Aus der Kloake kommen Eier, Kot und Urin.','Todas las aves ponen huevos y tienen cloaca. Por la cloaca salen huevos, heces y orina.'],
    ['Die Haut an den Beinen hat Schuppen. An den Zehen sind Krallen.','La piel de las patas tiene escamas. En los dedos hay garras.'],
    ['Wir haben Luftsäcke und hohle Röhrenknochen. Und wir sind gleichwarm: 38 bis 42 °C, wie die Säugetiere.','Tenemos sacos aéreos y huesos huecos. Y somos de sangre caliente: 38 a 42 °C, como los mamíferos.'],
    ['Flugunfähig sind der Strauß, der Emu, der Pinguin und der Kiwi – vor allem, weil wir zu schwer sind.','No pueden volar el avestruz, el emú, el pingüino y el kiwi, sobre todo porque somos demasiado pesados.'],
    ['Der Falsch-Vogel erzählt Lügen über Vögel. Sammle die zehn echten Merkmale!','El Pájaro Mentiroso cuenta mentiras sobre las aves. ¡Recoge las diez características verdaderas!'],
  ]},
};
const BOSSES = {
  1: { name:'Der Krähen-König', es:'El Rey Cuervo', hp:10, kind:'crow', intro:['Krah! Ohne Wörter bleibt ihr alle stumm!','¡Crah! ¡Sin palabras os quedáis todos mudos!'], win:['Nein! Kopf, Rumpf, Schwanz … du kennst sie alle!','¡No! Cabeza, tronco, cola… ¡te las sabes todas!'] },
  2: { name:'Das Knochen-Phantom', es:'El Fantasma de Huesos', hp:11, kind:'bones', intro:['Klapper-klapper! Weißt du, wo die Elle ist?','¡Cloc-cloc! ¿Sabes dónde está el cúbito?'], win:['Mein Skelett … zerfällt …','Mi esqueleto… se deshace…'] },
  3: { name:'Der Kropf-Krake', es:'El Kraken del Buche', hp:11, kind:'kraken', intro:['Blubb! Kaumagen oder Drüsenmagen? Du bringst alles durcheinander!','¡Blub! ¿Molleja o proventrículo? ¡Lo mezclas todo!'], win:['Blubb … die Nahrung geht den richtigen Weg …','Blub… la comida va por el camino correcto…'] },
  4: { name:'Der Werkzeug-Golem', es:'El Gólem de Herramientas', hp:12, kind:'golem', intro:['Pinzette, Meißel, Zange – ich bin alle Werkzeuge!','Pinza, cincel, tenaza: ¡soy todas las herramientas!'], win:['Mein Meißel … ist stumpf …','Mi cincel… está desafilado…'] },
  5: { name:'Der Falsch-Vogel', es:'El Pájaro Mentiroso', hp:12, kind:'liar', intro:['Vögel haben Zähne und ein Fell! Hihihi!','¡Las aves tienen dientes y pelaje! ¡Jijiji!'], win:['Die Wahrheit … sie tut weh!','La verdad… ¡duele!'] },
};
const GEIER = { name:'Der Vergess-Geier', es:'El Buitre del Olvido', intro:[
  ['HAHAHA! Ich bin der Vergess-Geier! Im Prüfungsturm ist alles auf Deutsch – wie im echten Test!','¡JAJAJA! ¡Soy el Buitre del Olvido! En la Torre del Examen todo está en alemán, ¡como en el examen de verdad!'],
  ['Jede richtige Antwort trifft mich. Ab 60 % bin ich besiegt. Spanische Hilfe kostet einen Joker!','Cada respuesta correcta me golpea. Con un 60 % me vences. ¡La ayuda en español cuesta un comodín (Joker)!'],
]};

const LEVELS = [[0,'Küken','polluelo'],[120,'Nestling','pichón'],[300,'Jungvogel','pájaro joven'],[600,'Ranger','guardabosques'],[1000,'Ober-Ranger','guardabosques jefe'],[1600,'Vogel-Experte','experto en aves'],[2400,'Meister-Ornithologe','maestro ornitólogo']];
const BADGES = {
  first:  { n:'Erster Sieg', d:'Besiege ein Nebel-Monster.', i:'⚔️' },
  boss1:  { n:'Wiesen-Retter', d:'Besiege den Krähen-König.', i:'👑' },
  boss2:  { n:'Knochen-Kenner', d:'Besiege das Knochen-Phantom.', i:'🦴' },
  boss3:  { n:'Magen-Meister', d:'Besiege den Kropf-Kraken.', i:'🐙' },
  boss4:  { n:'Schnabel-Profi', d:'Besiege den Werkzeug-Golem.', i:'🔧' },
  boss5:  { n:'Wahrheits-Held', d:'Besiege den Falsch-Vogel.', i:'🎭' },
  combo10:{ n:'Feuer-Feder', d:'10 richtige Antworten in Folge.', i:'🔥' },
  art30:  { n:'Artikel-Profi', d:'30 richtige Artikel (der/die/das).', i:'🎨' },
  gold20: { n:'Gold-Sammler', d:'20 Gold-Karten im Lexikon.', i:'🏅' },
  daily3: { n:'Frühaufsteher', d:'Morgen-Training an 3 Tagen.', i:'🌅' },
  exam80: { n:'Prüfungs-Held', d:'Mindestens 80 % im Prüfungsturm.', i:'🏆' },
  stars:  { n:'Sternen-Jäger', d:'Alle 20 Schreine mit 3 Sternen.', i:'⭐' },
};
const SHOP = [
  { id:'hat-cap', type:'hat', name:'Kappe', price:60, emoji:'🧢' },
  { id:'hat-top', type:'hat', name:'Zylinder', price:120, emoji:'🎩' },
  { id:'hat-grad', type:'hat', name:'Doktorhut', price:250, emoji:'🎓' },
  { id:'hat-crown', type:'hat', name:'Krone', price:400, emoji:'👑' },
  { id:'heart', type:'heart', name:'Extra-Herz (max. 8)', price:200, emoji:'❤️' },
  { id:'joker', type:'joker', name:'Joker für den Prüfungsturm', price:80, emoji:'🃏' },
];
