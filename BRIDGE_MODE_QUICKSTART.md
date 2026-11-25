# Bridge Mode - Quick Start Guide

## 60 Sekunden Anleitung

### Schritt 1: Firmware vorbereiten
```bash
# Falls noch nicht geschehen: Firmware auf ESP flashen
esptool.py -p /dev/ttyUSB0 write_flash 0x00000 firmware/0x00000.bin 0x10000 firmware/0x10000.bin
```

### Schritt 2: Mit ESP verbinden
```bash
# Option A: Serial Console (115200 Baud)
minicom -D /dev/ttyUSB0 -b 115200

# Option B: Telnet
telnet 192.168.4.1 7777
```

### Schritt 3: Bridge Mode aktivieren
```
> set ssid "IhrWLAN-SSID"
> set password "IhrWLAN-Passwort"
> set bridge_mode 1
> save
> reset
```

### Schritt 4: Fertig!
Nach dem Reboot:
- Der ESP verbindet sich zu Ihrem WLAN
- Das SoftAP ist im gleichen Subnet wie Ihr Hauptnetzwerk
- Clients im SoftAP erhalten IPs vom Hauptnetzwerk-DHCP

## Häufige Fragen

### F: Was ist der Unterschied zwischen Bridge und NAT-Modus?
**A**: 
- **NAT**: Zwei Netzwerke (z.B. 192.168.1.x und 192.168.4.x) - Isolation
- **Bridge**: Ein Netzwerk (z.B. 192.168.1.x) - Erweiterung

### F: Wie stelle ich zurück auf NAT?
**A**:
```
> set bridge_mode 0
> set nat 1
> save
> reset
```

### F: Funktioniert Bridge Mode mit Automesh?
**A**: Noch nicht getestet. Automesh setzt derzeit seine eigenen Parameter, die Bridge Mode überschreiben könnten.

### F: Was muss ich beachten?
**A**:
- Uplink-AP muss DHCP-Server haben
- Leases müssen für alle Clients reichen
- Firewall auf Hauptrouter überprüfen

### F: Warum funktioniert DHCP nicht?
**A**: Im Bridge Mode wird der DHCP-Server des ESP deaktiviert. Clients müssen vom Uplink-AP DHCP erhalten. Prüfe:
1. Ist DHCP auf Uplink-AP aktiviert?
2. Sind genug Leases vorhanden?
3. Verbindung zum Uplink-AP stabil?

## Praktische Beispiele

### Beispiel 1: Heimnetzwerk erweitern
```
Dein Router: 192.168.1.1
             192.168.1.0/24 WiFi (SSID "Zuhause")
                 |
              [ESP Bridge]
                 |
         "Zuhause-Extended" WiFi
         -> Clients erhalten IPs aus 192.168.1.0/24
```

**Konfiguration**:
```
> set ssid "Zuhause"
> set password "DeinPasswort"
> set ap_ssid "Zuhause-Extended"
> set bridge_mode 1
> save
> reset
```

### Beispiel 2: Isoliertes Netzwerk mit Bridge-Erweiterung
```
Router: 192.168.1.0/24
    |
    +-- [ESP] mit zwei SSIDs
       - "Hauptnetz" (Bridge Mode) -> 192.168.1.x
       - [Nicht möglich mit einer Hardware]
```

## Status überprüfen

```bash
# Mit telnet verbinden
telnet 192.168.4.1 7777

# Konfiguration anzeigen
> show config

# Erwarteter Output mit Bridge:
STA: SSID:Dein-WLAN PW:*** Auto: 1
AP: SSID:ESP-AP [open] IP:192.168.1.2/24 [BRIDGE]

# Mit NAT würde es so aussehen:
AP: SSID:ESP-AP [open] IP:192.168.4.1/24 [NAT]
```

## Troubleshooting in 3 Schritten

### Problem: Keine Verbindung zum Uplink-AP
```
1. SSID und Passwort überprüfen: > show config
2. AP-Reichweite überprüfen: > scan
3. Verbindung versuchen: > connect
```

### Problem: Clients erhalten keine IP
```
1. Uplink-AP DHCP-Status überprüfen (nicht vom ESP!)
2. DHCP-Leases prüfen (sollten > 10 sein)
3. Firewall-Filter auf Uplink-AP überprüfen
4. Erst einen Client testen (nicht mehrere gleichzeitig)
```

### Problem: Kommunikation zwischen Netzwerken langsam
```
1. WiFi-Kanal prüfen (sollte nicht überlastet sein)
2. PHY-Mode überprüfen: > set phy_mode 3
3. ESP näher zum Uplink-AP stellen
4. Andere 2.4GHz Geräte reduzieren
```

## Nützliche Befehle

```bash
# Status anzeigen
> show config

# Debug-Logs sehen
> show stats

# Uplink-APs scannen
> scan

# Neustart
> reset

# Zu Werkseinstellungen zurück
> reset factory

# Einstellungen speichern
> save
```

## Leistung prüfen

Nach aktivierem Bridge Mode: Speed-Test machen
```bash
# Von Client im ESP SoftAP zu anderem Client im Uplink-Netzwerk
# Erwartet: Bessere Performance als NAT-Modus
# (kein IP-Header Rewriting)
```

## Sicherheit

Bridge Mode beseitigt die NAT-Isolation. Daher:

```
# (Optional) Firewall-Regel auf Router
Blockiere unbekannte IPs im Bridge-Interface

# (Optional) ACL auf ESP aktivieren
> acl from_ap IP <block_this> deny
> save

# (Wichtig) SoftAP-Passwort setzen
> set ap_password "StarkesPasswort"
> set ap_open 0
> save
```

## Weitere Informationen

- Ausführliche Dokumentation: `BRIDGE_MODE.md`
- Technische Implementierung: `BRIDGE_MODE_IMPLEMENTATION.md`
- Original README: `README.md`

## Support

Wenn etwas nicht funktioniert:
1. Serial Console öffnen (115200 Baud)
2. `show config` ausführen
3. Output kopieren
4. Fehlermeldungen notieren
5. GitHub Issue erstellen
