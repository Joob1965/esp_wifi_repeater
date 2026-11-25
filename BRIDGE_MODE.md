# Bridge Mode - Betrieb als Netzwerk-Brücke

## Überblick

Die ESP8266 WiFi Repeater Firmware wurde um eine **Bridge Mode**-Funktion erweitert, die es dem Gerät ermöglicht, als echte Layer 2 (MAC)-Brücke zwischen zwei Netzwerken zu fungieren, anstatt als NAT-Router.

### Repeater Mode (Standard)
```
Uplink AP (z.B. 192.168.1.x)
        |
   [ESP8266]  - NAT/NAPT aktiviert
        |
SoftAP (192.168.4.x)
```

Clients im SoftAP sehen das Uplink-Netzwerk über NAT (Netzwerk-Adressübersetzung).

### Bridge Mode (Neu)
```
Uplink AP (z.B. 192.168.1.x)
        |
   [ESP8266]  - Bridging, kein NAT
        |
SoftAP (gleiches Subnetz wie Uplink)
```

Clients im SoftAP erhalten IPs vom gleichen Subnetz wie das Uplink-Netzwerk (kein NAT).

## Unterschiede zwischen Bridge und Repeater

| Aspekt | Repeater (NAT) | Bridge |
|--------|----------------|--------|
| **Netzwerk-Adressierung** | Zwei separate IP-Subnetze | Gleicher IP-Subnet |
| **DHCP Server** | Aktiv auf SoftAP | Deaktiviert auf SoftAP, Uplink verwaltet IPs |
| **NAT/Masquerading** | Aktiv | Deaktiviert |
| **IP-Header-Modifikation** | Ja (Addresses rewritten) | Nein (Transparent) |
| **Performance** | ~5 Mbps | Besser (kein Rewriting) |
| **DNS-Handling** | Redirection erforderlich | Transparent |
| **Besonderheiten** | Isoliert Netzwerke | Erweitert Netzwerk |

## Installation und Aktivierung

### 1. Firmware flashen
Die neue Firmware mit Bridge Mode Unterstützung muss geflasht werden:

```bash
# Mit esptool.py (Beispiel)
esptool.py -p /dev/ttyUSB0 write_flash 0x00000 firmware/0x00000.bin 0x10000 firmware/0x10000.bin
```

### 2. Konfiguration über Web-Interface oder CLI

#### Über Web-Interface (empfohlen)
1. Browser zu `http://192.168.4.1` öffnen
2. STA-Einstellungen eingeben (Uplink-AP SSID und Passwort)
3. Verbindung herstellen
4. Nach Neustart: Im Advanced Mode Bridge Mode aktivieren (wenn verfügbar)

#### Über Konsole (Serial/Telnet)
```
# Verbindung zur Konsole
telnet 192.168.4.1 7777
# oder über Serial: 115200 Baud

# Bridge Mode aktivieren
set bridge_mode 1

# Optional: NAT deaktivieren (wird automatisch deaktiviert)
set nat 0

# Konfiguration speichern
save

# Neustart
reset
```

## Verwendungsszenarien

### Szenario 1: Netzwerk-Erweiterung
Sie möchten Ihr bestehendes Heimnetzwerk (z.B. 192.168.1.0/24) drahtlos erweitern, ohne dass Clients ihre IPs neu bekommen.

```
ISP Router (192.168.1.1)
    |
    +-- [PC-WiFi] (192.168.1.100)
    |
    +-- [ESP Bridge] (STA: 192.168.1.x, AP: gleicher Subnet)
         |
         +-- [Laptop im AP] (erhalten IP aus 192.168.1.0/24)
         +-- [Smartphone im AP] (erhalten IP aus 192.168.1.0/24)
```

### Szenario 2: IoT-Geräte-Integration
IoT-Geräte im SoftAP des ESP könnten direkt mit dem Uplink-Netzwerk kommunizieren (wenn Firewall erlaubt).

### Szenario 3: Mesh-Netzwerke
Mehrere ESPs im Bridge Mode könnten kombiniert werden, um größere Mesh-Strukturen zu schaffen.

## Konfigurationsbeispiele

### Bridge Mode aktivieren
```
# Konsole öffnen (Serial 115200 oder Telnet zu Port 7777)

# Bridge Mode einschalten
set bridge_mode 1

# Uplink-AP konfigurieren
set ssid "MeinRouter"
set password "MeinPasswort"

# SoftAP Namen ändern (optional)
set ap_ssid "ESP_Bridge"
set ap_password "none"
set ap_open 1

# Speichern und Neustart
save
reset
```

### Bridge Mode deaktivieren (Zurück zu NAT)
```
# Konsole öffnen

# Bridge Mode ausschalten
set bridge_mode 0

# NAT wieder aktivieren (optional)
set nat 1

# Speichern und Neustart
save
reset
```

## Technische Details

### IP-Konfiguration im Bridge Mode

Nach Aktivierung des Bridge Mode:

1. **STA (Uplink) Interface**
   - Erhält IP via DHCP vom Uplink-AP
   - Beispiel: 192.168.1.50/24

