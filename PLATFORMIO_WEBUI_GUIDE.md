# ESP8266 WiFi Repeater - Build System & Web UI

## 📦 Vollständiges Build & Web Interface System

### Teil 1: PlatformIO Build System

Die neue `platformio.ini` bietet ein professionelles Build-System mit mehreren vordefinierten Umgebungen:

#### Verfügbare Build-Umgebungen

```bash
# Debug Build (Optimiert mit Debugging Info)
pio run -e esp8266_debug

# Release Build (Minimal Größe)
pio run -e esp8266_release

# Production Build (Alle Features)
pio run -e esp8266_production

# Fast Build (Schnelle Entwicklung)
pio run -e esp8266_fast
```

#### VSCode Integration

Wenn Sie VSCode nutzen, wird PlatformIO automatisch erkannt:
- Öffnen Sie die Kommandopalette: `Ctrl+Shift+P`
- Suchen Sie nach "PlatformIO" für verfügbare Befehle
- Verfügbare Shortcuts:
  - `Ctrl+Alt+B`: Build
  - `Ctrl+Alt+U`: Upload
  - `Ctrl+Alt+S`: Serial Monitor

#### Build-Optionen

```ini
# Firmware-Größe reduzieren
build_flags = -Os -s

# Debug-Symbole hinzufügen
build_flags = -g -O0

# Production mit Bridge Mode
build_flags = -DPRODUCTION_BUILD=1 -DBRIDGE_MODE_ENABLED=1 -DFEATURE_TUNING=1
```

### Teil 2: Moderne Dark-Design Weboberfläche

#### Features

