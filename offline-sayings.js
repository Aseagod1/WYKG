diff --git a/public/index.html b/public/index.html
index 8c9c1a1..c1d0f1b 100644
--- a/public/index.html
+++ b/public/index.html
@@ -1,6 +1,7 @@
 <!doctype html>
 <html lang="en">
 <head>
+  <!-- NOTE: app.js is now a module so it can import the 150-phrase offline pack -->
   <meta charset="utf-8" />
   <meta name="viewport" content="width=device-width,initial-scale=1" />
   <title>WHAT YOU KNOW GOOD?</title>
@@ -116,6 +117,6 @@
   <footer class="footer">
     <span>Install it like an app: browser menu → Install / Add to Home Screen.</span>
   </footer>
-
-  <script src="app.js"></script>
+  <script type="module" src="app.js"></script>
 </body>
 </html>
diff --git a/public/sw.js b/public/sw.js
index 0e34c2b..b8a0f9a 100644
--- a/public/sw.js
+++ b/public/sw.js
@@ -1,12 +1,13 @@
 const CACHE_NAME = "wykg-v2";
 const ASSETS = [
   "/",
   "/index.html",
   "/styles.css",
   "/app.js",
+  "/offline-sayings.js",
   "/manifest.json",
   "/download-qr.png",
   "/icons/icon-192.png",
   "/icons/icon-512.png"
 ];
diff --git a/public/app.js b/public/app.js
index 9fd2a70..12bb6e1 100644
--- a/public/app.js
+++ b/public/app.js
@@ -1,3 +1,6 @@
+// Offline pack (150 sayings) — matches your tone (Southern + Black American heavy)
+import { OFFLINE_SAYINGS } from "./offline-sayings.js";
+
 const API_BASE = "";
 const MAX_PLAYERS = 10;
 const $ = (id) => document.getElementById(id);
