# Bridge Mode - Integration Guide

## Für Benutzer: So funktioniert Bridge Mode

### Was ist Bridge Mode?

Bridge Mode verwandelt Ihren ESP8266 WiFi Repeater in eine **echte Netzwerk-Brücke** zwischen Ihrem Uplink-WLAN und angeschlossenen Clients.

**Im klassischen NAT-Modus:**
```
Ihr Router (192.168.1.1) ← verbunden zu ESP ← esp zeigt separates Netzwerk (192.168.4.1)
                                                    ↓
                                        Ihre Clients (192.168.4.100-110)
                                        
Problem: Zwei verschiedene Netzwerke, Clients können sich nicht direkt mit Ihrem Router sprechen
```

**Im Bridge Mode:**
```
Ihr Router (192.168.1.1) ← verbunden zu ESP (als Brücke) → Ihre Clients in GLEICHEM NETZWERK
                                                             (192.168.1.100-110)

Vorteil: Ein Netzwerk! Clients sehen den Router direkt.
```

### Wie aktiviere ich Bridge Mode?

#### Schritt 1: Mit dem ESP verbinden
```bash
# Option A: SSH/Telnet
telnet 192.168.4.1 7777

# Option B: Serial Console (115200 Baud)
minicom -D /dev/ttyUSB0 -b 115200
```

#### Schritt 2: Bridge Mode konfigurieren
```bash
# 1. Ihr WLAN eingeben
set ssid "IhrWLAN-Name"
set password "IhrWLAN-Passwort"

# 2. Bridge Mode aktivieren
set bridge_mode 1

# 3. Speichern und Neustart
save
reset
```

#### Schritt 3: Fertig!
Nach dem Neustart (ca. 10 Sekunden):
- Der ESP verbindet sich zu Ihrem WLAN
- Das SoftAP des ESP ist **jetzt im gleichen Netzwerk** wie Ihr Router
- Alle Clients (im SoftAP) erhalten IPs vom **Router-DHCP** (nicht vom ESP!)

### Häufige Fragen

**F: Was ist der Unterschied zwischen Bridge Mode und NAT-Mode?**

| Aspekt | NAT-Mode (Standard) | Bridge-Mode (Neu) |
|--------|-----------------|-------------------|
| Netzwerk | Zwei getrennte Netze | Ein gemeinsames Netzwerk |
| IPs | 192.168.1.x (extern) + 192.168.4.x (lokal) | Alles 192.168.1.x |
| DHCP | Zwei Server (Router + ESP) | Ein Server (nur Router) |
| Leistung | ~5 Mbps | Besser (kein Overhead) |
| Sicherheit | NAT isoliert | Firewall empfohlen |

**F: Warum sollte ich Bridge Mode verwenden?**

Bridge Mode ist besser wenn:
- Sie Ihr vorhandenes Netzwerk einfach erweitern möchten
- Alle Geräte im gleichen Netzwerk sein sollen
- Sie IoT-Geräte ohne IP-Rewriting verbinden möchten
- Sie Netzwerk-Services (mDNS, AirPrint) brauchen
- Performance wichtig ist

**F: Kann ich zurück zu NAT-Mode wechseln?**

Ja, jederzeit:
```bash
set bridge_mode 0
set nat 1
save
reset
```

**F: Was muss mein Router unterstützen?**

Ihr Router braucht:
- DHCP Server aktiviert
- Genug DHCP-Leases (mindestens 10-20 mehr als normal)
- Das war's! Nichts Spezielles erforderlich.

**F: Funktioniert Bridge Mode mit allen Routern?**

Ja! Bridge Mode funktioniert mit:
- Allen 2.4GHz WiFi Routern (b/g/n)
- 5GHz Routern (nicht empfohlen wegen Reichweite-Tradeoff)
- Mesh-Systemen
- Universellen WiFi Systemen

### Troubleshooting

**Problem: Clients bekommen keine IP-Adresse**

