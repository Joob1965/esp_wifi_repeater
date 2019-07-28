# esp_wifi_repeater
Ein voll funktionsfähiger WLAN-Repeater (richtig: ein WLAN-NAT-Router)

Dies ist die Implementierung eines WiFi-NAT-Routers auf dem esp8266 und esp8285. Es enthält auch Unterstützung für eine Paketfilter-Firewall mit ACLs, Port-Mapping, Traffic-Shaping, Hooks für Remote-Überwachung (oder Paket-Sniffing), MQTT-Verwaltungsschnittstelle und Energieverwaltung. Automesh wurde aufgenommen https://github.com/martin-ger/esp_wifi_repeater#automesh-mode .

Typische Nutzungsszenarien sind:
- Einfacher Range Extender für ein vorhandenes WiFi-Netzwerk
- Batteriebetriebene Außennetze (Mesh-Netze)
- Einrichten eines zusätzlichen WiFi-Netzwerks mit unterschiedlichen SSIDs / Passwörtern für Gäste
- Einrichten eines sicheren und eingeschränkten Netzwerks für IoT-Geräte
- Überwachen Sie die Sonde für die WiFi-Verkehrsanalyse
- Netzexperimente mit Routen, ACLs und Traffic Shaping

Standardmäßig fungiert der ESP als STA und als Soft-AP und leitet den IP-Verkehr transparent weiter. Da NAT verwendet wird, sind weder auf der Netzwerkseite noch auf den angeschlossenen Stationen Routing-Einträge erforderlich. Stationen werden standardmäßig über DHCP im Netzwerk 192.168.4.0/24 konfiguriert und erhalten ihre DNS-Antwortadresse vom vorhandenen WLAN-Netzwerk.

Messungen zeigen, dass es ungefähr 5 Mbit / s in beide Richtungen erreichen kann, so dass sogar Streaming möglich ist.

Einige Details werden in diesem Video erklärt: https://www.youtube.com/watch?v=OM2FqnMFCLw

### Hinweis zu WPA2 Enterprise (PEAP)
Wenn Sie einen "Konverter" benötigen, der ein WPA2-Unternehmensnetzwerk mit PEAP-Authentifizierung in ein WPA2-PSK-Netzwerk übersetzt, besuchen Sie https://github.com/martin-ger/esp_peap_psk. Ich habe versucht, diese Funktionalität in dieses Projekt zu integrieren. Dies ist jedoch schwierig, da WPA2 Enterprise bei der Authentifizierung so viel freien Heap benötigt, dass für nichts anderes mehr Speicherplatz vorhanden ist. Also habe ich beschlossen, das in einem separaten Projekt zu belassen.

# Erstes Booten
Der esp_wifi_repeater startet mit der folgenden Standardkonfiguration:

- ap_ssid: MyAP, ap_password: none, ap_on: 1, ap_open: 1
- Netzwerk: 192.168.4.0/24

Nach dem ersten Booten (oder Zurücksetzen auf die Werkseinstellungen) wird ein WiFi-Netzwerk mit einem offenen AP und der ssid "MyAP" angeboten. Es wird noch nicht versucht, die Verbindung zu einem Uplink-AP automatisch wiederherzustellen (da es keine gültige SSID oder kein gültiges Kennwort kennt).

Stellen Sie eine Verbindung zu diesem WiFi-Netzwerk her und nehmen Sie die Grundkonfiguration entweder über ein einfaches Webinterface oder die vollständige Konfiguration mit allen Optionen über die Konsole vor.

# Grundlegende Webkonfigurationsoberfläche
Das Webinterface ermöglicht die Konfiguration aller Parameter, die für die grundlegende Weiterleitungsfunktionalität erforderlich sind. Vielen Dank an rubfi für die umfangreiche Arbeit daran: https://github.com/rubfi/esp_wifi_repeater/. Zeigen Sie mit Ihrem Browser auf "http://192.168.4.1". Diese Seite sollte erscheinen:

<img src = "https://raw.githubusercontent.com/martin-ger/esp_wifi_repeater/master/WebConfig.jpg">

Geben Sie zuerst die entsprechenden Werte für das Uplink-WLAN-Netzwerk ein, die "STA-Einstellungen". Verwenden Sie für offene Netzwerke das Passwort "none". Aktivieren Sie das Kontrollkästchen "Automesh", wenn Sie den Automesh-Modus wirklich verwenden möchten. Klicken Sie auf "Verbinden". Der ESP startet neu und stellt eine Verbindung zu Ihrem WLAN-Router her. Die Status-LED sollte nach einigen Sekunden blinken.

Wenn Sie automesh ausgewählt haben, ist die Konfiguration abgeschlossen. Das Konfigurieren der "Soft AP-Einstellungen" ist nicht erforderlich, da diese Einstellungen im Automesh-Modus mit den "STA-Einstellungen" identisch sind. Die gleiche SSID wird von allen angeschlossenen ESP-Repeatern angeboten.

Wenn Sie nicht automesh verwenden, können Sie jetzt die Seite neu laden und die "Soft AP-Einstellungen" ändern. Klicken Sie auf "Einstellen" und der ESP startet erneut neu. Jetzt kann der Datenverkehr über den neu konfigurierten Soft AP weitergeleitet werden. Beachten Sie, dass sich diese Änderungen auch auf die Konfigurationsschnittstelle auswirken. Wenn Sie weitere Konfigurationsschritte ausführen möchten, stellen Sie über eines der neu konfigurierten WLAN-Netzwerke eine Verbindung zum ESP her. Für den Zugriff über den Soft-AP muss die Adresse des Soft-AP-Netzwerks gespeichert werden, wenn Sie diese geändert haben (der ESP hat in diesem Netzwerk immer die Adresse x.x.x.1).

Wenn Sie möchten, können Sie das Kontrollkästchen "Sperren" markieren und auf "Sperren" klicken. Jetzt kann die Konfiguration nicht mehr geändert werden, ohne sie zuvor mit dem Kennwort des Uplink-WLAN-Netzwerks zu entsperren (definieren Sie eines, auch wenn das Netzwerk geöffnet ist).

Wenn Sie Nicht-ASCII- oder Sonderzeichen in die Weboberfläche eingeben möchten, müssen Sie eine Hex-Codierung im HTTP-Stil wie "My% 20AccessPoint" verwenden. Dies führt zu einer Zeichenfolge "My AccessPoint". Mit dieser Hex-Codierung können Sie einen beliebigen Byte-Wert eingeben, mit Ausnahme von 0 (aus C-internen Gründen).

Wenn Sie einen Fehler gemacht haben und den Kontakt mit dem ESP verloren haben, können Sie ihn weiterhin über die serielle Konsole wiederherstellen ("Zurücksetzen des Geräts", siehe unten).

