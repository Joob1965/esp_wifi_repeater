# 🔌 Wemos LoLin NodeMCU v3 - Firmware Upload Guide

**Gerät**: Wemos LoLin NodeMCU v3 (von wemos.cc)  
**Chip**: ESP8266  
**Flash**: 4 MB  
**USB**: Micro-USB (CH340 Chip)

---

## ✅ Vorbereitungen

### Hardware-Anforderungen

- ✅ **Wemos LoLin NodeMCU v3**
- ✅ **Micro-USB Kabel** (Standard, oft mitgeliefert)
- ✅ **Computer** mit Linux/macOS/Windows
- ✅ **esptool.py** installiert (siehe unten)

### Software-Anforderungen

```bash
# 1. esptool installieren (einmalig)
pip install esptool

# 2. Firmware vorhanden
# firmware_combined.bin (297.1 KB)

# 3. Upload-Script vorhanden
# upload_firmware.py oder upload_firmware.sh
```

---

## 🔌 Hardware-Verbindung

### Schritt 1: USB-Kabel vorbereiten

```
Wemos LoLin NodeMCU v3
┌─────────────────────────┐
│                         │
│  [Micro-USB Port]       │
│        ║                │
└─────────────────────────┘
         ║
    USB-Kabel (Micro-USB)
         ║
  ┌──────────────┐
  │ Computer     │
  └──────────────┘
```

### Schritt 2: NodeMCU anschließen

1. **Micro-USB Kabel** in die NodeMCU stecken
2. **Andere Ende** in USB-Port des Computers stecken
3. **Rote LED** auf der NodeMCU sollte leuchten (Stromversorgung)

### Schritt 3: Treiber prüfen

**Windows:**
- Öffnen Sie: Device Manager (devmgmt.msc)
- Suchen Sie nach: "CH340" oder "Serial Port"
- Falls nicht vorhanden: CH340 Treiber installieren
  - Download: https://github.com/WCHSoftware/ch341ser
  - Oder: https://www.wemos.cc/en/latest/ch340_driver.html

**macOS/Linux:**
- Normalerweise automatisch erkannt
- Keine zusätzlichen Treiber nötig

### Schritt 4: Port überprüfen

**Linux/macOS:**

```bash
# Verfügbare Ports auflisten
ls /dev/tty* | grep -E "USB|ACM|serial"

# Oder direkter:
ls /dev/ttyUSB*  # Typisch für Linux
ls /dev/ttyACM*  # Auch möglich
ls /dev/tty.usb* # macOS
```

**Windows (PowerShell):**

```powershell
# COM-Ports auflisten
Get-WmiObject win32_serialport | Select-Object Name

# Oder einfach:
# Device Manager → Ports (COM & LPT)
# Suchen Sie nach "COM3", "COM4", "COM5", etc.
```

---

## 🚀 Firmware Upload

### Methode 1: Python-Script (Empfohlen) ✨

**Automatisch (Port wird erkannt):**

```bash
cd /root/esp_wifi_repeater
python3 upload_firmware.py
```

Das Script wird:
1. ✅ Port automatisch erkennen
2. ✅ Interaktiv nachfragen
3. ✅ Optional Backup erstellen
4. ✅ Firmware hochladen
5. ✅ Verifikation durchführen
6. ✅ NodeMCU neu starten

**Mit benutzerdefinierten Port (falls nötig):**

```bash
# Linux/macOS
python3 upload_firmware.py --port /dev/ttyUSB0

# Windows
python3 upload_firmware.py --port COM3
```

### Methode 2: Bash-Script (für Linux/macOS)

```bash
# Automatisch
./upload_firmware.sh

# Mit Port-Angabe
./upload_firmware.sh 460800 /dev/ttyUSB0
```

### Methode 3: esptool direkt

**Linux/macOS:**

```bash
# Port /dev/ttyUSB0 erkennen
esptool.py chip_id

# Firmware hochladen
esptool.py -p /dev/ttyUSB0 -b 460800 write_flash 0x00000 firmware_combined.bin

# Mit Verifikation
esptool.py -p /dev/ttyUSB0 -b 460800 write_flash 0x00000 firmware_combined.bin
esptool.py -p /dev/ttyUSB0 verify_flash 0x00000 firmware_combined.bin
```

**Windows:**

```bash
# Port COM3 (Beispiel) erkunden
esptool.py -p COM3 chip_id

# Firmware hochladen
esptool.py -p COM3 -b 460800 write_flash 0x00000 firmware_combined.bin
```

