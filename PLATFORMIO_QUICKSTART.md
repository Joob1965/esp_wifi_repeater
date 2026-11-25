# 🚀 Quick Start: PlatformIO Build & Web UI

## Schnelleinstieg in 5 Minuten

### 1️⃣ PlatformIO installieren

```bash
# PlatformIO CLI installieren (falls nicht vorhanden)
pip install platformio

# oder nutzen Sie VSCode Extension:
# - Öffnen Sie VSCode
# - Extension Marketplace (Ctrl+Shift+X)
# - Suchen: "PlatformIO IDE"
- Installieren
```

### 2️⃣ Projekt bauen

```bash
cd /root/esp_wifi_repeater

# Debug Build (schnell, mit Debugging)
pio run -e esp8266_debug

# ODER Production Build (optimiert)
pio run -e esp8266_production
```

**Output:**
```
Building in debug mode
Compiling .pio/build/esp8266_debug/src/user/user_main.c
...
Linking .pio/build/esp8266_debug/firmware.elf
Creating image...
SUCCESS
```

### 3️⃣ Firmware flashen

```bash
# ESP8266 mit USB verbinden

# Firmware hochladen
pio run -e esp8266_debug -t upload

# Web-Interface hochladen
pio run -e esp8266_debug -t uploadfs
```

**Output:**
```
Uploading .pio/build/esp8266_debug/firmware.bin
...
Verifying...
Hard resetting via RTS pin...
```

### 4️⃣ Web-Interface öffnen

Nach dem Upload öffnen Sie im Browser:

```
http://192.168.4.1/
```

Oder mit mDNS (falls verfügbar):

```
http://esp8266.local/
```

### 5️⃣ Erste Einstellungen

1. **Betriebsmodus wählen**: Bridge oder NAT
2. **WiFi eingeben**: SSID und Passwort des Uplink-Netzwerks
3. **Regler anpassen**: TX Power, Kanal, etc.
4. **Speichern**: Button "Speichern & Neu Starten"

---

## 🔧 VSCode Buttons (Empfohlen)

Legen Sie eine `.vscode/tasks.json` an für schnelle Zugriffe:

```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "🔨 Build",
            "type": "shell",
            "command": "pio",
            "args": ["run", "-e", "esp8266_debug"],
            "group": {"kind": "build", "isDefault": true},
            "presentation": {"echo": true}
        },
        {
            "label": "📤 Upload Firmware",
            "type": "shell",
            "command": "pio",
            "args": ["run", "-e", "esp8266_debug", "-t", "upload"]
        },
        {
            "label": "💾 Upload Web-Files",
            "type": "shell",
            "command": "pio",
            "args": ["run", "-e", "esp8266_debug", "-t", "uploadfs"]
        },
        {
            "label": "📡 Serial Monitor",
            "type": "shell",
            "command": "pio",
            "args": ["device", "monitor", "-b", "115200"]
        }
    ]
}
```

Nutzen Sie diese mit: `Ctrl+Shift+P` → Task → wählen

---

## 🌙 Web UI Features

### Dark Design ✨
- Cyan/Blau Farbschema
- Augen-freundlich bei Nacht
- Smooth Animationen

### Bridge Mode Regler
- **TX Power**: 0-20.5 dBm
- **Datenrate**: 1-130 Mbps
- **DHCP Timeout**: 10-300 Sekunden
- **WiFi Kanal**: Auto oder 1-13

### Status Anzeige
- Verbindungsstatus
- IP-Adressen
- MAC-Adressen
- Firmware-Version

### Debug Konsole
- CLI-Befehle direkt eingeben
- Live-Output anzeigen
- Farbige Status-Meldungen

---

## 🐛 Häufige Probleme & Lösungen

### "Cannot find COM port"
```bash
# Listeieren Sie verfügbare Ports auf:
pio device list

# Spezifischen Port nutzen:
pio run -t upload --upload-port /dev/ttyUSB0
```

### "Sketch too large"
```bash
# Production Build verwenden (optimiert)
pio run -e esp8266_production -t upload
```

### Web-Interface lädt nicht
```bash
# 1. Serial Monitor öffnen
pio device monitor -b 115200

# 2. ESP8266 neustarten
# 3. Logs prüfen auf Fehler

# 4. Neu flashen
pio run -e esp8266_debug --target clean
pio run -e esp8266_debug -t upload
```

### Passwort vergessen
```bash
# Über Serial Monitor:
set default all
save
reset

# Dann mit Standard-Config neu konfigurieren
```

---

## 📚 Weitere Dokumentation

- **Detailliert**: `PLATFORMIO_WEBUI_GUIDE.md`
- **Bridge Mode**: `BRIDGE_MODE.md`
- **Implementierung**: `BRIDGE_MODE_IMPLEMENTATION.md`
- **Troubleshooting**: `BRIDGE_MODE.md` (FAQ-Sektion)

---

## ⚡ Build-Varianten

```bash
# Debug (schnell, mit Debugging)
pio run -e esp8266_debug

# Release (optimiert, kleine Größe)
pio run -e esp8266_release

# Production (volle Features)
pio run -e esp8266_production

# Fast (sehr schnell, Entwicklung)
pio run -e esp8266_fast
```

---

## 🎯 Nächste Schritte

1. ✅ Firmware bauen und flashen
2. ✅ Web-Interface öffnen
3. ✅ WiFi konfigurieren
4. ✅ Bridge/NAT Mode wählen
5. ✅ Tuning-Regler anpassen
6. ✅ Einstellungen speichern
7. ✅ Im Serial Monitor Status kontrollieren

---

**Viel Erfolg beim Bauen! 🚀**

Bei Problemen: Siehe FAQ und Troubleshooting in der vollständigen Dokumentation.