# Befehlszeilenschnittstelle
Die erweiterte Konfiguration muss über die Befehlszeile auf der Konsolenoberfläche erfolgen. Diese Konsole ist entweder über den seriellen Port mit 115200 Baud oder über den TCP-Port 7777 (z. B. "telnet 192.168.4.1 7777" von einer angeschlossenen STA) verfügbar.

Verwenden Sie die folgenden Befehle für eine Erstkonfiguration:
- ssid your_home_router's_SSID setzen
- Setzen Sie das Passwort für Ihr_Home_Router-Passwort
- setze ap_ssid ESP's_ssid
- ap_password setzen ESP's_password
- show (um die Parameter zu überprüfen)
- sparen
- zurücksetzen

Wenn Sie Nicht-ASCII- oder Sonderzeichen eingeben möchten, können Sie die Hex-Codierung im HTTP-Stil (z. B. "My% 20AccessPoint") oder nur auf der CLI als Verknüpfung mit Anführungszeichen im C-Stil (z. B. "My \ AccessPoint") verwenden "). Beide Methoden führen zu einer Zeichenfolge "My AccessPoint".

Die Kommandozeile versteht viel mehr Befehle:

## Grundlegende Befehle
Genug, um es in fast allen Umgebungen zum Laufen zu bringen.
- help: Gibt eine kurze Hilfemeldung aus
- set [ssid | password] _value_: Ändert die Einstellungen für den Uplink-AP (WiFi-Konfiguration Ihres Home-Routers) und verwendet das Passwort "none" für offene Netzwerke.
- set [ap_ssid | ap_password] _value_: Ändert die Einstellungen für den Soft-AP des ESP (für Ihre Stationen)
- show [config | stats]: Druckt die aktuelle Konfiguration oder einige Statusinformationen und Statistiken
- save [dhcp]: Speichert die aktuellen Konfigurationsparameter, ACLs und Routing-Einträge [+ die aktuellen DHCP-Leases] zum Flashen
- lock [_password_]: speichert und sperrt die aktuelle Konfiguration, Änderungen sind nicht erlaubt. Das Passwort kann offen gelassen werden, wenn es bereits zuvor festgelegt wurde (Standard ist das Passwort des Uplink-WLANs).
- unlock _password_: Entsperrt die Konfiguration, erfordert ein Passwort vom Befehl lock
- reset [factory]: Setzt das esp zurück, 'factory' setzt optional WiFi-Parameter auf die Standardwerte zurück (funktioniert auf einem gesperrten Gerät nur über die serielle Konsole)
- quit: Beendet eine Remote-Sitzung

## Erweiterte Befehle
Die meisten set-Befehle sind erst nach dem Speichern und Zurücksetzen wirksam.
### Automesh Config
- set automesh [0 | 1]: Legt fest, ob der Automesh-Modus aktiviert oder deaktiviert ist (Standardeinstellung). Weitere Informationen finden Sie unter https://github.com/martin-ger/esp_wifi_repeater#automesh-mode
- set am_threshold _dB_: Legt den Schwellenwert für eine "schlechte" Verbindung fest (in negativen dB, Standard 85, d. h. -85 dB)
- set am_scan_time _secs_: Legt das Zeitintervall in Sekunden fest, in dem der ESP im Automesh-Modus versucht, einen Uplink-AP zu finden, bevor er in den Ruhezustand wechselt (0 deaktiviert, Standard).
- set am_sleep_time _secs_: Legt das Zeitintervall in Sekunden fest, in dem der ESP im Automesh-Modus schläft, wenn kein Uplink-AP gefunden wird (0 deaktiviert, Standard)

### WiFi Konfig
- set ap_on [0 | 1]: Legt fest, ob der Soft-AP deaktiviert (ap_on = 0) oder aktiviert (ap_on = 1, Standard) ist.
- set ap_open [0 | 1]: Auswahl, ob der Soft-AP WPA2-PSK-Sicherheit verwendet (ap_open = 0, automatisch, wenn ein ap_password gesetzt ist) oder offen (ap_open = 1)
- set auto_connect [0 | 1]: Legt fest, ob die STA erneut versuchen soll, eine Verbindung zum AP herzustellen. auto_connect ist nach erstmaligem Blinken oder nach "reset factory" aus (0). Wenn Sie eine neue SSID eingeben, wird diese automatisch auf (1) gesetzt.
- set ssid_hidden [0 | 1]: Auswahl, ob die SSID des Soft-AP versteckt (ssid_hidden = 1) oder sichtbar (ssid_hidden = 0, Standard) ist
- set phy_mode [1 | 2 | 3]: setzt den PHY_MODE des WiFi (1 = b, 2 = g, 3 = n (Standard))
- set bssid _xx: xx: xx: xx: xx: xx_: legt die spezifische BSSID des Uplink-APs fest, zu dem eine Verbindung hergestellt werden soll (Standardeinstellung 00: 00: 00: 00: 00: 00: 00, was any bedeutet)
- set [ap_mac | sta_mac] _xx: xx: xx: xx: xx: xx_: setzt die MAC-Adresse der STA und SOFTAP auf einen benutzerdefinierten Wert (Bit 0 des ersten Bytes der MAC-Adresse kann nicht 1 sein)
- set sta_mac random: Setzt nach jedem Neustart einen neuen zufälligen STA-MAC
- set sta_hostname _name_: Legt den Namen der STA fest (sichtbar für den Uplink-AP)
- set max_clients [1-8]: Legt die Anzahl der STAs fest, die eine Verbindung zum SoftAP herstellen können (das Limit der SoftAP-Implementierung des ESP ist 8, Standard)
- scan: Sucht nach APs
- connect: versucht eine Verbindung zu einem AP mit der aktuell konfigurierten _ssid_ und dem _password_ herzustellen
- disconnect: Trennt die Verbindung zu einem Uplink-AP


### TCP / IP Konfig
- ping _ip-addr_: Überprüft die IP-Konnektivität mit der ICMP-Echoanforderung / -antwort
- set network _ip-addr_: Legt die IP-Adresse des internen Netzwerks fest, Netzwerk ist immer / 24, Router ist immer x.x.x.1
- set dns _dns-addr_: Legt eine statische DNS-Adresse fest, die über DHCP an die Clients verteilt wird
- set dns dhcp: Konfiguriert die Verwendung der dynamischen DNS-Adresse von DHCP (Standardeinstellung)
- set ip _ip-addr_: Legt eine statische IP-Adresse für die STA-Schnittstelle fest
- set ip dhcp: Konfiguriert standardmäßig die dynamische IP-Adresse für die STA-Schnittstelle
- set netmask _netmask_: Legt eine statische Netzmaske für die STA-Schnittstelle fest
- set gw _gw-addr_: Legt eine statische Gateway-Adresse für die STA-Schnittstelle fest
- show dhcp: Gibt den aktuellen Status der DHCP-Lease-Tabelle aus