---

## 📊 Upload-Fortschritt

Während des Uploads sehen Sie ungefähr so aus:

```
Connecting...
Detecting chip type... ESP8266
Chip is esp8266 (revision 0)

Uploading stub...
Running stub...
Stub running...

Changing baud rate to 460800
Changed.

Writing at 0x00000... (5%)
Writing at 0x00000... (10%)
Writing at 0x00000... (15%)
...
Writing at 0x00000... (95%)
Writing at 0x00000... (100%)
Wrote 304202 bytes at address 0x0000c000 in 10.5 seconds

Leaving...
Hard resetting via RTS pin...
```

**Typische Upload-Zeit**: ~10 Sekunden bei 460800 Baud

---

## ✅ Nach dem Upload

### 1. Bestätigung

```
✅ Firmware erfolgreich hochgeladen!
✅ Upload verifiziert
✅ ESP8266 ist neu gestartet
```

### 2. Web-Interface öffnen

Nach ~5 Sekunden ist die NodeMCU bereit:

```
Öffnen Sie im Browser:
http://192.168.4.1/
oder
http://esp8266.local/

Standard-Login:
  Username: (leer)
  Passwort: (leer)
```

### 3. WiFi konfigurieren

Im Web-Interface:

1. **Uplink WiFi SSID** eingeben (zu bridgendes Netzwerk)
2. **Uplink Passwort** eingeben
3. **AP SSID** eingeben (Hotspot der NodeMCU)
4. **AP Passwort** eingeben
5. **Betriebsmodus** wählen:
   - 🌉 Bridge Mode (empfohlen für Bridging)
   - 🔀 NAT Mode (für Router-Funktion)
6. **"Speichern & Neu Starten"** klicken

### 4. Bestätigung

Nach Neustart:
- 🟢 Grüne LED blinkt (WiFi-Verbindung aktiv)
- 📱 Hotspot "NodeMCU" oder Ihr AP-Name sichtbar
- 🌐 Web-Interface erreichbar

---

## 🆘 Häufige Probleme

### "Port nicht erkannt"

**Problem:** `❌ Konnte keinen Port finden!`

**Lösungen:**

1. **Kabel überprüfen:**
   - Ist das USB-Kabel wirklich angeschlossen?
   - Rote LED leuchtet?
   - Anderes USB-Kabel versuchen

2. **Treiber überprüfen:**
   - Windows: CH340 Treiber installieren
   - macOS/Linux: `dmesg | tail` für Logs

3. **Port manuell angeben:**
   ```bash
   python3 upload_firmware.py --port /dev/ttyUSB0
   # oder auf Windows:
   python3 upload_firmware.py --port COM3
   ```

4. **Port-Nummer herausfinden:**
   ```bash
   # Linux/macOS
   ls -la /dev/tty* | grep -E "USB|ACM"
   
   # Windows PowerShell
   Get-WmiObject win32_serialport | Select-Object Name
   ```

### "Timeout beim Upload"

**Problem:** `Timeout occurred while waiting for packet header`

**Lösungen:**

1. **Niedrigere Baudrate:**
   ```bash
   esptool.py -p /dev/ttyUSB0 -b 115200 write_flash 0x00000 firmware_combined.bin
   ```

2. **NodeMCU neu starten:**
   - USB-Kabel abziehen
   - 5 Sekunden warten
   - Wieder anstecken

3. **Boot-Modus versuchen:**
   - Halten Sie **GPIO0** (ist Pin G0) auf **LOW**
   - Oder drücken Sie **D8** Taste bei einigen Versionen
   - Dann Upload versuchen

### "Datei nicht gefunden"

**Problem:** `firmware_combined.bin nicht gefunden`

**Lösung:**

```bash
# Ins richtige Verzeichnis wechseln
cd /root/esp_wifi_repeater

# Oder Pfad angeben
python3 upload_firmware.py --firmware /root/esp_wifi_repeater/firmware_combined.bin
```

### "Verifikation fehlgeschlagen"

**Problem:** `Verifikation fehlgeschlagen`

**Lösungen:**

1. **Verifikation deaktivieren:**
   ```bash
   python3 upload_firmware.py --no-verify
   ```

2. **Neu versuchen mit niedrigerer Baudrate:**
   ```bash
   esptool.py -p /dev/ttyUSB0 -b 115200 write_flash 0x00000 firmware_combined.bin
   ```

