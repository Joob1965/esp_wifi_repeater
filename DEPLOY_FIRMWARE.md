# 🚀 Firmware Deployment - Einzelne Binär-Datei

**Aktuelle Version**: 1.8.7  
**Firmware-Datei**: `firmware_combined.bin` (297 KB)  
**Upload-Zeit**: ~10 Sekunden  
**Status**: ✅ Production Ready

---

## ⚡ Schnellstart (3 Schritte)

### Schritt 1: esptool installieren (einmalig)

```bash
pip install esptool
```

### Schritt 2: ESP8266 verbinden

Verbinden Sie den ESP8266 mit dem Computer via USB-Kabel

### Schritt 3: Firmware flashen

**Option A: Mit Python-Script (einfachste Methode)**

```bash
python3 upload_firmware.py
```

Das Script macht alles automatisch:
- ✅ Erkennt den COM-Port
- ✅ Erstellt optional ein Backup
- ✅ Lädt die Firmware
- ✅ Verifiziert den Upload
- ✅ Startet den ESP8266 neu

**Option B: Mit Bash-Script**

```bash
./upload_firmware.sh
```

**Option C: Mit esptool direkt**

```bash
esptool.py -p /dev/ttyUSB0 -b 460800 write_flash 0x00000 firmware_combined.bin
```

**Fertig! 🎉**

---

## 📱 Nach dem Upload

### Zugriff auf das Web-Interface

Öffnen Sie im Browser:

```
http://192.168.4.1/
```

Oder nutzen Sie mDNS:

```
http://esp8266.local/
```

### Erste Konfiguration

1. **WiFi Verbindung konfigurieren:**
   - Uplink SSID eingeben (zu verbindenes Netzwerk)
   - Uplink Passwort eingeben
   - AP SSID eingeben (Hotspot)
   - AP Passwort eingeben

2. **Betriebsmodus wählen:**
   - 🌉 Bridge Mode - Transparentes Bridging
   - 🔀 NAT Mode - Router-Funktion

3. **Feineinstellungen anpassen:**
   - TX Power: 0-20.5 dBm
   - WiFi Kanal: Auto oder 1-13
   - DHCP Timeout: 10-300 Sekunden
   - Datenrate: 1-130 Mbps
   - NAPT: Ein/Aus (NAT-Mode nur)

4. **Speichern und Neustart:**
   - Klick auf "Speichern & Neu Starten"
   - ESP8266 startet neu und aktiviert Einstellungen

---

## 🛠️ Upload-Scripts im Detail

### Python-Script (upload_firmware.py)

**Vorteile:**
- ✅ Automatische Port-Erkennung
- ✅ Interaktive Bestätigung
- ✅ Backup-Option
- ✅ Verifikation nach Upload
- ✅ Farb-Ausgabe
- ✅ Fehlermeldungen mit Hilfe

**Verwendung:**

```bash
# Einfach starten
python3 upload_firmware.py

# Mit benutzerdefinierten Optionen
python3 upload_firmware.py --port /dev/ttyUSB0 --baud 460800

# Ohne Backup-Option
python3 upload_firmware.py --no-backup

# Ohne Verifikation
python3 upload_firmware.py --no-verify

# Firmware-Datei angeben
python3 upload_firmware.py --firmware my_firmware.bin
```

### Bash-Script (upload_firmware.sh)

**Vorteile:**
- ✅ Keine Python-Dependencies
- ✅ Portable (Linux/macOS)
- ✅ Alte Shell-Skripte kompatibel

**Verwendung:**

```bash
# Einfach starten
./upload_firmware.sh

# Mit benutzerdefinierten Parametern
./upload_firmware.sh 460800 /dev/ttyUSB0

# Format: ./upload_firmware.sh [BAUD] [PORT]
```

### esptool.py direkt

**Vorteile:**
- ✅ Maximale Kontrolle
- ✅ Skriptbar
- ✅ Alle Features

**Verwendung:**

```bash
# Windows (COM3)
esptool.py -p COM3 -b 460800 write_flash 0x00000 firmware_combined.bin

# Linux
esptool.py -p /dev/ttyUSB0 -b 460800 write_flash 0x00000 firmware_combined.bin

# macOS
esptool.py -p /dev/tty.usbserial-0 -b 460800 write_flash 0x00000 firmware_combined.bin

# Backup erstellen
esptool.py -p /dev/ttyUSB0 -b 115200 read_flash 0x00000 0x100000 backup.bin

# Alte Firmware flashen
esptool.py -p /dev/ttyUSB0 -b 460800 write_flash 0x00000 backup.bin

# Flash komplett löschen
esptool.py -p /dev/ttyUSB0 erase_flash
```

---

## 🔍 Port-Erkennung

### Linux

```bash
# Verfügbare Ports auflisten
ls /dev/tty* | grep -E "USB|ACM"

# Typisch: /dev/ttyUSB0 oder /dev/ttyACM0
```

### macOS

```bash
# Verfügbare Ports auflisten
ls /dev/tty.* | grep -E "usb|usbserial"

# Typisch: /dev/tty.usbserial-14130 oder /dev/tty.wchusbserial1410
```

### Windows

```bash
# PowerShell
Get-WmiObject win32_serialport | Select-Object Name

# Typisch: COM3, COM4, COM5
```

---

## 🔄 Backup & Restore

### Backup der aktuellen Firmware erstellen

```bash
# Liest kompletten Flash (1 MB)
esptool.py -p /dev/ttyUSB0 -b 115200 read_flash 0x00000 0x100000 my_backup.bin

# Oder schneller (nur 324 KB)
esptool.py -p /dev/ttyUSB0 -b 460800 read_flash 0x00000 0x50000 my_backup.bin
```

