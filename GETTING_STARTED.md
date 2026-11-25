# 🚀 Getting Started - ESP8266 WiFi Repeater v1.8.7

**Willkommen!** Sie haben ein professionelles Build- und Web-Interface System für Ihren ESP8266 WiFi Repeater mit Bridge Mode.

---

## ⚡ 5 Minuten Quick Start

### Schritt 1: Installation (1 Min)

```bash
# PlatformIO installieren
pip install platformio

# Projekt-Verzeichnis
cd /root/esp_wifi_repeater
```

### Schritt 2: Firmware bauen (1-2 Min)

```bash
# Debug Build (mit Debugging-Info)
pio run -e esp8266_debug

# ODER Production (optimiert)
pio run -e esp8266_production
```

### Schritt 3: ESP8266 verbinden & flashen (1 Min)

```bash
# ESP8266 mit USB-Kabel verbinden, dann:
pio run -e esp8266_debug -t upload

# Web-Interface hochladen
pio run -e esp8266_debug -t uploadfs
```

### Schritt 4: Web-Interface öffnen (1 Min)

```
Öffnen Sie im Browser:
http://192.168.4.1/
oder
http://esp8266.local/
```

### Schritt 5: Konfigurieren (1 Min)

1. Mode wählen (Bridge oder NAT)
2. WiFi SSID & Passwort eingeben
3. Feineinstellungen anpassen
4. "Speichern & Neu Starten" klicken

**Fertig! 🎉**

---

## 📚 Dokumentation

### Für Anfänger

👉 **START HIER**: [PLATFORMIO_QUICKSTART.md](PLATFORMIO_QUICKSTART.md)

Lernen Sie die Basics in 5 Minuten!

### Für Entwickler

📖 **VOLLSTÄNDIG**: [PLATFORMIO_WEBUI_GUIDE.md](PLATFORMIO_WEBUI_GUIDE.md)

Detaillierte Dokumentation mit allen Features und Optionen.

### Bridge Mode spezifisch

🌉 **BRIDGE**: [BRIDGE_MODE.md](BRIDGE_MODE.md)

Alles über Layer 2 Bridging zwischen zwei WLAN-Netzwerken.

---

## 🎯 Was ist enthalten?

### ✅ Professionelles Build-System

```bash
pio run -e esp8266_debug      # Debug Build
pio run -e esp8266_release    # Optimiert (kleine Größe)
pio run -e esp8266_production # Vollständige Features
pio run -e esp8266_fast       # Schnelle Entwicklung
```

### ✅ VSCode Integration

Öffnen Sie VSCode und nutzen Sie die vordefinierten Tasks:

```
Ctrl+Shift+P → "Task: Run Task"
```

Verfügbar:
- 🔨 Build
- 📤 Upload Firmware
- 💾 Upload Web Files
- 🚀 Build & Upload
- 📡 Serial Monitor

### ✅ Modernes Dunkles Web-Interface

- 🌙 Cyan/Blau Farbschema
- 📱 Responsive Design (Desktop/Tablet/Mobile)
- ✨ Smooth Animationen
- 🎚️ Feineinstellungs-Regler

**Zugriff**: `http://192.168.4.1/`

### ✅ Firmware Tuning-Regler

Einstellbar im Web-Interface oder per CLI:

| Parameter | Bereich | Befehl |
|-----------|---------|--------|
| TX Power | 0-20.5 dBm | `set tx_power 20.5` |
| DHCP Timeout | 10-300 s | `set dhcp_timeout 60` |
| WiFi Kanal | Auto/1-13 | `set channel 6` |
| Datenrate | 1-130 Mbps | `set data_rate 54` |
| NAPT | 0/1 | `set napt 1` |

### ✅ Bridge Mode

Verbindet zwei WLAN-Netzwerke auf Layer 2:

```bash
# Web-UI: Toggle "Bridge Mode"
# Oder CLI:
set bridge_mode 1
save
reset
```

---

## 🔧 Häufige Probleme

### "pip command not found"
```bash
# Python/pip installieren
# Windows: https://www.python.org/downloads/
# Linux: sudo apt install python3-pip
```

### "Cannot find COM port"
```bash
# Verfügbare Ports auflisten
pio device list

# Spezifischen Port nutzen
pio run -t upload --upload-port /dev/ttyUSB0
```

### "Web-Interface lädt nicht"
```bash
# 1. Serial Monitor öffnen
pio device monitor -b 115200

# 2. ESP8266 neustarten
# 3. Browser-Konsole prüfen (F12)

# 4. Neu flashen
pio run -e esp8266_debug --target clean
pio run -e esp8266_debug -t upload
```

### "Sketch too large"
```bash
# Production Build verwenden (optimiert)
pio run -e esp8266_production -t upload
```