3. **Flash neu beschreiben:**
   ```bash
   # Flash komplett löschen
   esptool.py -p /dev/ttyUSB0 erase_flash
   
   # Neu flashen
   esptool.py -p /dev/ttyUSB0 -b 460800 write_flash 0x00000 firmware_combined.bin
   ```

### "Firmware funktioniert nicht"

**Problem:** Web-Interface nicht erreichbar, NodeMCU startet nicht

**Lösungen:**

1. **Reset durchführen:**
   - USB ausstecken
   - 10 Sekunden warten
   - Wieder einstecken
   - **Reset-Taste** drücken (falls vorhanden)

2. **Alte Firmware wiederherstellen:**
   ```bash
   # Backup flashen (falls Sie eines erstellt haben)
   esptool.py -p /dev/ttyUSB0 -b 460800 write_flash 0x00000 firmware_backup_*.bin
   ```

3. **Komplett neu:**
   ```bash
   # Flash löschen
   esptool.py -p /dev/ttyUSB0 erase_flash
   
   # Neu flashen
   esptool.py -p /dev/ttyUSB0 -b 460800 write_flash 0x00000 firmware_combined.bin
   ```

4. **Serial Monitor öffnen:**
   ```bash
   esptool.py -p /dev/ttyUSB0 -b 115200 read_flash 0x00000
   
   # Suchen Sie nach Fehlern in den Boot-Logs
   ```

---

## 📋 Checkliste

### Vor dem Upload

- [ ] Wemos LoLin NodeMCU v3 ist mit USB-Kabel verbunden
- [ ] Rote LED leuchtet (Stromversorgung)
- [ ] USB-Treiber ist installiert (CH340)
- [ ] esptool.py ist installiert: `pip install esptool`
- [ ] `firmware_combined.bin` Datei vorhanden
- [ ] `upload_firmware.py` oder `upload_firmware.sh` vorhanden

### Während Upload

- [ ] Kabel nicht berühren/bewegen
- [ ] Computer nicht in Standby gehen lassen
- [ ] Warten Sie bis zum Abschluss (ca. 10-15 Sekunden)

### Nach Upload

- [ ] Neustart abwarten (~5 Sekunden)
- [ ] Rote LED leuchtet
- [ ] Browser öffnen: http://192.168.4.1/
- [ ] Web-Interface ist erreichbar
- [ ] WiFi-Einstellungen vornehmen
- [ ] "Speichern & Neu Starten" klicken

---

## 🔧 Erweiterte Optionen

### Backup vor Upload erstellen

```bash
# Komplettes Flash-Backup (1 MB)
esptool.py -p /dev/ttyUSB0 -b 115200 read_flash 0x00000 0x100000 backup.bin

# Oder schneller (nur Firmware, 324 KB)
esptool.py -p /dev/ttyUSB0 -b 460800 read_flash 0x00000 0x50000 backup_firmware.bin
```

### Alte Firmware wiederherstellen

```bash
esptool.py -p /dev/ttyUSB0 -b 460800 write_flash 0x00000 backup.bin
```

### Firmware-Infos anzeigen

```bash
# Chip-Info
esptool.py -p /dev/ttyUSB0 chip_id

# Flash-Größe
esptool.py -p /dev/ttyUSB0 flash_id

# Flash-Daten lesen
esptool.py -p /dev/ttyUSB0 read_flash 0x00000 256 output.bin
```

---

## 📚 Zusätzliche Ressourcen

| Datei | Zweck |
|-------|-------|
| [DEPLOY_FIRMWARE.md](DEPLOY_FIRMWARE.md) | Allgemeiner Deployment-Guide |
| [FIRMWARE_BINARY.md](FIRMWARE_BINARY.md) | Firmware-Datei Details |
| [GETTING_STARTED.md](GETTING_STARTED.md) | 5-Min Quick Start |
| [PLATFORMIO_WEBUI_GUIDE.md](PLATFORMIO_WEBUI_GUIDE.md) | Web-UI Dokumentation |

---

## 🎯 Nächste Schritte

1. ✅ Verbinden Sie die Wemos LoLin NodeMCU v3 mit USB
2. ✅ Führen Sie aus: `python3 upload_firmware.py`
3. ✅ Folgen Sie den Anweisungen im Script
4. ✅ Öffnen Sie: http://192.168.4.1/ im Browser
5. ✅ Konfigurieren Sie WiFi-Einstellungen
6. ✅ Genießen Sie die Firmware! 🚀

---

**Happy Flashing! 🎉**

*Wemos LoLin NodeMCU v3 - ESP8266 WiFi Repeater v1.8.7*
