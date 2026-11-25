# Bridge Mode Implementation - Änderungsübersicht

## Modifizierte Dateien

### 1. `user/config_flash.h`
**Änderung**: Neue Konfigurationsoption hinzugefügt

```c
// Vor:
uint8_t nat_enable;        // Enable NAT on the AP netif;
ip_addr_t network_addr;    // Address of the internal network

// Nach:
uint8_t nat_enable;        // Enable NAT on the AP netif;
uint8_t bridge_mode;       // Enable bridge mode (disables NAT, requires same subnet)
ip_addr_t network_addr;    // Address of the internal network
```

### 2. `user/config_flash.c`
**Änderung**: Standardwert für bridge_mode initialisieren

```c
config->nat_enable = 1;
config->bridge_mode = 0;  // NEU: Bridge mode standardmäßig deaktiviert
IP4_ADDR(&config->network_addr, 192, 168, 4, 1);
```

### 3. `user/user_main.c`

#### 3a. Help-Text aktualisiert
Bridge Mode zum Set-Befehl hinzugefügt:

```
set [ssid|password|auto_connect|ap_ssid|ap_password|ap_on|ap_open|nat|bridge_mode] <val>
```

#### 3b. Neue `bridge_mode` Befehl hinzugefügt
Ermöglicht Bridge Mode Aktivierung/Deaktivierung über Console:

```c
if (strcmp(tokens[1],"bridge_mode") == 0) {
    config.bridge_mode = atoi(tokens[2]);
    if (config.bridge_mode) {
        config.nat_enable = 0;
        ip_napt_enable_no(1, 0);
        os_sprintf_flash(response, "Bridge mode enabled, NAT disabled\r\n");
    } else {
        os_sprintf_flash(response, "Bridge mode disabled\r\n");
    }
    goto command_handled;
}
```

#### 3c. NAT Befehl erweitert
Deaktiviert automatisch Bridge Mode wenn NAT aktiviert wird:

```c
if (config.nat_enable) {
    config.bridge_mode = 0;  // NEU
    ip_napt_enable_no(1, 1);
    os_sprintf_flash(response, "NAT enabled, bridge_mode disabled\r\n");
}
```

#### 3d. `user_set_softap_ip_config()` überarbeitet
Implementiert dynamische IP-Konfiguration für Bridge Mode:

```c
if (config.bridge_mode) {
    // Bridge mode: use the same IP subnet as the STA interface
    // Get the STA netif info and copy to AP netif
} else {
    // Normal repeater mode (original behavior)
}

if (!config.bridge_mode) {
    // Only enable DHCP server in repeater mode
    wifi_softap_dhcps_start();
} else {
    // Bridge mode: Disable DHCP server on AP
}
```

#### 3e. Initialisierung in `user_init()` angepasst
Bridge Mode wird bei Startup überprüft und NAT automatisch deaktiviert:

```c
// Bridge mode configuration
if (config.bridge_mode) {
    config.nat_enable = 0;
    os_printf("Bridge mode: NAT disabled\r\n");
    if (!config.ap_on) {
        config.ap_on = 1;
        os_printf("Bridge mode: AP enabled\r\n");
    }
}
```

#### 3f. Status-Anzeige aktualisiert
`show config` zeigt jetzt Bridge Mode an:

```
AP: SSID:... IP:192.168.1.2/24 [BRIDGE]  // Bei Bridge Mode aktiv
AP: SSID:... IP:192.168.4.1/24 [NAT]     // Bei NAT aktiv
```

## Funktionsweise Bridge Mode

### 1. Aktivierung
```
Benutzer: set bridge_mode 1
         ↓
         bridge_mode = 1 setzen
         nat_enable = 0 setzen (automatisch)
         NAPT deaktivieren
```

### 2. Startup
```
user_init()
    ↓
Wenn bridge_mode == 1:
    - nat_enable = 0 (sicherstellen)
    - AP aktivieren (wenn deaktiviert)
```