### Routing
- Route anzeigen: Zeigt die aktuelle Routing-Tabelle an
- route clear: Löscht alle statischen Routen
- route add _network_ _gw_: Fügt über das Gateway gw eine statische Route zu einem Netzwerk hinzu (Netzwerk mit CIDR-Notation ('x.x.x.x / n')
- route delete _network_: Entfernt eine statische Route zu einem Netzwerk
- interface _inX_ [up | down]: Setzt den Schnittstellenstatus auf oder ab (kein IP-Routing / Datenverkehr über heruntergefahrene Schnittstellen, Standard: auf)
- set nat [0 | 1]: Legt fest, ob die Soft-AP-Schnittstelle NAT-fähig ist (nat = 1, Standardeinstellung) oder nicht (nat = 0). Ohne NAT funktioniert die transparente Weiterleitung des Datenverkehrs von den internen STAs nicht! Nützlich hauptsächlich in Kombination mit statischem Routing.
- portmap add [TCP | UDP] _external_port_ _internal_ip_ _internal_port_: Fügt eine Portweiterleitung hinzu
- portmap remove [TCP | UDP] _external_port_: löscht eine Portweiterleitung

### Firewall / Monitor Konfig
- acl [from_sta | to_sta] [TCP | UDP | IP] _src-ip_ [_src_port_] _desr-ip_ [_dest_port_] [allow | deny | allow_monitor | deny_monitor]: Fügt der ACL eine neue Regel hinzu
- acl [from_sta | to_sta] clear: Löscht die gesamte ACL
- show acl: Zeigt die definierten ACLs und einige Statistiken an
- set acl_debug [0 | 1]: Schaltet die ACL-Debug-Ausgabe ein / aus. - Verweigerte Pakete werden im Terminal protokolliert
- set [upstream_kbps | downstream_kbps] _bitrate_: Legt eine maximale Upstream / Downstream-Bitrate fest (0 = kein Limit, Standard)
- set daily_limit _limit_in_KB_: definiert eine max. Anzahl der Kilobyte, die von STAs pro Tag übertragen werden können (0 = keine Begrenzung, Standard)
- set timezone _hours_offset_: definiert die lokale Zeitzone (erforderlich, um zu wissen, wann ein Tag um 00:00 Uhr vorbei ist)
- monitor [on | off | acl] _port_: Startet und stoppt den Überwachungsserver an einem bestimmten Port

### User Interface Config
- set config_port _portno_: Legt die Portnummer für die Konsolenanmeldung fest (Standard ist 7777, 0 deaktiviert die Remote-Konsolenkonfiguration).
- set web_port _portno_: Legt die Portnummer des Webkonfigurationsservers fest (Standard ist 80, 0 deaktiviert die Webkonfiguration)
- set config_access _mode_: Steuert die Netzwerke, die den Konfigurationszugriff für Konsole und Web erlauben (0: kein Zugriff, 1: nur intern, 2: nur extern, 3: beide (Standard))

### Chip Konfig
- set speed [80 | 160]: Legt die CPU-Taktfrequenz fest (Standard 80 Mhz)
- sleep _seconds_: Versetzt das ESP für die angegebene Anzahl von Sekunden in den Tiefschlaf. Gültige Werte zwischen 1 und 4294 (ca. 71 Minuten)
- set status_led _GPIOno_: wählt einen GPIO-Pin für die Status-LED aus (Standard 2,> 16 deaktiviert)
- set hw_reset _GPIOno_: wählt einen GPIO-Pin für einen Hardware-Werksreset aus (Standard 4,> 16 deaktiviert)
- set ap_watchdog _secs_: Legt das Timeout für den AP-Watchdog fest. - Wenn vom Uplink-AP keine Pakete für _secs_ empfangen wurden, wird der Repeater zurückgesetzt ("none" = kein Timeout, Standard).
- set client_watchdog _secs_: Legt das Zeitlimit für den Client-Watchdog fest. - Wenn von keinem verbundenen Client Pakete für _secs_ empfangen werden, wird der Repeater zurückgesetzt ("none" = kein Zeitlimit, Standard).
- set vmin _voltage_: Stellt die minimale Batteriespannung in mV ein. Wenn der Vdd-Wert sinkt, geht das ESP in den Tiefschlaf. Wenn 0, passiert nichts
- set vmin_sleep _secs_: Legt das Zeitintervall in Sekunden fest, in dem das ESP bei niedriger Spannung schläft

# Status-LED
In der Standardkonfiguration ist GPIO2 so konfiguriert, dass eine Status-LED (mit GND verbunden) mit den folgenden Anzeigen angesteuert wird:
- permanent an: gestartet, aber nicht erfolgreich mit dem AP verbunden (keine gültige externe IP)
- blinkend (1 pro Sekunde): funktioniert, ist mit dem AP verbunden
- unregelmäßig blinkend: funktioniert, Datenverkehr im internen Netzwerk

Mit "set status_led GPIOno" kann der GPIO-Pin geändert werden (jeder Wert> 16, z. B. "set status_led 255", deaktiviert die Status-LED vollständig). Bei der Konfiguration mit GPIO1 funktioniert dies mit der eingebauten blauen LED auf den ESP-01-Karten. Da GPIO1 jedoch auch der UART-TX-Pin ist, bedeutet dies, dass die serielle Konsole nicht funktioniert. Die Konfiguration ist dann auf den Netzwerkzugriff beschränkt.

# HW Werksreset
Wenn Sie GPIO 4 länger als 3 Sekunden auf niedrig stellen, wird der Repeater auf die Werkseinstellungen zurückgesetzt und mit der Standardkonfiguration neu gestartet. Mit "set hw_reset GPIOno" kann der GPIO-Pin geändert werden (jeder Wert> 16, z. B. "set hw_reset 255", deaktiviert die Funktion zum Zurücksetzen auf die Werkseinstellungen).

Für viele Module, inkl. ESP-01s und NodeMCUs, wahrscheinlich ist es eine gute Idee, GPIO 0 dafür zu verwenden, da es sowieso verwendet wird. Dies ist jedoch nicht der Standard-Pin, da er das Herunterziehen während des Blinkens beeinträchtigen kann. Wenn Sie also einen vorhandenen Druckknopf auf GPIO 0 für den HW-Werksreset verwenden möchten, konfigurieren Sie ihn mit "set hw_reset 0" und "save" nach dem Flashen. Ein durch den HW-Pin ausgelöster Werksreset setzt die konfigurierte hw_reset-GPIO-Nummer NICHT zurück ("Werksreset" über die Konsole reicht aus).

# Port-Mapping
Damit Clients aus dem externen Netzwerk eine Verbindung zum Serverport im internen Netzwerk herstellen können, müssen Ports zugeordnet werden. Ein externer Port wird einem internen Port einer bestimmten internen IP-Adresse zugeordnet. Verwenden Sie dazu den Befehl "portmap add". Portzuordnungen können mit dem Befehl "show" aufgelistet und mit der aktuellen Konfiguration gespeichert werden.

Um jedoch sicherzustellen, dass das erwartete Gerät eine bestimmte IP-Adresse abhört, muss sichergestellt werden, dass dieses Gerät nach dem Neustart oder dem Neustart des ESP die gleiche IP-Adresse hat. Dazu können entweder feste IP-Adressen in den Geräten konfiguriert werden oder der ESP muss sich an seine DHCP-Leases erinnern. Dies kann mit dem Befehl "save dhcp" erreicht werden. Der aktuelle Status und alle DHCP-Leases werden gespeichert, sodass sie nach dem Neustart wiederhergestellt werden. DHCP-Leases können mit dem Befehl "show stats" aufgelistet werden.

# Automesh-Modus
Manchmal möchten Sie möglicherweise mehrere esp_wifi_repeater in einer Reihe oder einem Netz verwenden, um eine größere Entfernung oder Fläche abzudecken. In der Regel kann dies mit NAT-Routern problemlos durchgeführt werden. Tatsächlich verfügen Sie über mehrere NAT-Ebenen. Dies bedeutet jedoch, dass die Konnektivität begrenzt ist: Alle Knoten können mit dem Internet kommunizieren, aber im Allgemeinen gibt es keine direkte IP-Konnektivität zwischen den Knoten. Und natürlich sinkt die verfügbare Bandbreite, je mehr Sprünge Sie benötigen. Aber Benutzer haben berichtet, dass sogar 5 esp_wifi_repeaters in einer Reihe ziemlich gut funktionieren.

In einem solchen Setup ist die Konfiguration ziemlich zeitaufwendig und fehleranfällig. Um dies zu vereinfachen, hat der esp_wifi_repeater jetzt einen neuen Modus: "Automesh". Konfigurieren Sie einfach die SSID und das Passwort und schalten Sie "automesh" ein. (entweder auf der CLI mit "set automesh 1" oder auf der Weboberfläche mit nur einem Häkchen). Dadurch wird Folgendes ausgeführt:

Jeder so konfigurierte esp_wifi_repeater bietet automatisch ein WiFi-Netzwerk auf dem AP mit derselben SSID / demselben Passwort an, mit dem er verbunden ist. Clients können dieselben oder wiederholte WLAN-Einstellungen für das ursprüngliche Netzwerk verwenden. Jeder mit "automesh" konfigurierte esp_wifi_repeater sucht zuerst nach dem besten anderen AP, zu dem eine Verbindung hergestellt werden kann. Dies ist diejenige, die dem ursprünglichen WiFi-Netzwerk am nächsten kommt und die beste Signalstärke (RSSI) aufweist.

Die Signalstärke lässt sich leicht mit einem Scan messen. Welches ist jedoch das dem ursprünglichen WiFi-Netzwerk am nächsten liegende, wenn Sie mehrere APs mit derselben SSID sehen? Daher verwendet das Protokoll einen etwas schmutzigen Trick: Die esp_wifi_repeaters im "automesh" -Modus manipulieren ihre BSSID (tatsächlich ist dies nach dem IEEE 802.11-Standard die "ESSID", da es sich um einen AP handelt, aber das SDK nennt es "BSSID"). dh die MAC-Adresse ihrer AP-Schnittstelle, die mit jedem Beacon-Frame 10 etwa Mal pro Sekunde ausgesendet wird. Es verwendet das Format: 24: 24: mm: rr: rr: rr. "24:24" ist nur die eindeutige Kennung eines Repeaters (es besteht eine minimale Wahrscheinlichkeit, dass dieser mit dem MAC des realen AP kollidiert, dies können wir jedoch vernachlässigen, da wir dieses Präfix bei Bedarf ändern können). "mm" bedeutet die "Maschenweite", dies ist die Entfernung in Hops zum ursprünglichen WiFi-Netzwerk. Die letzten drei "rr: rr: rr" sind nur Zufallszahlen zur Unterscheidung der verschiedenen ESPs. Der ursprüngliche AP behält seine BSSID bei, d. H. Diejenige ohne das Präfix "24:24" wird als Root erkannt und als Mesh Level 0 bezeichnet.

<img src = "https://raw.githubusercontent.com/martin-ger/esp_wifi_repeater/master/AutoMesh.JPG">

Jetzt kann jeder esp_wifi_repeater erfahren, welcher andere esp_wifi_repeater dem ursprünglichen WiFi-Netzwerk am nächsten ist, sich mit diesem verbinden und seine eigene BSSID entsprechend auswählen. Auch die IP-Adresse des internen Netzwerks wird an die Mesh-Ebene angepasst: 10.24.m.0. Auf diese Weise wird ein Baum (ein ganz besonderes Netz) mit dem ursprünglichen WiFi-AP als Stamm- und Wiederholungsknoten auf mehreren Netzebenen erstellt (tatsächlich funktioniert dies ähnlich wie das Spanning Tree Protocol (STP) auf der Verbindungsschicht oder das Routing auf der Netzwerkschicht mithilfe von ein Distanzvektor-Protokoll). Sobald ein Uplink-Verbindungsverlust erkannt wird, wird die Konfiguration neu gestartet. Dies sollte Schleifen vermeiden, da bei der (Neu-) Konfiguration auch keine Beacons mit einer BSSID gesendet werden.

Der Einfachheit halber versucht der esp_wifi_repeater nach der "automesh" -Konfiguration zunächst zu überprüfen, ob er eine Verbindung zu einem Uplink-AP herstellen kann. Wenn dies fehlschlägt, wird davon ausgegangen, dass der Benutzer einen Fehler mit dem Kennwort begangen und auf die werkseitigen Standardeinstellungen zurückgesetzt hat, auch wenn ein AP mit der richtigen SSID gefunden wurde. Nachdem die Verbindung einmal erfolgreich hergestellt wurde, wird davon ausgegangen, dass die Konfiguration korrekt ist, und es wird nach einem Verbindungsverlust oder einem Zurücksetzen so lange versucht, wie dies erforderlich ist (um einen DOS-Angriff mit einem falsch konfigurierten AP zu vermeiden).

## Automesh einstellen
Wenn mehr als ein ESP in Reichweite ist, kann es zu einem Kompromiss zwischen einem kürzeren "schlechten" Pfad und einem längeren "guten" Pfad kommen (gut und schlecht in Bezug auf die Verbindungsqualität). Der Parameter _am_threshold_ bestimmt, was eine fehlerhafte Verbindung ist: Wenn der RSSI-Wert in einem Scan unter diesem Schwellenwert liegt, ist eine Verbindung fehlerhaft und der Pfad mit einem weiteren Hop wird bevorzugt. Das heißt gegeben _am_threshold_ ist 85 und es werden zwei Automesh-Knoten im Scan erkannt: A mit Level 1 und RSSI -88 dB und B mit Level 2 und RSSI -60 dB, dann wird eine Verbindung zu A als zu schlecht angesehen (-88 dB < -am_threshold_) und B ist bevorzugt. Der neue Knoten wird zu einem Knoten der Ebene 3 mit Aufwärtsverbindung über B. _am_threshold_ wird als positiver Wert angegeben, bedeutet jedoch ein negatives dB. Ein kleinerer Wert ist besser.

Wenn Sie einen besseren Einblick in die Topologie eines Automesh-Netzwerks erhalten möchten, sollten Sie in Betracht ziehen, alle Knoten mit einem MQTT-Broker zu verbinden und sie das Thema "Topologie" veröffentlichen zu lassen (siehe unten). Wenn Sie jetzt "/ WiFi / + / system / Topology" abonnieren, erhalten Sie alle Knoten- und Link-Informationen, einschließlich der RSSI (der verbundenen ESPs), die Sie benötigen, um den gesamten Graphen zu rekonstruieren und schwache Links im Mesh zu erkennen. Das Thema TopologyInfo enthält die folgende JSON-Struktur, mit der ein vollständiges Diagramm eines Automesh-Netzwerks wiederhergestellt werden kann:
```
{
"nodeinfo" {
	"id":"ESP_07e37e",
	"ap_mac":"24:24:01:72:c7:f9",
	"sta_mac":"60:01:bc:07:e3:7e",
	"uplink_bssid":"00:1a:54:93:23:0a",
	"ap_ip":"10.24.1.1",
	"sta_ip":"192.168.178.33",
	"rssi":"-66",
	"mesh_level":"1",
	"no_stas":"2"
},
"stas":[
	{"mac":"5c:cf:45:11:7f:13","ip":"10.24.1.2"},
	{"mac":"00:14:22:76:99:c5","ip":"10.24.1.3"}
]
}
```

Die Verwendung der beiden Parameter _am_scan_time_ und _am_sleep_time_ power management kann im Automesh-Modus implementiert werden, wenn Sie GPIO16 mit RST verbunden haben. Nach dem Booten sucht der esp_wifi_repeater _am_scan_time_ Sekunden lang nach verfügbaren Uplink-APs. Wird keine gefunden, wird für _am_sleep_time_ Sekunden in den Tiefschlaf gewechselt und nach dem Neustart erneut versucht (Standard ist 0 = für beide Parameter deaktiviert).

# Überwachung
Über die Konsole kann ein Monitorservice gestartet werden ("monitor on [portno]"). Dieser Dienst spiegelt den Datenverkehr des internen Netzwerks im pcap-Format in einen TCP-Stream. Z.B. Mit einem "netcat [external_ip_of_the_repeater] [portno] | sudo wireshark -k -S -i -" von einem Computer im externen Netzwerk können Sie jetzt den Verkehr im internen Netzwerk in Echtzeit beobachten. Verwenden Sie dies z.B. um zu beobachten, mit welchen Internetseiten Ihre internen Kunden kommunizieren. Beachten Sie, dass dies die Belastung des esp und des WiFi-Netzwerks mindestens verdoppelt. Unter hoher Last kann dies dazu führen, dass einige Pakete in der Monitorsitzung gekürzt oder gar verworfen werden. VORSICHT: Wenn Sie diesen Port offen lassen, besteht möglicherweise ein Sicherheitsproblem. Jeder aus den lokalen Netzwerken kann eine Verbindung herstellen und Ihren Datenverkehr beobachten.

# Firewall
Der ESP-Router verfügt über eine integrierte Basis-Firewall. ACLs (Access Control Lists) können auf die SoftAP-Oberfläche angewendet werden. Dies ist ein Eckpfeiler der IoT-Sicherheit, wenn der Router verwendet wird, um andere IoT-Geräte ins Internet zu bringen. Es kann verwendet werden, um z.B. IoT-Geräte von Drittanbietern können nicht "zu Hause anrufen", als Malware-Bots missbraucht werden und Ihr Heimnetzwerk mit PCs, Tablets und Telefonen vor der Sichtbarkeit für Heimautomationsgeräte schützen.

Die vier ACL-Listen heißen "from_sta", "to_sta", "from_ap" und "to_ap" für eingehende und ausgehende Pakete an beiden Schnittstellen ("sta" bezeichnet die Schnittstellen zu den verbundenen Clients, "ap" die Schnittstelle zum Uplink-AP ). ACLs werden im "CISCO IOS-Stil" definiert. Das folgende Beispiel ermöglicht ausgehende lokale Broadcasts (für DHCP), UDP 53 (DNS) und TCP 1883 (MQTT) an einen lokalen Broker. Alle anderen Pakete werden blockiert:
- acl from_sta clear
- acl from_sta IP jede 255.255.255.255 zulassen
- acl from_sta UDP any any any 53 erlauben
- acl from_sta TCP any any 192.168.0.0/16 1883 allow
- acl from_sta IP any any deny

Es können auch ACLs für die Richtung "to_sta" definiert werden, dies ist jedoch normalerweise nicht erforderlich, da die umgekehrte Richtung durch die NAT-Übertragung sehr gut vor unerwünschtem Datenverkehr geschützt ist.

ACLs bestehen aus Filterregeln, die für jedes Paket verarbeitet werden. Jede Regel besteht aus einem Protokoll (IP, TCP oder UDP), einer Quelladresse / einem Quellport, einer Zieladresse / einem Zielport sowie einer Aktion "Zulassen" oder "Verweigern". Bei normaler IP ohne Ports werden nur Adressen angegeben. IP-Regeln umfassen TCP- und UDP-Pakete. Adressen können als Subnetzadressen in der "/" -Notation angegeben werden, z. 192.168.178.0/24. Auch "any" kann als Platzhalter verwendet werden, er stimmt mit jeder Adresse oder Portnummer überein. Eine Regel wird durch den Befehl "acl" definiert:

- acl [von_sta | nach_sta | von_ap | nach_ap] [TCP | UDP | IP] _src-ip_ [_src_port_] _desr-ip_ [_dest_port_] [allow | deny | allow_monitor | deny_monitor]

Die Regeln werden von oben nach unten in der Reihenfolge ihres Auftretens in der Liste verarbeitet. Die erste Regel, die mit einem Paket übereinstimmt, wird angewendet und bestimmt, ob ein Paket zugelassen (und weitergeleitet) oder abgelehnt (und verworfen) wird. Das heißt, Sonderfälle zuerst, allgemeine Regeln am Ende. Wenn eine ACL Regeln enthält, werden alle Pakete, die keiner Regel entsprechen, standardmäßig abgelehnt. Daher wird die letzte Regel "from_sta IP any any deny" im obigen Beispiel nicht wirklich benötigt, da dies sowieso die Standardregel ist. Wenn eine ACL leer ist, sind alle Pakete zulässig.

Die Definition von ACL-Regeln funktioniert auch von oben nach unten: Eine neue Regel wird immer am Ende einer Liste hinzugefügt. Um eine ACL zu ändern, müssen Sie sie zuerst vollständig löschen (acl from_sta clear) und dann neu erstellen. ACLs werden mit der Konfiguration gespeichert. "show acl" druckt die ACLs plus Statistiken über die Anzahl der Treffer für jede Regel und die Gesamtanzahl der zulässigen und abgelehnten Pakete aus.

Mit dem Befehl "set acl_debug 1" wird eine Zusammenfassung aller abgelehnten Pakete an die Konsole ausgegeben. Ein MQTT-Thema kann diese Zusammenfassung auch veröffentlichen. Dies kann für die Firewall-Konfiguration verwendet werden, um zu bestimmen, welche Regeln erforderlich sind, damit die angeschlossenen Geräte funktionieren. Es gibt auch einen Hinweis, wenn unerwarteter Datenverkehr auftritt (und verweigert wird).

Für eine eingehendere Analyse kann der Überwachungsdienst verwendet werden (selbst abgelehnte Pakete werden dem Monitor gemeldet, bevor sie verworfen werden). Wenn der Monitor mit dem Befehl "monitor acl _port_" gestartet wird, können ACLs als Online-Filter verwendet werden. Alle Regeln, die als definiert sind
"allow_monitor" anstelle von "allow" und "deny_monitor" anstelle von "deny" werden wie gewohnt verarbeitet, was dazu führt, dass ein Paket weitergeleitet werden kann, aber sie senden das Paket auch an den Monitor. Somit ist eine Liste von Regeln, die grundsätzlich alle Pakete "erlauben" oder "erlauben_überwachen", immer noch sinnvoll, da damit bereits während der catpure-Zeit ausgewählt werden kann, welches Paket aufgezeichnet werden soll. Z.B. eine Liste:

- acl from_sta clear
- acl from_sta IP 192.168.0.0/16 any allow_monitor
- acl from_sta IP any any allow

- acl to_sta clear
- acl to_sta IP any 192.168.0.0/16 allow_monitor
- acl to_sta IP any any allow

erlaubt alle Pakete und wählt auch alle Pakete für die Überwachung aus, die von einer Station zum 192.168.0.0/16 (lokalen) Subnetz und vom 192.168.0.0/16 zu einer Station gehen. Natürlich kann ein solcher Filter auch nach der Erfassung auf eine vollständige Überwachungsspur angewendet werden. Wenn Sie jedoch bereits wissen, wonach Sie suchen, können Sie mit diesen Online-Filtern den Überwachungsaufwand drastisch reduzieren. Es kann auch zum Debuggen aller Ablehnungs-Firewall-Regeln verwendet werden, indem einfach "deny_monitor" anstelle von "deny" verwendet wird.

# Statische Routen
Standardmäßig ist die AP-Schnittstelle NAT-fähig, sodass jeder mit dem AP verbundene Knoten über die STA-Schnittstelle des ESP transparent auf die Außenwelt zugreifen kann. Wenn Sie kein echter Netzwerk-Nerd sind, ist keine weitere Aktion erforderlich.

Für diejenigen unter Ihnen, die sich wirklich für weitere Netzwerkkonfigurationen interessieren: Der IPv4-Stack von EPS wurde für dieses Projekt um die Unterstützung statischer Routen erweitert: "show route" zeigt die Routing-Tabelle mit allen bekannten Routen an, einschließlich der Links zum verbundenen Netzwerk Schnittstellen (der AP und die STA-Schnittstelle). Das Routing zwischen diesen beiden Schnittstellen funktioniert ohne weitere Konfiguration. Zusätzliche Routen zu anderen Netzwerken können über den Befehl "route add _netword_ _gateway_" festgelegt werden, der von Linux-Boxen oder -Routern bekannt ist. Ein "Speichern" -Befehl schreibt den aktuellen Status der Routing-Tabelle in die Flash-Konfiguration.

Hier ist ein einfaches Beispiel dafür, was mit statischen Routen geschehen kann. Ausgehend vom folgenden Netzwerkaufbau mit zwei ESPs, die über einen zentralen Heimrouter mit den STA-Schnittstellen verbunden sind:
`` `
| 10.0.1.1 AP-ESP1-STA 192.168.1.10 | <-> | Heimrouter | <-> | 192.168.1.20 STA-ESP2-AP 10.0.2.1 |
`` `
Jeder ESP verfügt hinter seinem AP über ein zweites Netzwerk mit unterschiedlichen Netzwerkadressen: 10.0.1.0/24 und 10.0.2.0/24. ESP1 kann an ESP2 an die 192.168.1.20, aber nicht an die 10.0.2.1 pingen, da es nicht weiß, dass es über die 192.168.1.20 erreichbar ist. Dies ändert sich, wenn Sie zwei statische Routen hinzufügen. Auf ESP1:
`` `
route add 10.0.2.0/24 92.168.1.20
`` `
und auf ESP2:
`` `
route add 10.0.1.0/24 92.168.1.10
`` `
Jetzt ist ein "Ping 10.0.2.1" auf ESP1 erfolgreich. Es wird an 192.168.1.20 gesendet und dann von ESP2 beantwortet.

Jetzt verbindet sich in jedem Netzwerk ein zusätzlicher Client (mit den Adressen 10.0.1.2 und 10.0.2.2):
`` `
| STA1 10.0.1.2 | <-> | 10.0.1.1 ESP1 192.168.1.10 | <-> | Heimrouter | <-> | 192.168.1.20 ESP2 10.0.2.1 | <-> | STA2 10.0.2.2 |
`` `
Jetzt kann auch der Client STA2 mit der lokalen Adresse 10.0.1.2 mit 10.0.2.2 an STA2 pingen, da er seine Anfrage zuerst an seinen Standardrouter ESP1 sendet und dieser weiß, dass alle Pakete an eine 10.0.2.0/24-Adresse weitergeleitet werden müssen 192.168.1.20. Dort kann das ESP2 es an STA2 senden. Gleiches gilt für die Antwort in die andere Richtung.

Auf diese Weise können Sie eine Multi-Star-Topologie von ESPs konfigurieren, bei der sich jeder ESP und seine STA-Clients direkt erreichen können (ohne dass Portmaps erforderlich sind). Die Konfiguration der erforderlichen Routen ist vielleicht etwas schmerzhaft - aber eine schöne Übung im Networking. Der nächste Schritt wäre, ein dynamisches Routing-Protokoll wie RIP auf den ESP zu portieren ...

# Bitratenlimits
Indem Sie upstream_kbps und downstream_kbps auf einen Wert von! = 0 setzen (0 ist die Standardeinstellung), können Sie die maximale Bitrate des AP des ESP begrenzen. Dieser Wert ist ein Grenzwert, der für den Datenverkehr aller verbundenen Clients gilt. Pakete, die die definierte Bitrate überschreiten würden, werden verworfen. Der Traffic Shaper verwendet den "Token Bucket" -Algorithmus mit einer Bucket-Größe von derzeit dem Vierfachen der Bitrate pro Sekunde, wobei Bursts berücksichtigt werden, wenn zuvor kein Verkehr stattgefunden hat.

# MQTT-Unterstützung
Seit Version 1.3 verfügt der Router über einen integrierten MQTT-Client (danke an Tuan PM für seine Bibliothek https://github.com/tuanpmt/esp_mqtt). Dies kann dazu beitragen, den Router / Repeater in das IoT zu integrieren. Ein Hausautomationssystem kann z.B. Treffen Sie Entscheidungen auf der Grundlage von Informationen über die aktuell zugeordneten Stationen, können Sie die Repeater einschalten (z. B. auf der Grundlage eines Zeitplans) oder einfach die Last überwachen. Der Router kann entweder mit einem lokalen MQTT-Broker oder einem öffentlich verfügbaren Broker in der Cloud verbunden sein. Derzeit wird jedoch keine TLS-Verschlüsselung unterstützt.

Standardmäßig ist der MQTT-Client deaktiviert. Sie können dies aktivieren, indem Sie den Konfigurationsparameter "mqtt_host" auf einen anderen Hostnamen als "none" setzen. Zum Konfigurieren von MQTT können Sie die folgenden Parameter festlegen:
- set mqtt_host _IP_or_hostname_: IP oder Hostname des MQTT-Brokers ("none" deaktiviert den MQTT-Client)
- set mqtt_port _port_: Port des für die Verbindung verwendeten MQTT-Brokers (Standard: 1883)
- set mqtt_user _username_: Benutzername für die Authentifizierung ("none", wenn beim Broker keine Authentifizierung erforderlich ist)
- set mqtt_user _password_: Passwort zur Authentifizierung
- set mqtt_id _clientId_: ID des Clients beim Broker (Standard: "ESPRouter_xxxxxx" abgeleitet von der MAC-Adresse)
- setze mqtt_prefix _prefix_path_: Präfix für alle veröffentlichten Themen (Standard: "/ WiFi / ESPRouter_xxxxxx / system", wiederum abgeleitet von der MAC-Adresse)
- set mqtt_command_topic _command_topic_: Thema, das zum Empfangen von Befehlen wie von der Konsole abonniert wurde. (Standard: "/ WiFi / ESPRouter_xxxxxx / command", "none" deaktiviert Befehle über MQTT)
- set mqtt_interval _secs_: Legt das Intervall fest, in dem der Router Statusthemen veröffentlicht (Standard: 15s, 0 deaktiviert die Statusveröffentlichung).
- set mqtt_mask _mask_in_hex_: Wählt aus, welche Themen veröffentlicht werden (Standard: "ffff" bedeutet alle)

Die MQTT-Parameter können mit dem Befehl "show mqtt" angezeigt werden.

Der Router kann die folgenden Statusthemen regelmäßig veröffentlichen (jedes mqtt_interval):
- _prefix_path_ / Uptime: Systemverfügbarkeit seit dem letzten Zurücksetzen in s (Maske: 0x0020)
- _prefix_path_ / Vdd: Spannung der Stromversorgung in mV (Maske: 0x0040)
- _prefix_path_ / Bpsin: KByte / s von Stationen in den AP (Maske: 0x0800)
- _prefix_path_ / Bpsout: KBytes / s vom AP zu Stationen (Maske: 0x0800)
- _prefix_path_ / Bpd: KBytes pro Tag von und zu Stationen (Maske: 0x0400)
- _prefix_path_ / Ppsin: Pakete / s von Stationen in den AP (Maske: 0x0200)
- _prefix_path_ / Ppsout: Pakete / s vom AP zu Stationen (Maske: 0x0200)
- _prefix_path_ / Bin: Summe der Bytes von Stationen in den AP (Maske: 0x0100)
- _prefix_path_ / Bout: Summe der Bytes vom AP zu den Stationen (Maske: 0x0100)
- _prefix_path_ / NoStations: Anzahl der momentan mit dem AP verbundenen Stationen (Maske: 0x2000)
- _prefix_path_ / TopologyInfo: JSON-Struktur mit den aktuellen Topologieinformationen des Knotens (Maske: 0x1000)

Zusätzlich kann der Repeater auf Ereignisbasis veröffentlichen:
- _prefix_path_ / join: MAC-Adresse einer Station, die dem AP beitritt (Maske: 0x0008)
- _prefix_path_ / leave: MAC-Adresse einer Station, die den AP verlässt (Maske: 0x0010)
- _prefix_path_ / IP: IP-Adresse des Routers beim Empfang über DHCP (Maske: 0x0002)
- _prefix_path_ / ScanResult: Separates Thema für die Ergebnisse eines "Scan" -Befehls (eine Nachricht pro gefundenem AP) (Maske: 0x0004)
- _prefix_path_ / ACLDeny: Ein Paket wurde von einer ACL-Regel abgelehnt und verworfen (Maske: 0x0080)

Der Router kann unter Verwendung der folgenden Themen konfiguriert werden:
- _command_topic_: Der Router abonniert dieses Thema und interpretiert alle Nachrichten als Befehlszeilen
- _prefix_path_ / response: Der Router veröffentlicht zu diesem Thema die Befehlszeilenausgabe (Maske: 0x0001)

Wenn Sie jetzt möchten, dass der Router z. Nur Vdd, seine IP und die Befehlszeilenausgabe setzen die mqtt_mask auf 0x0001 | 0x0002 | 0x0040 (= "set mqtt_mask 0043").

# Energieverwaltung
Der Repeater überwacht seine aktuelle Versorgungsspannung (siehe Befehl "show stats"). Dies funktioniert nur, wenn das 107. Byte in esp_init_data_default.bin mit dem Namen vdd33_const auf 255 (0xFF) gesetzt ist. Der einfachste Weg, dies zu erreichen, besteht darin, esp_init_data_default_v08_vdd33.bin zum Flashen zu schreiben (siehe unten).

Wenn _vmin_ (in mV, Standardwert 0) auf einen Wert> 0 eingestellt ist und die Versorgungsspannung unter diesen Wert abfällt, wird für _vmin_sleep_ Sekunden in den Tiefschlafmodus geschaltet. Wenn Sie GPIO16 an RST angeschlossen haben (das auf einem ESP-01 schwer zu löten ist), wird nach diesem Intervall ein Neustart durchgeführt, eine erneute Verbindung hergestellt und die Messungen fortgesetzt. Wenn _vmin_ mit der Konfiguration gespeichert wird, wird es immer wieder in den Ruhezustand versetzt, bis die Versorgungsspannung über die Schwelle ansteigt. Diese Einstellungen sind besonders (nur?) Nützlich, wenn Sie das ESP mit einer (Lithium-) Batterie ohne Schutz vor zu geringer Aufladung betrieben haben. Dann ist ein Wert zwischen 2900 mV und 3000 mV wahrscheinlich hilfreich, da dadurch der Stromverbrauch des ESP auf ein Minimum reduziert wird und Sie viel mehr Zeit haben, den Akku aufzuladen oder auszutauschen, bevor er beschädigt wird. Dies ist nur dann sinnvoll, wenn Sie das ESP direkt an die Batterie angeschlossen haben. Wenn Sie eine zusätzliche Logik haben, wird die Batterie dadurch immer noch entladen.

Sie können den ESP mit dem Befehl "sleep" einmal manuell in den Ruhezustand versetzen.

Achtung: Wenn Sie einen _vmin_-Wert speichern, wird der Repeater nach jedem Neustart sofort heruntergefahren. Dann müssen Sie die gesamte Konfiguration löschen, indem Sie blank.bin (oder eine andere Datei) auf 0x0c000 flashen.
# ENC28J60 Ethernet-Unterstützung (experimentell)
Wenn Sie die Option HAVE_ENC28J60 in user_config.h aktivieren und das Projekt neu kompilieren, erhalten Sie Unterstützung für eine ENC28J60-Ethernet-NIC, die über SPI verbunden ist.

Die Verbindung über SPI-Verbindung muss sein:
`` `
NodeMCU / Wemos ESP8266 ENC28J60

        D6 GPIO12 <---> MISO
        D7 GPIO13 <---> MOSI
        D5 GPIO14 <---> SCLK
        D8 GPIO15 <---> CS
        D1 GPIO5 <---> INT
               Q3 / V33 <---> 3,3 V
               GND <---> GND
`` `
Außerdem benötigen Sie einen Transistor zum Entkoppeln von GPIO15, sonst bootet Ihr ESP nicht mehr, siehe: https://esp8266hints.wordpress.com/category/ethernet/

Jetzt können Sie die neue Ethernet-Schnittstelle konfigurieren:
- set eth_enable [0 | 1]: Aktiviert / Deaktiviert eine ENC28J60-Ethernet-NIC am SPI-Bus (Standard: 0 - deaktiviert)
- set eth_ip _ip-addr_: Legt eine statische IP-Adresse für die ETH-Schnittstelle fest
- set eth_ip dhcp: Konfiguriert standardmäßig die dynamische IP-Adresse für die ETH-Schnittstelle
- set eth_netmask _netmask_: Setzt eine statische Netzmaske für die ETH-Schnittstelle
- set eth_gw _gw-addr_: Legt eine statische Gateway-Adresse für die ETH-Schnittstelle fest

# Bauen und Flashen
Um diese Binärdatei zu erstellen, müssen Sie esp-open-sdk herunterladen und installieren (https://github.com/pfalcon/esp-open-sdk). Stellen Sie sicher, dass Sie das enthaltene "blinky" -Beispiel kompilieren und herunterladen können.

Laden Sie dann diesen Quelltextbaum in ein separates Verzeichnis herunter und passen Sie die Variable BUILD_AREA im Makefile und die gewünschten Optionen in user / user_config.h an. Änderungen der Standardkonfiguration können in user / config_flash.c vorgenommen werden. Erstellen Sie die esp_wifi_repeater-Firmware mit "make". "make flash" blinkt es auf einen esp8266.

Der Quelltextbaum enthält eine Binärversion von liblwip_open sowie die erforderlichen zusätzlichen Includes aus meiner Abspaltung von esp-open-lwip. * Dafür ist keine zusätzliche Installationsaktion erforderlich. * Nur wenn Sie die vorkompilierte Bibliothek nicht verwenden möchten, lesen Sie die Quellen unter https://github.com/martin-ger/esp-open-lwip. Verwenden Sie es, um das Verzeichnis "esp-open-lwip" im esp-open-sdk-Baum zu ersetzen. "make clean" im Verzeichnis esp_open_lwip und noch einmal ein "make" im oberen Verzeichnis esp_open_sdk. Dadurch wird eine liblwip_open.a kompiliert, die die NAT-Funktionen enthält. Ersetzen Sie liblwip_open_napt.a durch diese Binärdatei.

Wenn Sie die vollständigen vorkompilierten Firmware-Binärdateien verwenden möchten, können Sie sie mit "esptool.py --port / dev / ttyUSB0 write_flash -fs 4MB -ff 80m -fm dio 0x00000 firmware / 0x00000.bin 0x10000 firmware / 0x10000.bin" ( Verwenden Sie -fs 1 MB für einen ESP-01. Für das esp8285 müssen Sie -fs 1MB und -fm dout verwenden.

Unter Windows können Sie es mit dem "ESP8266 Download Tool" aktualisieren, das unter https://espressif.com/en/support/download/other-tools verfügbar ist. Laden Sie die beiden Dateien 0x00000.bin und 0x10000.bin aus dem Firmware-Verzeichnis herunter. Verwenden Sie für einen generischen ESP12, eine NodeMCU oder einen Wemos D1 die folgenden Einstellungen (für einen ESP-01 ändern Sie die FLASH-GRÖSSE auf "8Mbit"):

<img src = "https://raw.githubusercontent.com/martin-ger/esp_wifi_repeater/master/FlashRepeaterWindows.jpg">

Wenn der "QIO" -Modus auf Ihrem Gerät fehlschlägt, versuchen Sie stattdessen "DIO". Schauen Sie sich auch die "Erkannte Information" an, um die Größe und den Modus des Flash-Chips zu überprüfen. Wenn Ihre heruntergeladene Firmware immer noch nicht richtig startet, überprüfen Sie anhand der beigefügten Prüfsummen, ob die Binärdateien möglicherweise beschädigt sind.

# Bekannte Probleme
- Aufgrund der Einschränkungen der ESP-SoftAP-Implementierung sind maximal 8 Stationen gleichzeitig verbunden.
- Der ESP8266 benötigt eine gute Stromversorgung, da er während des Sendens Stromspitzen von bis zu 170 mA erzeugt (typischer Durchschnittsverbrauch liegt bei ca. 70 mA, wenn WLAN aktiviert ist). Überprüfen Sie zuerst die Stromversorgung, wenn Ihr ESP instabil läuft und von Zeit zu Zeit neu startet. Ein großer Kondensator zwischen Vdd und Gnd kann helfen, wenn hier Probleme auftreten.
- Alle nach dem 17. Oktober 2017 veröffentlichten Firmware-Versionen wurden mit der gepatchten Version des SDK 2.1.0 von Espressif erstellt, die den KRACK-Angriff (https://www.krackattacks.com/) abschwächt.
