#!/bin/bash

##############################################################################
#                                                                            #
#  ESP8266 WiFi Repeater - Firmware Upload Script                          #
#  Sichere Methode zum Flashen der Firmware auf den ESP8266                #
#                                                                            #
##############################################################################

set -e

# Farben für Ausgabe
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Konfiguration
FIRMWARE_FILE="firmware_combined.bin"
BAUD_RATE="${1:-460800}"
PORT="${2:-}"

# Funktionen
print_header() {
    echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}       ESP8266 WiFi Repeater - Firmware Upload Script   ${BLUE}║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅  $1${NC}"
}

print_error() {
    echo -e "${RED}❌  $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️   $1${NC}"
}

check_requirements() {
    print_info "Überprüfe Anforderungen..."
    
    # Check for firmware file
    if [ ! -f "$FIRMWARE_FILE" ]; then
        print_error "Firmware-Datei nicht gefunden: $FIRMWARE_FILE"
        echo "   Bitte bauen Sie zuerst die Firmware mit:"
        echo "   cd firmware/ && python3 build_combined.py"
        exit 1
    fi
    print_success "Firmware-Datei gefunden: $FIRMWARE_FILE ($(stat -f%z "$FIRMWARE_FILE" 2>/dev/null || stat -c%s "$FIRMWARE_FILE") bytes)"
    
    # Check for esptool
    if ! command -v esptool.py &> /dev/null; then
        print_error "esptool.py nicht installiert!"
        echo "   Installieren Sie es mit:"
        echo "   pip install esptool"
        exit 1
    fi
    print_success "esptool.py gefunden: $(esptool.py version)"
}

detect_port() {
    if [ -z "$PORT" ]; then
        print_info "Suche nach ESP8266..."
        
        # Try to detect port
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            PORT=$(ls /dev/ttyUSB* 2>/dev/null | head -1)
            if [ -z "$PORT" ]; then
                PORT=$(ls /dev/ttyACM* 2>/dev/null | head -1)
            fi
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            PORT=$(ls /dev/tty.usb* 2>/dev/null | head -1)
            if [ -z "$PORT" ]; then
                PORT=$(ls /dev/tty.wchusbserial* 2>/dev/null | head -1)
            fi
        elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
            PORT="COM3"  # Default for Windows
        fi
        
        if [ -z "$PORT" ]; then
            print_error "Konnte keine COM-Port finden!"
            echo "   Verfügbare Ports:"
            esptool.py chip_id 2>&1 | grep -i "serial"
            echo ""
            echo "   Bitte geben Sie einen Port an:"
            echo "   $0 460800 /dev/ttyUSB0"
            exit 1
        fi
    fi
    print_success "Port erkannt: $PORT"
}

verify_esp8266() {
    print_info "Überprüfe ESP8266 Verbindung..."
    
    if ! esptool.py -p "$PORT" -b 115200 chip_id > /dev/null 2>&1; then
        print_error "Kann ESP8266 auf $PORT nicht erreichen!"
        echo ""
        echo "   Überprüfen Sie:"
        echo "   1. ESP8266 ist mit USB-Kabel verbunden"
        echo "   2. Treiber sind installiert (CH340, CP2102, etc.)"
        echo "   3. Richtige COM-Port ist gewählt"
        echo ""
        echo "   Verfügbare Ports:"
        ls /dev/tty* 2>/dev/null | grep -E "(USB|ACM|serial|FTDI)" || echo "   Keine Ports gefunden"
        exit 1
    fi
    print_success "ESP8266 gefunden und antwortet"
}

backup_firmware() {
    print_info "Erstelle Backup der aktuellen Firmware..."
    
    BACKUP_FILE="firmware_backup_$(date +%Y%m%d_%H%M%S).bin"
    
    if esptool.py -p "$PORT" -b 115200 read_flash 0x00000 0x100000 "$BACKUP_FILE" > /dev/null 2>&1; then
        print_success "Backup erstellt: $BACKUP_FILE"
    else
        print_error "Konnte Backup nicht erstellen (optional)"
        echo "   Fahre mit Upload fort..."
    fi
}

upload_firmware() {
    print_info "Starte Firmware Upload..."
    echo ""
    
    if esptool.py -p "$PORT" -b "$BAUD_RATE" write_flash 0x00000 "$FIRMWARE_FILE"; then
        print_success "Firmware erfolgreich hochgeladen!"
        return 0
    else
        print_error "Firmware Upload fehlgeschlagen!"
        return 1
    fi
}

verify_upload() {
    print_info "Verifiziere Upload..."
    
    if esptool.py -p "$PORT" -b 115200 verify_flash 0x00000 "$FIRMWARE_FILE" > /dev/null 2>&1; then
        print_success "Upload verifiziert"
        return 0
    else
        print_error "Verifikation fehlgeschlagen"
        return 1
    fi
}

reset_esp8266() {
    print_info "Starte ESP8266 neu..."
    
    esptool.py -p "$PORT" -b 115200 hard_reset > /dev/null 2>&1 || true
    
    sleep 2
    print_success "ESP8266 ist neu gestartet"
}

show_next_steps() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}                     🎉 Upload erfolgreich!              ${BLUE}║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    print_success "Firmware ist auf dem ESP8266 installiert"
    echo ""
    echo "📱 Nächste Schritte:"
    echo ""
    echo "1️⃣  Öffnen Sie einen Browser:"
    echo "   http://192.168.4.1/"
    echo "   oder"
    echo "   http://esp8266.local/"
    echo ""
    echo "2️⃣  Konfigurieren Sie die WiFi-Einstellungen:"
    echo "   - Uplink SSID & Passwort"
    echo "   - AP SSID & Passwort"
    echo "   - Bridge oder NAT Mode"
    echo ""
    echo "3️⃣  Speichern und Neustart:"
    echo "   Button: 'Speichern & Neu Starten'"
    echo ""
    echo "4️⃣  Live Logs beobachten:"
    echo "   esptool.py -p $PORT -b 115200 read_flash 0x00000"
    echo ""
    echo "📖 Weitere Infos:"
    echo "   - Siehe: GETTING_STARTED.md"
    echo "   - Oder: FIRMWARE_BINARY.md"
    echo ""
}

main() {
    print_header
    
    echo "Firmware:   $FIRMWARE_FILE"
    echo "Baud Rate: $BAUD_RATE"
    echo "Port:       $PORT (wird automatisch erkannt)"
    echo ""
    
    check_requirements
    echo ""
    
    detect_port
    echo ""
    
    verify_esp8266
    echo ""
    
    read -p "Backup der aktuellen Firmware erstellen? (j/n) " -n 1 -r BACKUP
    echo
    if [[ $BACKUP =~ ^[Jj]$ ]]; then
        backup_firmware
        echo ""
    fi
    
    read -p "Firmware hochladen? (j/n) " -n 1 -r CONFIRM
    echo
    if [[ ! $CONFIRM =~ ^[Jj]$ ]]; then
        print_error "Upload abgebrochen"
        exit 0
    fi
    
    upload_firmware || exit 1
    echo ""
    
    verify_upload || print_error "Verifikation fehlgeschlagen (aber Upload möglicherweise erfolgreich)"
    echo ""
    
    reset_esp8266
    echo ""
    
    show_next_steps
}

# Hauptprogramm
main "$@"