### 3. AP IP-Konfiguration
```
user_set_softap_ip_config()
    ↓
Wenn bridge_mode:
    - Lese STA Netif IP-Konfiguration
    - Kopiere zu AP Netif
    - Deaktiviere DHCP Server
Sonst:
    - Original Repeater Verhalten
    - DHCP Server aktiv
    - Statische IP 192.168.4.1
```

### 4. Paket-Verarbeitung
```
Paket kommt vom AP-Client
    ↓
patch_netif(..., nat=false)
    ↓
napt = 0 (Bridge Mode: Keine NAT)
    ↓
Paket wird zu STA weitergeleitet (ohne Modifikation)
    ↓
Paket erreicht Uplink-AP
```

## Rückwärts-Kompatibilität

- **Alte Konfigurationen**: Funktionieren unverändert (bridge_mode = 0 per Default)
- **NAT-Modus**: Bleibt Standard
- **Firmware-Update**: Keine Datenverluste, Einstellungen bleiben erhalten

## Sicherheitsüberlegungen

### Bridge Mode Einschränkungen
1. **Keine implizite NAT-Isolation**: Clients im AP sehen das gleiche Netzwerk wie Uplink
2. **DNS-Transparent**: Clients sprechen direkt mit Uplink-DNS
3. **mDNS/Bonjour sichtbar**: Dienste aus beiden Netzen sind sichtbar

### Empfohlene Sicherheitsmaßnahmen
1. ACL aktivieren und konfigurieren:
   ```
   acl from_ap <protocol> <src> deny
   ```
2. SoftAP-Passwort setzen
3. Firewall auf Uplink-Router aktivieren

## Performance-Vergleich

| Operation | Repeater (NAT) | Bridge |
|-----------|----------------|--------|
| Paket-Rewriting | Ja | Nein |
| DHCP-Server | Aktiv | Deaktiviert |
| DNS-Redirection | Aktiv | Transparent |
| CPU-Last | Höher | Niedriger |
| Durchsatz | ~5 Mbps | Besser |

## Erweiterungsmöglichkeiten

1. **ENC28J60 Ethernet Bridge**: Bridge Mode könnte auch Ethernet-Schnittstellen bridgen
2. **Multi-Interface Bridging**: Mehrere APs in einem Bridge-Pool
3. **VLAN Support**: Unterschiedliche VLANs im Bridge Mode
4. **QoS über Bridge**: Traffic-Shaping pro VLAN

## Testanleitung

```bash
# 1. Bridge Mode aktivieren
telnet 192.168.4.1 7777
> set bridge_mode 1
> set ssid "MeinRouter"
> set password "Passwort"
> save
> reset

# 2. Nach Reboot: Verbindung zum ESP SoftAP
# Verfügbar unter: ESP_SSID (default SoftAP Name)

# 3. IP-Adresse überprüfen
# Sollte im gleichen Subnet wie Uplink sein

# 4. Ping-Test
ping uplink_gateway
ping uplink_client

# 5. Status überprüfen
telnet 192.168.4.1 7777
> show config
# Output sollte [BRIDGE] statt [NAT] zeigen
```

## Bekannte Einschränkungen

1. **Uplink-DHCP erforderlich**: Der Uplink-AP muss DHCP für ausreichend Clients anbieten
2. **Gleicher SSID möglich**: Für nahtlose Übergänge könnte AP mit gleicher SSID wie Uplink konfiguriert werden
3. **Automesh Mode**: Bridge Mode wurde noch nicht mit Automesh Mode getestet

## Zukünftige Verbesserungen

- [ ] GUI-Support für Bridge Mode im Web-Interface
- [ ] Automatische Bridge-Erkennung
- [ ] Multi-Bridge Mesh-Unterstützung
- [ ] DHCP Relay für bessere Integration
- [ ] Statistiken für Bridge-Traffic