2. **SoftAP (Bridge) Interface**
   - Wird im gleichen Subnetz wie STA konfiguriert
   - Erhält IP .2 (Beispiel: 192.168.1.2/24)
   - DHCP Server wird **deaktiviert**

3. **Clients im SoftAP**
   - Müssen DHCP vom Uplink-AP erhalten (nicht vom ESP)
   - Erhalten IPs im Uplink-Subnetz (z.B. 192.168.1.0/24)

### NAT Handling

Bridge Mode deaktiviert automatisch NAT:
- `config.nat_enable` wird auf 0 gesetzt
- `ip_napt_enable_no(1, 0)` wird aufgerufen
- Netzwerk-Interface `napt` Flag wird auf 0 gesetzt

### DHCP Server

Im Bridge Mode wird der DHCP Server auf dem SoftAP **deaktiviert**:
- Clients müssen IP-Adressen vom Uplink-DHCP-Server erhalten
- Der ESP fungiert nur als MAC-Brücke

**Hinweis**: Der Uplink-DHCP-Server muss eine ausreichende Anzahl von Leases haben.

## Troubleshooting

### Clients erhalten keine IPs
**Problem**: Clients können sich mit dem ESP SoftAP verbinden, erhalten aber keine IP-Adresse.

**Lösungen**:
1. Uplink-AP DHCP-Server prüfen - Muss DHCP aktiviert haben
2. DHCP-Lease-Bereich prüfen - Muss groß genug sein
3. Firewalls/MAC-Filter prüfen

### Verbindung zu Uplink-AP funktioniert nicht
**Problem**: ESP verbindet sich nicht zum Uplink-AP.

**Lösungen**:
1. SSID und Passwort überprüfen: `show config`
2. SSID-Broadcast überprüfen (falls versteckt)
3. Uplink-AP Reichweite prüfen (Serial oder Telnet mit `scan` Befehl)

### Kommunikation zwischen Netzwerken begrenzt
**Problem**: Clients im SoftAP können bestimmte Devices im Uplink-Netz nicht erreichen.

**Lösungen**:
1. Firewall-Regeln auf Uplink-AP prüfen
2. ACL-Regeln auf ESP prüfen: `show acl`
3. Routing überprüfen: `show route`

### Performance-Probleme
**Problem**: Datenrate ist niedrig.

**Lösungen**:
1. WiFi-Kanal überprüfen - Kann Interferenzen geben
2. PHY-Mode überprüfen: `set phy_mode 3` (802.11n)
3. Distanz zum Uplink-AP reduzieren
4. Weitere Clients entfernen/reduzieren

## Status anzeigen

```
# Aktuelle Konfiguration anzeigen
show config

# Beispiel-Output mit Bridge Mode:
STA: SSID:MeinRouter PW:***** Auto: 1 DHCP: 1
AP:  SSID:ESP_Bridge [open] IP:192.168.1.2/24 [BRIDGE]
```

## Firmware-Kompilierung

Wenn Sie die Firmware selbst kompilieren möchten:

1. ESP Open SDK Installation erforderlich
2. Makefile anpassen (Pfade)
3. `make` ausführen

Die Bridge Mode Funktionalität ist bereits im Code integriert und benötigt keine zusätzlichen Optionen beim Kompilieren.

## Rückwärts-Kompatibilität

Die neue Bridge Mode Funktion ist **vollständig rückwärts-kompatibel**:
- Existierende Konfigurationen funktionieren unverändert
- NAT-Modus bleibt Standard
- Bridge Mode muss explizit aktiviert werden

## Zu beachtende Unterschiede beim Betrieb

### DNS-Auflösung
- **Repeater**: ESP lädt DNS-Server vom Uplink, gibt diese an Clients weiter
- **Bridge**: Clients sprechen direkt mit Uplink-DNS-Server

### Netzwerk-Reichweite
- **Repeater**: Kann in separaten Netzwerken Routing verhindern
- **Bridge**: Ermöglicht volle Netzwerk-Erkennung für mDNS/Bonjour

### Sicherheit
- **Repeater**: NAT bietet implizite Isolation
- **Bridge**: Keine zusätzliche Isolation durch NAT (Firewall empfohlen)

## Weitere Optionen

### ACL (Access Control List) in Bridge Mode
Firewalling bleibt funktional:

```
# Beispiel: Traffic von AP-Clients zu Uplink blockieren
acl from_ap IP 192.168.1.0 deny

# Speichern
save
```

### Traffic Shaping
Token Bucket Queueing funktioniert auch im Bridge Mode:

```
set upstream_kbps 1000
set downstream_kbps 2000
```

### Monitoring
Remote Monitoring funktioniert weiterhin:

```
monitor on 9000
```

## Support und Fragen

Bei Fragen zur Bridge Mode Funktion:
1. `show config` ausführen und Output überprüfen
2. Logs über Serial Console anschauen (115200 Baud)
3. ACL und Routing Einstellungen überprüfen

## Versionshistorie

- **v1.8.7+**: Bridge Mode hinzugefügt
  - Neue `bridge_mode` Konfigurationsoption
  - Automatische NAT-Deaktivierung im Bridge Mode
  - DHCP Server Deaktivierung im Bridge Mode
  - IP-Subnet Synchronisation zwischen STA und AP