### Alte Firmware zurückschreiben

```bash
# Flash löschen
esptool.py -p /dev/ttyUSB0 erase_flash

# Alte Version flashen
esptool.py -p /dev/ttyUSB0 -b 460800 write_flash 0x00000 my_backup.bin
```

---

## 🆘 Häufige Probleme & Lösungen

### "esptool.py: command not found"

```bash
# Installieren Sie esptool:
pip install esptool

# Oder verwenden Sie Python-Version:
python3 -m esptool ...
```

### "Device COM3 not found" (Windows)

1. **Treiber installieren:**
   - CH340: https://github.com/WCHSoftware/ch341ser
   - CP2102: https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers

2. **ESP8266 Neu starten:**
   - USB-Kabel abziehen
   - 10 Sekunden warten
   - USB-Kabel wieder anstecken

3. **Andere Ports versuchen:**
   ```bash
   esptool.py -p COM4 chip_id
   esptool.py -p COM5 chip_id
   ```

### "Timeout occurred while waiting for packet header"

**Problem:** Falsche Baudrate oder Verbindung

**Lösungen:**
```bash
# Versuchen Sie eine niedrigere Baudrate
esptool.py -p /dev/ttyUSB0 -b 115200 write_flash 0x00000 firmware_combined.bin

# Oder prüfen Sie die Verbindung
esptool.py -p /dev/ttyUSB0 -b 115200 chip_id

# ESP8266 im Bootloader-Modus starten:
# 1. Halten Sie GPIO0 gedrückt
# 2. Klicken Sie Reset/RST
# 3. Lassen Sie GPIO0 los
# 4. Versuchen Sie Upload erneut
```

### "Firmware funktioniert nicht nach Update"

1. **ESP8266 hart zurücksetzen:**
   ```bash
   esptool.py -p /dev/ttyUSB0 -b 115200 erase_flash
   esptool.py -p /dev/ttyUSB0 -b 460800 write_flash 0x00000 firmware_combined.bin
   ```

2. **Serial Monitor öffnen:**
   ```bash
   esptool.py -p /dev/ttyUSB0 -b 115200 read_flash 0x00000
   ```

3. **Boot-Logs beobachten:**
   - Suchen Sie nach "Exception" oder "Hard fault"
   - Eventuell muss die Firmware neu kompiliert werden

### "Verifikation fehlgeschlagen"

```bash
# Versuchen Sie mit niedrigerer Baudrate:
esptool.py -p /dev/ttyUSB0 -b 115200 write_flash 0x00000 firmware_combined.bin

# Oder deaktivieren Sie Hardware-Flow-Control
# (Je nach USB-Serial Adapter)
```

---

## 📊 Upload Geschwindigkeit

| Baudrate | Firmware-Größe | Zeit |
|----------|---|---|
| 115200 | 297 KB | ~26 Sekunden |
| 230400 | 297 KB | ~13 Sekunden |
| 460800 | 297 KB | ~7 Sekunden |
| 921600 | 297 KB | ~4 Sekunden |

**Standard:** 460800 (guter Kompromiss)

---

## 📂 Dateistruktur

```
/root/esp_wifi_repeater/
├── firmware_combined.bin       ← Die einzelne .bin Datei (297 KB)
├── upload_firmware.py          ← Python Upload-Script
├── upload_firmware.sh          ← Bash Upload-Script
├── FIRMWARE_BINARY.md          ← Diese Doku
├── firmware/
│   ├── 0x00000.bin            ← Bootloader
│   ├── 0x10000.bin            ← Firmware
│   └── esp_init_data_*.bin    ← Init-Daten
└── ...
```

---

## 🚀 Automatisiertes Deployment

### In CI/CD Pipeline

```bash
#!/bin/bash
# Für automatisches Flashen in Tests/Deployment

PORT=${1:-/dev/ttyUSB0}
FIRMWARE="firmware_combined.bin"

# Flashen ohne Interaktion
esptool.py -p "$PORT" -b 460800 write_flash 0x00000 "$FIRMWARE"

# Verifikation
esptool.py -p "$PORT" -b 115200 verify_flash 0x00000 "$FIRMWARE"

# Neustart
esptool.py -p "$PORT" hard_reset
```

### Batch-Flashen (mehrere Geräte)

```bash
#!/bin/bash
# Flashe mehrere ESP8266 nacheinander

DEVICES=("/dev/ttyUSB0" "/dev/ttyUSB1" "/dev/ttyUSB2")

for device in "${DEVICES[@]}"; do
    echo "Flashing $device..."
    esptool.py -p "$device" -b 460800 write_flash 0x00000 firmware_combined.bin
    echo "✅ $device done"
    sleep 2
done
```

---

## 📖 Weitere Ressourcen

- [esptool.py Dokumentation](https://github.com/espressif/esptool)
- [ESP8266 Dokumentation](https://docs.espressif.com/projects/esp8266-rtos-sdk/)
- [Getting Started Guide](GETTING_STARTED.md)
- [Web UI Dokumentation](PLATFORMIO_WEBUI_GUIDE.md)
- [Bridge Mode Dokumentation](BRIDGE_MODE.md)

---

## 🎯 Nächste Schritte nach dem Upload

1. ✅ Firmware auf ESP8266 flashen
2. 📱 Browser zu http://192.168.4.1/ öffnen
3. 📡 WiFi-Netzwerk auswählen
4. 🔧 Betriebsmodus (Bridge/NAT) wählen
5. ⚙️ Feineinstellungen anpassen
6. 💾 Speichern und Neustart
7. 🎉 Genießen Sie die neue Firmware!

---

**Happy Flashing! 🚀**

*Version 1.8.7 - Production Ready - 25. November 2024*
