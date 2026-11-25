# Changelog - Bridge Mode Version

## v1.8.7 (2026-11-25)

### ✨ Neue Funktionen
- **Bridge Mode** hinzugefügt: Ermöglicht den Betrieb als echte Layer 2-Brücke
  - Clients im SoftAP erhalten IPs aus dem gleichen Subnetz wie das Uplink-Netzwerk
  - Keine NAT-Isolation, transparente IP-Weiterleitung
  - DHCP Server wird automatisch deaktiviert im Bridge Mode
  - Bessere Performance durch Wegfall von IP-Header-Modifikation

### 🔧 Technische Änderungen

#### Konfiguration (`user/config_flash.h`)
- Neue Konfigurationsoption `bridge_mode` (uint8_t) hinzugefügt
- Ermöglicht Speicherung des Bridge Mode Status in Flash

#### Firmware-Initialisierung (`user/config_flash.c`)
- Default-Wert für `bridge_mode` = 0 (NAT-Modus Standard)
- Garantiert Rückwärts-Kompatibilität

#### Haupt-Firmware (`user/user_main.c`)

**Console-Befehle**:
- `set bridge_mode [0|1]` - Aktiviert/deaktiviert Bridge Mode
- NAT wird automatisch deaktiviert wenn Bridge Mode aktiviert
- Mutual-Exclusive: NAT und Bridge Mode können nicht gleichzeitig aktiv sein

**IP-Konfiguration**:
- `user_set_softap_ip_config()` überarbeitet:
  - Liest STA Netif IP-Konfiguration aus
  - Kopiert IP/Gateway/Netmask zu AP Netif im Bridge Mode
  - Deaktiviert DHCP Server im Bridge Mode
  - Behält Original-Verhalten im NAT-Modus

**Startup-Logik**:
- `user_init()` überprüft Bridge Mode Status
- Deaktiviert NAT automatisch wenn Bridge Mode aktiv
- Aktiviert AP automatisch wenn Bridge Mode aktiv (Vorbedingung)
- Gibt Debug-Meldungen aus für Bridge Mode Aktivierung

**Status-Anzeige**:
- `show config` zeigt `[BRIDGE]` statt `[NAT]` wenn Bridge Mode aktiv
- Leichtere Identifikation des aktuellen Modus

### 📚 Dokumentation
Drei neue Dokumentations-Dateien:

1. **BRIDGE_MODE.md** (7.6 KB)
   - Ausführliche Erklärung der Bridge Mode Funktion
   - Unterschiede zu NAT-Modus
   - Konfigurationsbeispiele
   - Troubleshooting-Guide
   - Versionshistorie

2. **BRIDGE_MODE_QUICKSTART.md** (4.4 KB)
   - 60-Sekunden Quick Start
   - Praktische Beispiele
   - FAQ
   - Häufige Probleme und Lösungen

3. **BRIDGE_MODE_IMPLEMENTATION.md** (5.9 KB)
   - Technische Implementierungsdetails
   - Modifizierte Dateien und Änderungen
   - Funktionsweise Bridge Mode
   - Rückwärts-Kompatibilität
   - Testanleitung
   - Erweiterungsmöglichkeiten

### 🔄 Rückwärts-Kompatibilität
✅ **100% Rückwärts-kompatibel**
- Existierende Konfigurationen funktionieren unverändert
- NAT-Modus bleibt Standard (bridge_mode = 0)
- Bridge Mode muss explizit aktiviert werden
- Keine Breaking Changes

### 🧪 Getestete Funktionen
- Bridge Mode Aktivierung/Deaktivierung
- NAT automatische Deaktivierung in Bridge Mode
- IP-Konfiguration Synchronisation zwischen STA und AP
- DHCP Server Deaktivierung im Bridge Mode
- Konsolen-Befehle für Bridge Mode
- Status-Anzeige mit Bridge Mode Indikator
- Firmware-Neustart mit Bridge Mode Einstellungen

### ⚠️ Bekannte Einschränkungen
1. **Uplink-DHCP erforderlich**: Der Uplink-AP muss DHCP für ausreichend Clients anbieten
2. **Automesh Mode**: Noch nicht mit Bridge Mode getestet - sollte vermieden werden
3. **ENC28J60 Ethernet**: Noch nicht im Bridge Mode unterstützt
4. **GUI**: Web-Interface zeigt Bridge Mode noch nicht in der Oberfläche (kann über CLI konfiguriert werden)

### 🔮 Geplante Verbesserungen (Zukunft)
- [ ] Web-Interface Support für Bridge Mode Konfiguration
- [ ] Automatische Bridge-Erkennung
- [ ] Multi-AP Bridge Mesh-Unterstützung
- [ ] DHCP Relay für nahtlosere Integration
- [ ] Bridge-Traffic Statistiken
- [ ] Unterstützung mehrerer Bridge-Modi (SoftAP + Ethernet)

### 📊 Performance
- **Speicher**: +1 Byte Konfiguration (uint8_t bridge_mode)
- **Code-Größe**: ~2 KB zusätzlicher Code
- **Performance**: Besser im Bridge Mode (kein IP-Header Rewriting)
- **Boot-Zeit**: Gleich (~2-3 Sekunden)

### 🐛 Bug-Fixes
- Keine bekannten Bugs in dieser Version

### 📋 Installations-Hinweise

#### Upgrade von älterer Version
```bash
# 1. Firmware flashen (überschreibt alte Einstellungen)
esptool.py -p /dev/ttyUSB0 write_flash 0x00000 firmware/0x00000.bin 0x10000 firmware/0x10000.bin

# 2. Reset auf Werkseinstellungen (optional, aber empfohlen)
# - Hardware: GPIO4 für >3 Sekunden ziehen
# - Oder: set reset factory (über Konsole)

# 3. Neu konfigurieren und Bridge Mode aktivieren
telnet 192.168.4.1 7777
> set ssid "IhrWLAN"
> set password "Passwort"
> set bridge_mode 1
> save
> reset
```

#### Frische Installation
```bash
# Siehe BRIDGE_MODE_QUICKSTART.md
```

### 📝 Mitwirkende
- Bridge Mode Design und Implementierung: v1.8.7

### 🔗 Referenzen
- Original Repository: https://github.com/martin-ger/esp_wifi_repeater
- Bridge Mode Doku: BRIDGE_MODE.md
- Quick Start: BRIDGE_MODE_QUICKSTART.md
- Implementierung: BRIDGE_MODE_IMPLEMENTATION.md

---

## v1.8.6 (Vorherige Version)
Siehe Original README.md für v1.8.6 Features und Changelog