@@ -54,15 +57,9 @@ const store = {
   set(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
 };

-// Offline fallback so the first half always shows when you click New Round
-const BUILTIN_SAYINGS = [
-  { id:"b1", culture:"American", subculture:"Southern", first:"Don't count your chickens", second:"before they hatch." },
-  { id:"b2", culture:"American", subculture:"Southern", first:"A hard head", second:"makes a soft behind." },
-  { id:"b3", culture:"American", subculture:"Black American", first:"All skin folk", second:"ain't kinfolk." },
-  { id:"b4", culture:"English-speaking", subculture:"General English", first:"A stitch in time", second:"saves nine." },
-  { id:"b5", culture:"Latin", subculture:"Spanish", first:"Más vale tarde", second:"que nunca." },
-  { id:"b6", culture:"Chinese", subculture:"Classic", first:"A journey of a thousand miles", second:"begins with a single step." }
-];
+// Offline fallback (expanded to 150)
+const BUILTIN_SAYINGS = OFFLINE_SAYINGS;
diff --git a/public/offline-sayings.js b/public/offline-sayings.js
new file mode 100644
index 0000000..5f2c7e3
--- /dev/null
+++ b/public/offline-sayings.js
@@ -0,0 +1,208 @@
+// 150 OFFLINE SAYINGS (tone-forward: Southern + Black American heavy)
+// Format: { id, culture, subculture, first, second }
+export const OFFLINE_SAYINGS = [
+  // ---------------------------
+  // AMERICAN • SOUTHERN (60)
+  // ---------------------------
+  { id:"b001", culture:"American", subculture:"Southern", first:"Don't count your chickens", second:"before they hatch." },
+  { id:"b002", culture:"American", subculture:"Southern", first:"A hard head", second:"makes a soft behind." },
+  { id:"b003", culture:"American", subculture:"Southern", first:"If you stay ready", second:"you ain't gotta get ready." },
+  { id:"b004", culture:"American", subculture:"Southern", first:"That dog won't hunt", second:"." },
+  { id:"b005", culture:"American", subculture:"Southern", first:"Bless your heart", second:"." },
+  { id:"b006", culture:"American", subculture:"Southern", first:"All hat", second:"no cattle." },
+  { id:"b007", culture:"American", subculture:"Southern", first:"You can't make a silk purse", second:"out of a sow's ear." },
+  { id:"b008", culture:"American", subculture:"Southern", first:"He's all bark", second:"and no bite." },
+  { id:"b009", culture:"American", subculture:"Southern", first:"Don't let the door hit you", second:"where the good Lord split you." },
+  { id:"b010", culture:"American", subculture:"Southern", first:"Ain't no use crying", second:"over spilled milk." },
+  { id:"b011", culture:"American", subculture:"Southern", first:"If it ain't broke", second:"don't fix it." },
+  { id:"b012", culture:"American", subculture:"Southern", first:"You can catch more flies", second:"with honey than vinegar." },
+  { id:"b013", culture:"American", subculture:"Southern", first:"Don't write a check", second:"your tail can't cash." },
+  { id:"b014", culture:"American", subculture:"Southern", first:"You can't put the toothpaste", second:"back in the tube." },
+  { id:"b015", culture:"American", subculture:"Southern", first:"It's hotter than", second:"a goat in a pepper patch." },
+  { id:"b016", culture:"American", subculture:"Southern", first:"Nervous as", second:"a long-tailed cat in a room full of rocking chairs." },
+  { id:"b017", culture:"American", subculture:"Southern", first:"Useless as", second:"screen doors on a submarine." },
+  { id:"b018", culture:"American", subculture:"Southern", first:"He's so tight", second:"he squeaks when he walks." },
+  { id:"b019", culture:"American", subculture:"Southern", first:"You can’t get blood", second:"from a turnip." },
+  { id:"b020", culture:"American", subculture:"Southern", first:"Don't start none", second:"won't be none." },
+  { id:"b021", culture:"American", subculture:"Southern", first:"A lie don't care", second:"who tells it." },
+  { id:"b022", culture:"American", subculture:"Southern", first:"Ain't but two kinds of people", second:"those who do and those who talk." },
+  { id:"b023", culture:"American", subculture:"Southern", first:"Pretty is as pretty", second:"does." },
+  { id:"b024", culture:"American", subculture:"Southern", first:"Don't miss your water", second:"'til your well runs dry." },
+  { id:"b025", culture:"American", subculture:"Southern", first:"You reap", second:"what you sow." },
+  { id:"b026", culture:"American", subculture:"Southern", first:"Make hay", second:"while the sun shines." },
+  { id:"b027", culture:"American", subculture:"Southern", first:"Don't bite", second:"the hand that feeds you." },
+  { id:"b028", culture:"American", subculture:"Southern", first:"Mind your business", second:"and your business will mind you." },
+  { id:"b029", culture:"American", subculture:"Southern", first:"A closed mouth", second:"don't get fed." },
+  { id:"b030", culture:"American", subculture:"Southern", first:"You can't see the forest", second:"for the trees." },
+  { id:"b031", culture:"American", subculture:"Southern", first:"If you lay down with dogs", second:"you'll get up with fleas." },
+  { id:"b032", culture:"American", subculture:"Southern", first:"Ain't nothing new", second:"under the sun." },
+  { id:"b033", culture:"American", subculture:"Southern", first:"Big talk don't", second:"cook no rice." },
+  { id:"b034", culture:"American", subculture:"Southern", first:"Don't throw rocks", second:"and hide your hand." },
+  { id:"b035", culture:"American", subculture:"Southern", first:"You can't run with the rabbits", second:"and hunt with the hounds." },
+  { id:"b036", culture:"American", subculture:"Southern", first:"A friend to everybody", second:"is a friend to nobody." },
+  { id:"b037", culture:"American", subculture:"Southern", first:"If you can't say nothing nice", second:"don't say nothing at all." },
+  { id:"b038", culture:"American", subculture:"Southern", first:"Don't put all your eggs", second:"in one basket." },
+  { id:"b039", culture:"American", subculture:"Southern", first:"You can't teach an old dog", second:"new tricks." },
+  { id:"b040", culture:"American", subculture:"Southern", first:"When it rains", second:"it pours." },
+  { id:"b041", culture:"American", subculture:"Southern", first:"Every road ain't", second:"the right road." },
+  { id:"b042", culture:"American", subculture:"Southern", first:"Don’t let pride", second:"make you poor." },
+  { id:"b043", culture:"American", subculture:"Southern", first:"A little sugar", second:"catches a lot of flies." },
+  { id:"b044", culture:"American", subculture:"Southern", first:"Ain't no such thing", second:"as a free lunch." },
+  { id:"b045", culture:"American", subculture:"Southern", first:"Don't make promises", second:"you can't keep." },
+  { id:"b046", culture:"American", subculture:"Southern", first:"Easy come", second:"easy go." },
+  { id:"b047", culture:"American", subculture:"Southern", first:"The truth will", second:"set you free." },
+  { id:"b048", culture:"American", subculture:"Southern", first:"Measure twice", second:"cut once." },
+  { id:"b049", culture:"American", subculture:"Southern", first:"You can't have your cake", second:"and eat it too." },
+  { id:"b050", culture:"American", subculture:"Southern", first:"Don't borrow trouble", second:"." },
+  { id:"b051", culture:"American", subculture:"Southern", first:"A little bit of something", second:"beats a whole lot of nothing." },
+  { id:"b052", culture:"American", subculture:"Southern", first:"The squeaky wheel", second:"gets the grease." },
+  { id:"b053", culture:"American", subculture:"Southern", first:"Don’t cut off your nose", second:"to spite your face." },
+  { id:"b054", culture:"American", subculture:"Southern", first:"A chain is only", second:"as strong as its weakest link." },
+  { id:"b055", culture:"American", subculture:"Southern", first:"Don’t talk the talk", second:"if you can’t walk the walk." },
+  { id:"b056", culture:"American", subculture:"Southern", first:"If you want something done right", second:"do it yourself." },
+  { id:"b057", culture:"American", subculture:"Southern", first:"Many hands", second:"make light work." },
+  { id:"b058", culture:"American", subculture:"Southern", first:"Don't let your mouth", second:"write your tail a check." },
+  { id:"b059", culture:"American", subculture:"Southern", first:"A watched pot", second:"never boils." },
+  { id:"b060", culture:"American", subculture:"Southern", first:"Don't stir the pot", second:"if you can't take the heat." },
+
+  // ---------------------------
+  // AMERICAN • BLACK AMERICAN (50)
+  // ---------------------------
+  { id:"b061", culture:"American", subculture:"Black American", first:"All skin folk", second:"ain't kinfolk." },
+  { id:"b062", culture:"American", subculture:"Black American", first:"Closed mouths", second:"don't get fed." },
+  { id:"b063", culture:"American", subculture:"Black American", first:"If it don't make dollars", second:"it don't make sense." },
+  { id:"b064", culture:"American", subculture:"Black American", first:"Don't start nothing", second:"won't be nothing." },
+  { id:"b065", culture:"American", subculture:"Black American", first:"What’s understood", second:"ain’t gotta be explained." },
+  { id:"b066", culture:"American", subculture:"Black American", first:"Stay out my way", second:"if you ain't helping." },
+  { id:"b067", culture:"American", subculture:"Black American", first:"Don't let folks play in your face", second:"and call it love." },
+  { id:"b068", culture:"American", subculture:"Black American", first:"A hit dog", second:"will holler." },
+  { id:"b069", culture:"American", subculture:"Black American", first:"You can't pour from", second:"an empty cup." },
+  { id:"b070", culture:"American", subculture:"Black American", first:"If you know better", second:"you do better." },
+  { id:"b071", culture:"American", subculture:"Black American", first:"Don't confuse being invited", second:"with being wanted." },
+  { id:"b072", culture:"American", subculture:"Black American", first:"Everybody ain't your friend", second:"." },
+  { id:"b073", culture:"American", subculture:"Black American", first:"People will love you", second:"and still not support you." },
+  { id:"b074", culture:"American", subculture:"Black American", first:"If they wanted to", second:"they would." },
+  { id:"b075", culture:"American", subculture:"Black American", first:"Energy don't lie", second:"." },
+  { id:"b076", culture:"American", subculture:"Black American", first:"Don't argue with folks", second:"who like being wrong." },
+  { id:"b077", culture:"American", subculture:"Black American", first:"If you keep letting it slide", second:"it'll keep happening." },
+  { id:"b078", culture:"American", subculture:"Black American", first:"If you ain’t got no motion", second:"don’t be talking big." },
+  { id:"b079", culture:"American", subculture:"Black American", first:"Don't mistake kindness", second:"for weakness." },
+  { id:"b080", culture:"American", subculture:"Black American", first:"Mind the business", second:"that pays you." },
+  { id:"b081", culture:"American", subculture:"Black American", first:"Not everybody deserves", second:"access to you." },
+  { id:"b082", culture:"American", subculture:"Black American", first:"Respect is", second:"non-negotiable." },
+  { id:"b083", culture:"American", subculture:"Black American", first:"Don't let a moment", second:"cost you a lifetime." },
+  { id:"b084", culture:"American", subculture:"Black American", first:"If you don't stand for something", second:"you'll fall for anything." },
+  { id:"b085", culture:"American", subculture:"Black American", first:"You can be right", second:"and still be alone." },
+  { id:"b086", culture:"American", subculture:"Black American", first:"Watch how people move", second:"when you stop doing for them." },
+  { id:"b087", culture:"American", subculture:"Black American", first:"Don't let small minds", second:"tell you big dreams are silly." },
+  { id:"b088", culture:"American", subculture:"Black American", first:"Don't be so busy proving people wrong", second:"that you miss being happy." },
+  { id:"b089", culture:"American", subculture:"Black American", first:"Sometimes silence", second:"is a full answer." },
+  { id:"b090", culture:"American", subculture:"Black American", first:"Don't give your all", second:"to folks who give you excuses." },
+  { id:"b091", culture:"American", subculture:"Black American", first:"You can't heal", second:"in the same place that broke you." },
+  { id:"b092", culture:"American", subculture:"Black American", first:"Love is an action", second:"." },
+  { id:"b093", culture:"American", subculture:"Black American", first:"Don't let anyone rush", second:"your growth." },
+  { id:"b094", culture:"American", subculture:"Black American", first:"Don't let people measure you", second:"with a ruler they can't read." },
+  { id:"b095", culture:"American", subculture:"Black American", first:"Sometimes you gotta", second:"lose folks to find peace." },
+  { id:"b096", culture:"American", subculture:"Black American", first:"If you keep accepting less", second:"you'll keep getting less." },
+  { id:"b097", culture:"American", subculture:"Black American", first:"Don't let your emotions", second:"drive the car." },
+  { id:"b098", culture:"American", subculture:"Black American", first:"A lesson ain't always", second:"a loss." },
+  { id:"b099", culture:"American", subculture:"Black American", first:"Protect your peace", second:"." },
+  { id:"b100", culture:"American", subculture:"Black American", first:"If they can't respect you", second:"they can't be around you." },
+  { id:"b101", culture:"American", subculture:"Black American", first:"Don't be the reason", second:"you stay stuck." },
+  { id:"b102", culture:"American", subculture:"Black American", first:"Keep it cute", second:"or keep it mute." },
+  { id:"b103", culture:"American", subculture:"Black American", first:"Your circle should", second:"want you to win." },
+  { id:"b104", culture:"American", subculture:"Black American", first:"Don't let your loyalty", second:"turn into your leash." },
+  { id:"b105", culture:"American", subculture:"Black American", first:"If you always available", second:"you'll always be taken for granted." },
+  { id:"b106", culture:"American", subculture:"Black American", first:"Don't chase people", second:"who don't choose you." },
+  { id:"b107", culture:"American", subculture:"Black American", first:"If you want different", second:"do different." },
+  { id:"b108", culture:"American", subculture:"Black American", first:"Don't put your dreams", second:"in somebody else's hands." },
+  { id:"b109", culture:"American", subculture:"Black American", first:"You teach people", second:"how to treat you." },
+  { id:"b110", culture:"American", subculture:"Black American", first:"Don't let fear", second:"pick your future." },
+
+  // ---------------------------
+  // ENGLISH-SPEAKING • GENERAL (20)
+  // ---------------------------
+  { id:"b111", culture:"English-speaking", subculture:"General English", first:"A stitch in time", second:"saves nine." },
+  { id:"b112", culture:"English-speaking", subculture:"General English", first:"Better late", second:"than never." },
+  { id:"b113", culture:"English-speaking", subculture:"General English", first:"Actions speak louder", second:"than words." },
+  { id:"b114", culture:"English-speaking", subculture:"General English", first:"Don't judge a book", second:"by its cover." },
+  { id:"b115", culture:"English-speaking", subculture:"General English", first:"The early bird", second:"catches the worm." },
+  { id:"b116", culture:"English-speaking", subculture:"General English", first:"Two wrongs", second:"don't make a right." },
+  { id:"b117", culture:"English-speaking", subculture:"General English", first:"When in Rome", second:"do as the Romans do." },
+  { id:"b118", culture:"English-speaking", subculture:"General English", first:"A penny saved", second:"is a penny earned." },
+  { id:"b119", culture:"English-speaking", subculture:"General English", first:"Honesty is", second:"the best policy." },
+  { id:"b120", culture:"English-speaking", subculture:"General English", first:"Practice makes", second:"perfect." },
+  { id:"b121", culture:"English-speaking", subculture:"General English", first:"Look before", second:"you leap." },
+  { id:"b122", culture:"English-speaking", subculture:"General English", first:"Rome wasn't built", second:"in a day." },
+  { id:"b123", culture:"English-speaking", subculture:"General English", first:"Beggars can't", second:"be choosers." },
+  { id:"b124", culture:"English-speaking", subculture:"General English", first:"The best things", second:"in life aren't free." },
+  { id:"b125", culture:"English-speaking", subculture:"General English", first:"Where there's smoke", second:"there's fire." },
+  { id:"b126", culture:"English-speaking", subculture:"General English", first:"Absence makes the heart", second:"grow fonder." },
+  { id:"b127", culture:"English-speaking", subculture:"General English", first:"Birds of a feather", second:"flock together." },
+  { id:"b128", culture:"English-speaking", subculture:"General English", first:"Time flies", second:"when you're having fun." },
+  { id:"b129", culture:"English-speaking", subculture:"General English", first:"Don't cry", second:"over spilled milk." },
+  { id:"b130", culture:"English-speaking", subculture:"General English", first:"If you want peace", second:"prepare for war." },
+
+  // ---------------------------
+  // LATIN • SPANISH (10)
+  // ---------------------------
+  { id:"b131", culture:"Latin", subculture:"Spanish", first:"Más vale tarde", second:"que nunca." },
+  { id:"b132", culture:"Latin", subculture:"Spanish", first:"No dejes para mañana", second:"lo que puedes hacer hoy." },
+  { id:"b133", culture:"Latin", subculture:"Spanish", first:"Dime con quién andas", second:"y te diré quién eres." },
+  { id:"b134", culture:"Latin", subculture:"Spanish", first:"El que madruga", second:"Dios lo ayuda." },
+  { id:"b135", culture:"Latin", subculture:"Spanish", first:"Camarón que se duerme", second:"se lo lleva la corriente." },
+  { id:"b136", culture:"Latin", subculture:"Spanish", first:"A palabras necias", second:"oídos sordos." },
+  { id:"b137", culture:"Latin", subculture:"Spanish", first:"Ojos que no ven", second:"corazón que no siente." },
+  { id:"b138", culture:"Latin", subculture:"Spanish", first:"No hay mal", second:"que por bien no venga." },
+  { id:"b139", culture:"Latin", subculture:"Spanish", first:"Más vale solo", second:"que mal acompañado." },
+  { id:"b140", culture:"Latin", subculture:"Spanish", first:"Al mal tiempo", second:"buena cara." },
+
+  // ---------------------------
+  // CHINESE • CLASSIC (5)
+  // ---------------------------
+  { id:"b141", culture:"Chinese", subculture:"Classic", first:"A journey of a thousand miles", second:"begins with a single step." },
+  { id:"b142", culture:"Chinese", subculture:"Classic", first:"Fall seven times", second:"stand up eight." },
+  { id:"b143", culture:"Chinese", subculture:"Classic", first:"Better to light a candle", second:"than curse the darkness." },
+  { id:"b144", culture:"Chinese", subculture:"Classic", first:"The best time to plant a tree", second:"was 20 years ago; the second best is now." },
+  { id:"b145", culture:"Chinese", subculture:"Classic", first:"When the winds of change blow", second:"some build walls, others build windmills." },
+
+  // ---------------------------
+  // CARIBBEAN • JAMAICAN/PATOIS (5)
+  // ---------------------------
+  { id:"b146", culture:"Caribbean", subculture:"Jamaican / Patois", first:"Every mickle", second:"mek a muckle." },
+  { id:"b147", culture:"Caribbean", subculture:"Jamaican / Patois", first:"One one coco", second:"full basket." },
+  { id:"b148", culture:"Caribbean", subculture:"Jamaican / Patois", first:"Trouble nuh set like rain", second:"it start like drizzle." },
+  { id:"b149", culture:"Caribbean", subculture:"Jamaican / Patois", first:"Time longer", second:"than rope." },
+  { id:"b150", culture:"Caribbean", subculture:"Jamaican / Patois", first:"If you want good", second:"you have to do good." }