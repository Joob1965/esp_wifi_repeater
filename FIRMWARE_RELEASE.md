# 📦 Firmware Release v1.8.7 - Einzelne .bin Datei

**Release Date**: 25. November 2024  
**Version**: 1.8.7  
**Status**: ✅ Production Ready

---

## 🎯 Release-Highlights

### ✨ Neue Features in dieser Version

- **Einzelne .bin Datei** (`firmware_combined.bin`) - 297 KB
- **Python Upload-Tool** (`upload_firmware.py`) - automatische Port-Erkennung
- **Bash Upload-Script** (`upload_firmware.sh`) - für Shell-Nutzzer
- **Firmware-Verifikation** - Checksums und Integritätsprüfung
- **Erweiterte Dokumentation** - Deployment & Troubleshooting

---

## 📥 Download & Installation

### Die Firmware-Datei

```bash
# Datei: firmware_combined.bin
# Größe: 297.1 KB
# SHA256: 3475a29b93e8d9cd1958b142375572dc15fb0bcbf9bcd21fc2f79864198c2711
```

### Schnelle Installation (3 Schritte)

```bash
# 1. esptool installieren
pip install esptool

# 2. Firmware flashen
python3 upload_firmware.py

# 3. Browser öffnen
# Zugriff: http://192.168.4.1/
```

**Fertig in 10 Minuten!** ✅

---

## 🔧 Enthaltene Tools

| Tool | Format | Zweck | Plattform |
|------|--------|-------|-----------|
| `firmware_combined.bin` | Binär | Einzelne Firmware-Datei | Alle |
| `upload_firmware.py` | Python 3 | Automatisches Flashen | Alle |
| `upload_firmware.sh` | Bash | Shell-basiert | Linux/macOS |
| `create_checksums.py` | Python | Integritätsprüfung | Alle |

---

## 📊 Firmware-Details

### Größe & Speicher

```
Bootloader:        37.2 KB (0x00000)
Firmware:          259.8 KB (0x10000)
Init Data:         0.1 KB
─────────────────────────
Gesamt:            297.1 KB (komprimiert)
```

### Hardware-Anforderungen

- **ESP8266** (alle Varianten)
- **Flash-Größe**: Mindestens 1 MB
- **RAM**: 160 KB (für Laufzeit)

### Features

✅ **Bridge Mode** - Layer 2 Bridging  
✅ **NAT Mode** - Router-Funktion  
✅ **Web UI** - Modernes Dunkles Interface  
✅ **Tuning-Parameter** - 5 einstellbare Parameter  
✅ **CLI-Interface** - Telnet/Serial Commands  

---

## 🚀 Upload-Methoden

### Methode 1: Python (Empfohlen)

```bash
python3 upload_firmware.py
# ✅ Automatische Port-Erkennung
# ✅ Interaktiv & benutzerfreundlich
# ✅ Backup optional
# ✅ Verifikation nach Upload
```

### Methode 2: Bash-Script

```bash
./upload_firmware.sh
# ✅ Keine Python-Dependencies
# ✅ Portable
```

### Methode 3: esptool direkt

```bash
esptool.py -p /dev/ttyUSB0 -b 460800 write_flash 0x00000 firmware_combined.bin
# ✅ Maximale Kontrolle
# ✅ Skriptbar
```

---

## 🔒 Sicherheit & Integrität

### Checksum-Verifikation

```bash
# SHA256 Hashes:

firmware_combined.bin:
  3475a29b93e8d9cd1958b142375572dc15fb0bcbf9bcd21fc2f79864198c2711

firmware/0x00000.bin:
  280724f195026ef8ad184d1104dc4db332f5024ddbede061e1add970bc52af03

firmware/0x10000.bin:
  d53d497fdef40de2aba22cf1fc2bf97112441dfeb435e7d4624575d413aaaf53
```

### Upload-Verifikation

```bash
# Automatisch mit Python-Script
python3 upload_firmware.py --no-verify=false

# Oder manuell
esptool.py -p /dev/ttyUSB0 verify_flash 0x00000 firmware_combined.bin
```

---

## 📚 Dokumentation

| Datei | Zweck |
|-------|-------|
| [DEPLOY_FIRMWARE.md](DEPLOY_FIRMWARE.md) | Installation & Troubleshooting |
| [FIRMWARE_BINARY.md](FIRMWARE_BINARY.md) | Datei-Details & Format |
| [GETTING_STARTED.md](GETTING_STARTED.md) | 5-Min Quick Start |
| [PLATFORMIO_WEBUI_GUIDE.md](PLATFORMIO_WEBUI_GUIDE.md) | Vollständige Dokumentation |

---

## 🛠️ Troubleshooting

### "Port nicht gefunden"

```bash
# Verfügbare Ports anzeigen
esptool.py chip_id

# Mit spezifischem Port
esptool.py -p /dev/ttyUSB0 chip_id
```

### "Verifikation fehlgeschlagen"

```bash
# Mit niedrigerer Baudrate versuchen
esptool.py -p /dev/ttyUSB0 -b 115200 write_flash 0x00000 firmware_combined.bin
```

### "Firmware funktioniert nicht"

```bash
# Flash komplett löschen
esptool.py -p /dev/ttyUSB0 erase_flash

# Neu flashen
esptool.py -p /dev/ttyUSB0 -b 460800 write_flash 0x00000 firmware_combined.bin
```

---

## 📋 Checkliste vor dem Upload

- [ ] ESP8266 mit USB-Kabel verbunden
- [ ] USB-Treiber installiert (CH340, CP2102, etc.)
- [ ] esptool.py installiert: `pip install esptool`
- [ ] `firmware_combined.bin` Datei vorhanden
- [ ] Upload-Script vorhanden: `upload_firmware.py` oder `upload_firmware.sh`

---

## ✅ Nach dem Upload

1. ✅ Öffnen Sie: `http://192.168.4.1/`
2. ✅ Oder: `http://esp8266.local/`
3. ✅ Konfigurieren Sie WiFi-Einstellungen
4. ✅ Wählen Sie Bridge oder NAT Mode
5. ✅ Passen Sie Tuning-Parameter an
6. ✅ Klicken Sie "Speichern & Neu Starten"

---

## 🔄 Versionsverlauf

| Version | Datum | Größe | Features |
|---------|-------|-------|----------|
| **1.8.7** | 25.11.2024 | 297 KB | Einzelne .bin, Upload-Tools |
| 1.8.6 | 24.11.2024 | 300 KB | Tuning-Regler |
| 1.8.5 | 23.11.2024 | 295 KB | Dark Web UI |
| 1.8.0 | 22.11.2024 | 280 KB | Bridge Mode |

---

## 📞 Support & Feedback

**Siehe auch:**
- [GitHub Issues](https://github.com/Joob1965/esp_wifi_repeater/issues)
- [Dokumentation](PLATFORMIO_WEBUI_GUIDE.md)
- [Quick Start](GETTING_STARTED.md)

---

## 📄 Lizenz

Siehe [LICENSE](LICENSE) Datei im Repository

---

## 🙏 Danksagungen

**Version 1.8.7** wurde mit ❤️ entwickelt mit:

- Professionelles PlatformIO Build-System
- Modernes Dunkles Web-Interface
- Firmware Tuning-Regler
- Umfangreiche Dokumentation
- Automatische Upload-Tools

---

**🚀 Viel Erfolg beim Flashen und Genießen Sie die neue Firmware!**

*ESP8266 WiFi Repeater - Bridge & NAT - v1.8.7*  
*Production Ready - 25. November 2024*