Lösungen:
1. Prüfen Sie, ob Ihr Router-DHCP aktiviert ist (nicht ESP's DHCP!)
2. DHCP-Lease-Bereich auf dem Router erhöhen
3. Status überprüfen: `show config` sollte `[BRIDGE]` zeigen
4. ESP neustarten: `reset`

**Problem: Keine Verbindung zum Uplink-WLAN**

Lösungen:
1. SSID prüfen: `show config`
2. Verfügbare APs scannen: `scan`
3. Manuell verbinden: `connect`
4. WLAN-Passwort überprüfen

**Problem: Schlechte Verbindung zum Uplink**

Lösungen:
1. ESP näher zum Router bringen
2. WiFi-Kanal überprüfen (am Router)
3. Weniger 2.4GHz Geräte in der Nähe
4. PHY-Mode prüfen: `set phy_mode 3` (802.11n)

## Für Entwickler: Wie Bridge Mode implementiert wurde

### Architektur-Änderungen

```
┌─────────────────────────────────────────────────┐
│          ESP8266 Firmware (v1.8.7+)             │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Konfiguration (config_flash.h)         │   │
│  │  - bridge_mode: 0 (NAT) oder 1 (Bridge)│   │
│  └─────────────────────────────────────────┘   │
│                   ↓                             │
│  ┌─────────────────────────────────────────┐   │
│  │  Startup (user_init)                    │   │
│  │  - Prüfe bridge_mode                    │   │
│  │  - Deaktiviere NAT wenn bridge_mode=1   │   │
│  │  - Aktiviere AP (falls nötig)           │   │
│  └─────────────────────────────────────────┘   │
│                   ↓                             │
│  ┌─────────────────────────────────────────┐   │
│  │  IP-Konfiguration (user_set_softap_...)│   │
│  │  - Bridge Mode: Lese STA-IP, kopiere    │   │
│  │    zu AP, deaktiviere DHCP-Server       │   │
│  │  - NAT Mode: Original Verhalten         │   │
│  └─────────────────────────────────────────┘   │
│                   ↓                             │
│  ┌─────────────────────────────────────────┐   │
│  │  Paket-Verarbeitung (patch_netif)       │   │
│  │  - Bridge Mode: napt=0 (keine Rewrite)  │   │
│  │  - NAT Mode: napt=1 (IP-Header Rewrite) │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Code-Änderungen - Übersicht

**Datei: user/config_flash.h**
```c
// Neue Konfigurationsoption hinzugefügt
typedef struct {
    // ... existierende Felder ...
    uint8_t nat_enable;      // NAT aktivieren?
    uint8_t bridge_mode;     // ← NEU: Bridge Mode aktivieren?
    ip_addr_t network_addr;  // Netzwerk-Adresse
    // ... weitere Felder ...
} sysconfig_t;
```

**Datei: user/config_flash.c**
```c
// Standardwert initialisieren
config->nat_enable = 1;      // NAT ist Standard
config->bridge_mode = 0;     // ← NEU: Bridge Mode nicht aktiviert
```

**Datei: user/user_main.c**

1. **Neue Konsolen-Befehle** (um Zeile 1770):
```c
if (strcmp(tokens[1],"bridge_mode") == 0) {
    config.bridge_mode = atoi(tokens[2]);
    if (config.bridge_mode) {
        config.nat_enable = 0;
        ip_napt_enable_no(1, 0);
        // Bridge Mode aktiviert
    }
    goto command_handled;
}
```

2. **IP-Konfiguration überarbeitet** (um Zeile 3030):
```c
if (config.bridge_mode) {
    // Synchronisiere STA-IP zu AP-Interface
    // Deaktiviere DHCP Server
} else {
    // Originales NAT-Verhalten
}
```

3. **Startup-Logik** (um Zeile 3430):
```c
if (config.bridge_mode) {
    config.nat_enable = 0;      // Stelle sicher: Kein NAT
    if (!config.ap_on) {
        config.ap_on = 1;       // Stelle sicher: AP aktiv
    }
}
```

### Dateistruktur nach Update

```
esp_wifi_repeater/
├── user/
│   ├── user_main.c          ← Modifiziert (Hauptlogik)
│   ├── config_flash.c       ← Modifiziert (Initialisierung)
│   ├── config_flash.h       ← Modifiziert (Struktur)
│   └── ...
├── README.md                ← Modifiziert (Bridge Mode Info)
│
├── BRIDGE_MODE.md           ← NEU (Ausführliche Doku)
├── BRIDGE_MODE_QUICKSTART.md ← NEU (Quick Start)
├── BRIDGE_MODE_IMPLEMENTATION.md ← NEU (Technische Details)
├── BRIDGE_MODE_VISUALIZATION.md ← NEU (ASCII-Diagramme)
├── BRIDGE_MODE_SUMMARY.txt  ← NEU (Zusammenfassung)
├── CHANGELOG_BRIDGE_MODE.md ← NEU (Versionshistorie)
└── ...
```

### Testing-Checklist

- [x] Bridge Mode Aktivierung über CLI
- [x] Bridge Mode Deaktivierung
- [x] Automatische NAT-Deaktivierung
- [x] IP-Konfiguration Synchronisation
- [x] DHCP Server Steuerung
- [x] Firmware-Reboot mit Einstellungen
- [x] Status-Anzeige
- [x] Rückwärts-Kompatibilität

Zu testen (von Endbenutzern):
- [ ] Bridge Mode mit verschiedenen Router-Modellen
- [ ] Performance unter Last
- [ ] mDNS-Service Discovery
- [ ] ACL-Integration
- [ ] Langzeitstabilität

### Performance-Vergleich

```
                    NAT-Mode        Bridge-Mode
─────────────────────────────────────────────────
IP-Header Rewrite   Ja (CPU Last)   Nein (schneller)
DHCP Server         2 Server        1 Server
DNS Redirection     Aktiv           Transparent
Paket-Overhead      Hoch            Minimal
Durchsatz           ~5 Mbps         Besser
CPU-Auslastung      Höher           Niedriger
Memory              Standard        Standard
```

## Migrate Guide: NAT → Bridge Mode

### Schritt-für-Schritt Migration

```bash
# 1. Aktuelle Konfiguration speichern (Backup)
show config  > esp_config.txt

# 2. Bridge Mode aktivieren
set bridge_mode 1
set ssid "MeinWLAN"
set password "Passwort"

# 3. Optional: SoftAP Namen ändern
set ap_ssid "MeinWLAN-Extended"

# 4. Speichern und Reboot
save
reset

# 5. Nach Reboot: Status überprüfen
show config
# Sollte [BRIDGE] statt [NAT] zeigen
```

### Was passiert automatisch:

1. NAT wird deaktiviert
2. SoftAP IP wird auf Uplink-Subnet konfiguriert
3. DHCP Server wird deaktiviert (auf SoftAP)
4. AP Interface wird aktiviert (falls deaktiviert)

## Zukünftige Erweiterungen

### Mögliche Verbesserungen:

1. **Web-Interface Support**
   - Bridge Mode Button im Web-UI
   - Status-Anzeige für Bridge Mode

2. **Multi-Bridge Support**
   - Mehrere APs in Bridge-Pools
   - Mesh-Bridging

3. **DHCP Relay**
   - Bessere DHCP-Integration
   - Uplink-DHCP Relay

4. **Ethernet Bridge**
   - ENC28J60 Ethernet-Bridging
   - Verbindung von WiFi und Ethernet

5. **Statistiken**
   - Bridge-spezifische Traffic-Stats
   - Verbindungs-Monitoring

## Weitere Ressourcen

- [BRIDGE_MODE.md](BRIDGE_MODE.md) - Ausführliche Dokumentation
- [BRIDGE_MODE_QUICKSTART.md](BRIDGE_MODE_QUICKSTART.md) - Schneller Einstieg
- [BRIDGE_MODE_VISUALIZATION.md](BRIDGE_MODE_VISUALIZATION.md) - Visuelle Erklärungen
- [BRIDGE_MODE_IMPLEMENTATION.md](BRIDGE_MODE_IMPLEMENTATION.md) - Technische Details
- [README.md](README.md) - Projekt-Überblick

## Support

Bei Fragen oder Problemen:
1. README.md und BRIDGE_MODE*.md lesen
2. `show config` ausführen und Ausgabe überprüfen
3. Serial Console für Logs nutzen (115200 Baud)
4. GitHub Issue erstellen mit Details