1. **Modernes dunkles Design**
   - Cyan (#00d4ff) als Primärfarbe
   - Schwarze Hintergründe für Augenschonung
   - Smooth Animationen und Übergänge
   - Responsive für alle Bildschirmgrößen

2. **Betriebsmodus-Auswahl**
   - Bridge Mode (Layer 2 Bridging)
   - NAT Mode (Router-Funktion)
   - Toggle-Switch für einfache Umschaltung

3. **WiFi Konfiguration**
   - SSID und Passwort des Uplink-Netzwerks
   - AP SSID und Passwort
   - Option für offenen AP

4. **Feineinstellungen (Tuning-Regler)**
   - TX Power: 0 - 20.5 dBm (in 0.5 dBm Schritten)
   - Datenrate: 1 Mbps bis 130 Mbps
   - DHCP Timeout: 10 - 300 Sekunden
   - WiFi Kanal: Auto (1-13) oder spezifisch
   - NAPT aktivieren/deaktivieren (NAT Mode)

5. **Geräteinformationen**
   - Firmware-Version
   - MAC-Adressen (STA & AP)
   - IP-Adressen
   - Verbindungsstatus

6. **Debug Konsole**
   - Live CLI-Zugriff über Browser
   - Befehlshistorie
   - Farbige Status-Ausgabe

#### Zugriffsadresse

```
http://esp8266.local/
oder
http://192.168.4.1/
```

### Teil 3: Firmware Tuning-Regler

#### Implementierte Parameter

Die Firmware wurde um folgende konfigurierbare Parameter erweitert:

```c
// TX Power (Sendeleistung)
config->tx_power_raw     // 0-82 (entspricht 0-20.5 dBm)

// DHCP Timeout
config->dhcp_timeout     // Sekunden (10-300)

// WiFi Kanal
config->channel          // 0 (Auto) oder 1-13

// Datenrate
config->data_rate        // Verschiedene Raten (Mbps)

// NAPT aktivieren
config->napt_enable      // 0=deaktiviert, 1=aktiviert
```

#### CLI-Befehle

```bash
# TX Power setzen (in dBm, 0.5er Schritte)
set tx_power 20.5

# DHCP Timeout setzen
set dhcp_timeout 60

# WiFi Kanal setzen
set channel 6

# Datenrate setzen
set data_rate 54

# NAPT aktivieren/deaktivieren
set napt 1

# Aktuelle Einstellungen anzeigen
show config
```

#### Auswirkungen der Parameter

| Parameter | Auswirkung | Empfehlung |
|-----------|-----------|-----------|
| **TX Power** | Höher = größere Reichweite, höherer Stromverbrauch | 15-20 dBm für normalen Einsatz |
| **Datenrate** | Höher = schneller aber anfälliger für Fehler | 54 Mbps standard |
| **DHCP Timeout** | Länger = mehr Zeit für Clients, aber längere Leases | 60 Sekunden |
| **WiFi Kanal** | Manuell = weniger Interferenz, Auto = flexibel | Auto oder Kanal 6 |
| **NAPT** | Verbesserte NAT mit Port Translation | 1 (aktiviert) |

### Teil 4: Web API Endpoints

Die Firmware muss folgende REST-API Endpoints implementieren:

```bash
# Konfiguration laden
GET /api/config
Response: { ssid, password, ap_ssid, ap_password, tx_power, dhcp_timeout, ... }

# Konfiguration speichern
POST /api/config
Body: { ssid, password, ap_ssid, ... }

# Status abrufen
GET /api/status
Response: { sta_connected, ip_sta, mac_sta, ip_ap, mac_ap, version, ... }

# Befehl ausführen
POST /api/cmd
Body: { cmd: "set channel 6" }
Response: { response: "..." }

# Neu starten
POST /api/reboot
Response: { status: "ok" }

# Auf Standard zurücksetzen
POST /api/reset
Response: { status: "ok" }

# Statische Dateien
GET /           → index.html
GET /style.css  → Stylesheet
GET /app.js     → JavaScript App
```

### Teil 5: Installation & Deployment

#### Schritt 1: Firmware flashen

```bash
# Debug Build flashen
pio run -e esp8266_debug -t upload

# Production flashen
pio run -e esp8266_production -t upload
```

#### Schritt 2: Web-Dateien hochladen

```bash
# Nach dem Flashen werden die Web-Dateien via SPIFFS hochgeladen:
pio run -e esp8266_production -t uploadfs
```

#### Schritt 3: Zugriff

Nach dem Neustart:

```
Öffnen Sie: http://192.168.4.1/
oder:       http://esp8266.local/ (wenn mDNS aktiviert)
```

### Teil 6: Entwicklung & Debugging

#### VSCode Tasks

Erstellen Sie `.vscode/tasks.json`:

```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "PlatformIO: Build",
            "type": "shell",
            "command": "pio",
            "args": ["run", "-e", "esp8266_debug"],
            "problemMatcher": [],
            "group": {
                "kind": "build",
                "isDefault": true
            }
        },
        {
            "label": "PlatformIO: Upload",
            "type": "shell",
            "command": "pio",
            "args": ["run", "-e", "esp8266_debug", "-t", "upload"]
        },
        {
            "label": "PlatformIO: Serial Monitor",
            "type": "shell",
            "command": "pio",
            "args": ["device", "monitor", "-b", "115200"]
        }
    ]
}
```

#### Serial Monitor öffnen

```bash
pio device monitor --baud 115200
```

### Teil 7: Browser-Konsole Logging

Die Web-App protokolliert alle Aktionen in der Browser-Konsole:

```javascript
// In der Konsole des Browsers (F12):
app.debugMode = true;  // Debug-Modus aktivieren
app.loadConfiguration();  // Konfiguration laden
app.saveConfiguration();  // Konfiguration speichern
```

### Teil 8: Performance Optimierungen

#### Tipps für schnelle Builds

```bash
# Nur mit notwendigen Features bauen
build_flags = -DFEATURE_WEB_UI=1

# Größe reduzieren
build_flags = -flto -s

# Kompression aktivieren
board_build.filesystem = littlefs
```

#### WiFi Performance

- **TX Power**: Höhere Werte für bessere Reichweite
- **Kanal**: Weniger Interferenz durch Auswahl
- **Datenrate**: Niedriger bei schlechter Signalqualität
- **Bridge Mode**: Bessere Performance als NAT (kein IP-Rewriting)

### Teil 9: Sicherheitshinweise

⚠️ **Wichtig für Production:**

1. **Passwörter**: Verwenden Sie starke Passwörter
2. **WiFi Security**: WPA2/WPA3 für AP verwenden (nicht offen)
3. **API Security**: HTTPS für API-Zugriffe (nicht HTTP)
4. **Firmware Updates**: Regelmäßig aktualisieren
5. **Config Backup**: Regelmäßig Backups anlegen

### Teil 10: Fehlerbehebung

#### Weboberfläche wird nicht geladen

```bash
# 1. Prüfen Sie die IP-Adresse
ping 192.168.4.1

# 2. Prüfen Sie die Firmware-Logs
pio device monitor

# 3. Resetten Sie die Firmware
set default all
save
reset
```

#### Build-Fehler

```bash
# Clean Build
pio run -e esp8266_debug --target clean

# Full rebuild
pio run -e esp8266_debug --target rebuild

# Verbose output
pio run -e esp8266_debug -v
```

#### Tuning-Parameter funktionieren nicht

```bash
# 1. Prüfen Sie die aktuelle Konfiguration
show config

# 2. Setzen Sie einen Wert
set tx_power 15.0

# 3. Speichern Sie
save

# 4. Neu starten
reset

# 5. Prüfen Sie die Änderung
show config
```

### Teil 11: Dateistruktur

```
/root/esp_wifi_repeater/
├── platformio.ini              # PlatformIO Konfiguration
├── web/                        # Web-Interface Dateien
│   ├── index.html             # Hauptseite
│   ├── style.css              # Stylesheet (dunkles Design)
│   └── app.js                 # JavaScript App
├── user/
│   ├── config_flash.h         # Konfigurationsheader (erweitert)
│   ├── config_flash.c         # Konfiguration (erweitert)
│   └── user_main.c            # Hauptprogramm
└── firmware/                  # Build-Output
    └── esp_init_data_default.bin
```

### Teil 12: Zukünftige Erweiterungen

Geplante Features (optional):

- [ ] HTTPS Support für Web-UI
- [ ] OTA (Over-The-Air) Updates via Web
- [ ] Statistiken & Graphen (Traffic, Signal-Qualität)
- [ ] Automatische Kanal-Optimierung
- [ ] Log-Speicherung auf SPIFFS
- [ ] Automatische Failover-Szenarien
- [ ] Multi-Language Support (EN/DE/FR)

---

**Version**: 1.8.7  
**Status**: Production Ready  
**Last Updated**: 2024-11-25