---

## 📊 Projektstruktur

```
/root/esp_wifi_repeater/
├── platformio.ini             # Build-Konfiguration
├── .vscode/
│   ├── tasks.json            # VSCode Tasks
│   └── settings.json         # Editor-Einstellungen
├── web/
│   ├── index.html            # Weboberfläche
│   ├── style.css             # Dark Design CSS
│   └── app.js                # Interaktive App
├── user/
│   ├── user_main.c           # Firmware-Code
│   ├── config_flash.h        # Konfiguration
│   └── config_flash.c        # Defaults
├── PLATFORMIO_QUICKSTART.md   # 5-Min Guide
├── PLATFORMIO_WEBUI_GUIDE.md  # Vollständig
├── BRIDGE_MODE.md            # Bridge Mode Doku
└── PROJECT_COMPLETION_SUMMARY.md
```

---

## 🌐 Web-Interface Features

### Betriebsmodus
- 🌉 Bridge Mode (Layer 2 Bridging)
- 🔀 NAT Mode (Router mit NAT/NAPT)

### WiFi Konfiguration
- SSID des Uplink-Netzwerks
- Passwort
- AP SSID & Passwort
- Open/Closed Netzwerk

### Feineinstellungen
- TX Power Slider
- DHCP Timeout Slider
- WiFi Kanal Dropdown
- Datenrate Dropdown
- NAPT Toggle

### Status & Infos
- Verbindungsstatus
- Firmware-Version
- MAC-Adressen
- IP-Adressen
- Live-Updates

### Aktionen
- Speichern & Neu Starten
- Neu Starten
- Reset auf Defaults

### Debug Konsole
- CLI-Befehle eingeben
- Farbige Ausgabe
- Live-Logging

---

## 💡 Tipps & Tricks

### Schnelle Build-Entwicklung

```bash
# Fast Build für schnelle Iteration
pio run -e esp8266_fast -t upload

# Oder VSCode Task nutzen
Ctrl+Shift+P → "🔨 Build (Debug)"
```

### Serial Monitor überwachen

```bash
# In separatem Terminal:
pio device monitor -b 115200

# Logs in Echtzeit anschauen
# Neustart auslösen: Ctrl+T → Ctrl+R
```

### Web-Interface Debugging

```bash
# Browser-Konsole öffnen: F12
# App-Objekt inspizieren:
app.debugMode = true;  // Debug-Mode aktivieren
app.loadConfiguration(); // Config neu laden
```

### CLI-Befehle

```bash
# Serial/Telnet Verbindung zum ESP8266
# Dann:

# Status anzeigen
show config

# Mode wechseln
set bridge_mode 1    # Bridge aktivieren
set bridge_mode 0    # Bridge deaktivieren
set nat 1            # NAT aktivieren

# Tuning
set tx_power 15.0    # TX Power: 15 dBm
set channel 6        # WiFi Kanal: 6
set data_rate 54     # Datenrate: 54 Mbps
set dhcp_timeout 60  # DHCP Timeout: 60s

# Speichern & Reboot
save
reset
```

---

## 🚀 Nächste Schritte

Nach dem Quick Start:

1. ✅ Firmware erfolgreich flashen
2. ✅ Web-Interface öffnen
3. ✅ WiFi konfigurieren
4. 📖 Dokumentation lesen (PLATFORMIO_WEBUI_GUIDE.md)
5. 🔧 Weitere Parameter tunen
6. 🌉 Bridge Mode testen (BRIDGE_MODE.md)
7. 📊 Status im Serial Monitor beobachten

---

## 📞 Support & Hilfe

### Häufige Fragen

**F: Wie wechsle ich zwischen Bridge und NAT?**  
A: Im Web-Interface oder per CLI: `set bridge_mode 1`

**F: Welcher Kanal ist der beste?**  
A: Auto ist meist OK. Für Stabiltät: Kanal 1, 6 oder 11

**F: Kann ich die TX Power reduzieren?**  
A: Ja, Slider im Web-UI oder: `set tx_power 10.0`

**F: Wie viele Clients unterstützt es?**  
A: Bis zu 8-10 im SoftAP, abhängig von Speicher

### Dokumentation

- **Quick Start**: PLATFORMIO_QUICKSTART.md
- **Vollständig**: PLATFORMIO_WEBUI_GUIDE.md
- **Bridge Mode**: BRIDGE_MODE.md
- **Verifikation**: PLATFORMIO_WEBUI_VERIFICATION.md

---

## ✨ Genießen Sie Ihre neue Firmware!

**Version 1.8.7 ist production-ready und getestet.**

🎉 Viel Erfolg beim Bauen und Konfigurieren!

---

*Last Updated: 25. November 2024*  
*Repository: Joob1965/esp_wifi_repeater*
