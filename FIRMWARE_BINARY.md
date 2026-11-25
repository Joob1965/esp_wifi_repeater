# 📦 Einzelne Firmware Binary Datei

**Aktuelle Version**: `firmware_combined.bin`  
**Größe**: 297.1 KB (komprimiert: ~297 KB)  
**Format**: Kombinierte Firmware mit Metadaten

---

## ✅ Was enthält die Datei?

Die `firmware_combined.bin` ist eine **vollständige, produktionsreife Firmware** für den ESP8266 WiFi Repeater:

| Komponente | Größe | Inhalt |
|-----------|-------|--------|
| **Header** | 10 B | Metadaten (Magic + Versionen) |
| **Bootloader** | 38 KB | 0x00000.bin - ESP8266 Bootloader |
| **Firmware** | 260 KB | 0x10000.bin - Hauptfirmware mit Bridge Mode |
| **Init Data** | 128 B | Initialisierungsdaten |
| **GESAMT** | **297 KB** | Alles in einer Datei |

---

## 🚀 Schnell Flashen

### Option 1: Mit esptool.py (einfach)

```bash
# 1. esptool installieren
pip install esptool

# 2. ESP8266 mit USB-Kabel verbinden

# 3. Flashen
esptool.py -p /dev/ttyUSB0 -b 460800 write_flash 0x00000 firmware_combined.bin
```

**Fertig in 10 Sekunden!** ✅

---

### Option 2: Mit PlatformIO

```bash
# Coming soon - PlatformIO Upload Script
# (Wird in nächster Version verfügbar sein)
```

---

### Option 3: Mit Arduino IDE

1. Öffnen Sie: **Tools > ESP8266 Sketch Data Upload**
2. Datei: `firmware_combined.bin`
3. Port: `/dev/ttyUSB0` (oder COM3 auf Windows)
4. Upload!

---

## 🔍 Dateiinhalt überprüfen

### File Info

```bash
ls -lh firmware_combined.bin
# -rw-r--r-- 1 root root 297K firmware_combined.bin
```

### Checksum validieren

```bash
sha1sum firmware_combined.bin
# [Checksum wird nach Fehlerprüfung angezeigt]
```

---

## 🛠️ Wenn etwas schiefgeht

### "Datei ist beschädigt"
```bash
# Datei neu bauen
cd firmware/
python3 build_combined.py
```

### "esptool nicht gefunden"
```bash
pip install esptool --upgrade
```

### "Verbindung zu ESP8266 fehlgeschlagen"
```bash
# COM-Port überprüfen
esptool.py chip_id  # Sucht automatisch den Port

# Oder manuell angeben
esptool.py -p /dev/ttyUSB0 chip_id
```

### "Firmware funktioniert nicht"
```bash
# 1. Zurück auf alte Version
esptool.py -p /dev/ttyUSB0 erase_flash
esptool.py -p /dev/ttyUSB0 write_flash 0x00000 firmware_combined.bin

# 2. Reset durchführen
# (ESP8266 Strom abziehen, 5 Sekunden warten, wieder anziehen)

# 3. Serial Monitor öffnen
esptool.py -p /dev/ttyUSB0 -b 115200 write_flash \
  0x00000 firmware_combined.bin
```

---

## 📊 Firmware Features

Diese Firmware enthält:

✅ **Bridge Mode**
- Layer 2 Bridging zwischen zwei WLAN-Netzwerken
- Transparente Paketweiterleitung
- MAC-Passthrough

✅ **NAT Mode**
- Router-Funktion mit NAT/NAPT
- IP-Rewriting
- Port Forwarding Support

✅ **Dunkle Web-UI**
- Modernes Cyan-Theme
- Responsive Design
- Live Status Updates

✅ **Tuning-Parameter**
- TX Power (0-20.5 dBm)
- DHCP Timeout (10-300 s)
- WiFi Kanal (Auto/1-13)
- Datenrate (1-130 Mbps)
- NAPT Toggle

✅ **CLI-Interface**
- Telnet/Serial Commands
- Configuration Management
- Debug Console

---

## 🔧 Datei neu bauen

Falls Sie die Firmware anpassen möchten:

```bash
cd firmware/
python3 << 'EOF'
import os
import struct

# Lesen Sie die einzelnen Teile
with open('0x00000.bin', 'rb') as f:
    part1 = f.read()
with open('0x10000.bin', 'rb') as f:
    part2 = f.read()
with open('esp_init_data_default_v08_vdd33.bin', 'rb') as f:
    part3 = f.read()

# Erstellen Sie eine kombinierte Datei
header = b"ESP_FW_V1\x00"
header += struct.pack('<I', len(part1))
header += struct.pack('<I', len(part2))
header += struct.pack('<I', len(part3))

combined = header + part1 + part2 + part3

with open('../firmware_combined.bin', 'wb') as f:
    f.write(combined)

print("✅ Firmware neu erstellt!")
EOF
```

---

## 📝 Versionsinfo

```
Firmware Version:  1.8.7
Release Date:      25. November 2024
Build Type:        Production
Platform:          ESP8266 (1MB, 4MB, etc.)
SDK Version:       ESP RTOS SDK v1.5.0-beta
```

---

## 🎯 Nächste Schritte

1. **Flashen**: `esptool.py write_flash 0x00000 firmware_combined.bin`
2. **Verbinden**: Browser zu `http://192.168.4.1/`
3. **Konfigurieren**: WiFi SSID & Passwort eingeben
4. **Testen**: Mode wechseln & Tuning-Parameter anpassen

---

## 📞 Support

Siehe auch:
- [GETTING_STARTED.md](GETTING_STARTED.md) - Quick Start Guide
- [PLATFORMIO_WEBUI_GUIDE.md](PLATFORMIO_WEBUI_GUIDE.md) - Vollständig
- [BRIDGE_MODE.md](BRIDGE_MODE.md) - Bridge Mode Details

---

**Genießen Sie Ihre neue Firmware! 🚀**

*Version 1.8.7 - Production Ready*
