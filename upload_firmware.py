#!/usr/bin/env python3
"""
ESP8266 WiFi Repeater - Firmware Upload Tool
Sichere Methode zum Flashen der Firmware auf den ESP8266
"""

import os
import sys
import time
import argparse
import subprocess
from pathlib import Path
from datetime import datetime


class Colors:
    """ANSI Farben für Terminal-Ausgabe"""
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
    NC = '\033[0m'  # No Color


class FirmwareUploader:
    def __init__(self, firmware_file="firmware_combined.bin", baud_rate=460800, port=None):
        self.firmware_file = Path(firmware_file)
        self.baud_rate = baud_rate
        self.port = port
        self.backup_file = None
    
    def print_header(self):
        """Zeige Kopfzeile"""
        print(f"\n{Colors.BLUE}╔════════════════════════════════════════════════════════════╗{Colors.NC}")
        print(f"{Colors.BLUE}║{Colors.NC}       ESP8266 WiFi Repeater - Firmware Upload Tool     {Colors.BLUE}║{Colors.NC}")
        print(f"{Colors.BLUE}╚════════════════════════════════════════════════════════════╝{Colors.NC}\n")
    
    def print_success(self, msg):
        """Zeige Erfolgsmeldung"""
        print(f"{Colors.GREEN}✅  {msg}{Colors.NC}")
    
    def print_error(self, msg):
        """Zeige Fehlermeldung"""
        print(f"{Colors.RED}❌  {msg}{Colors.NC}")
    
    def print_info(self, msg):
        """Zeige Info-Meldung"""
        print(f"{Colors.YELLOW}ℹ️   {msg}{Colors.NC}")
    
    def check_requirements(self):
        """Überprüfe Anforderungen"""
        self.print_info("Überprüfe Anforderungen...")
        
        # Überprüfe Firmware-Datei
        if not self.firmware_file.exists():
            self.print_error(f"Firmware-Datei nicht gefunden: {self.firmware_file}")
            print("   Bitte bauen Sie zuerst die Firmware mit:")
            print("   cd firmware/ && python3 build_combined.py")
            sys.exit(1)
        
        fw_size = self.firmware_file.stat().st_size
        self.print_success(f"Firmware-Datei gefunden: {self.firmware_file} ({fw_size/1024:.1f} KB)")
        
        # Überprüfe esptool
        try:
            result = subprocess.run(['esptool.py', 'version'], 
                                  capture_output=True, text=True, timeout=5)
            if result.returncode == 0:
                version = result.stdout.strip().split('\n')[0]
                self.print_success(f"esptool.py gefunden: {version}")
            else:
                raise Exception("esptool.py nicht verfügbar")
        except Exception:
            self.print_error("esptool.py nicht installiert!")
            print("   Installieren Sie es mit:")
            print("   pip install esptool")
            sys.exit(1)
    
    def detect_port(self):
        """Erkenne COM-Port automatisch"""
        if self.port:
            return
        
        self.print_info("Suche nach ESP8266...")
        
        try:
            result = subprocess.run(['esptool.py', 'chip_id'],
                                  capture_output=True, text=True, timeout=10)
            
            # Versuche Port aus Ausgabe zu extrahieren
            for line in result.stderr.split('\n'):
                if 'Serial port' in line:
                    self.port = line.split('/')[-1].strip()
                    break
            
            if not self.port:
                # Fallback: Versuche zu bauen
                self.port = self._find_port()
            
            if self.port:
                self.print_success(f"Port erkannt: {self.port}")
            else:
                self.print_error("Konnte keinen Port finden!")
                sys.exit(1)
        except Exception as e:
            self.print_error(f"Fehler bei Port-Erkennung: {e}")
            sys.exit(1)
    
    def _find_port(self):
        """Versuche Port zu finden"""
        import platform
        
        if platform.system() == "Linux":
            ports = list(Path("/dev").glob("ttyUSB*")) + list(Path("/dev").glob("ttyACM*"))
        elif platform.system() == "Darwin":  # macOS
            ports = list(Path("/dev").glob("tty.usb*")) + list(Path("/dev").glob("tty.wchusbserial*"))
        else:  # Windows
            return "COM3"
        
        return str(ports[0]) if ports else None
    
    def verify_esp8266(self):
        """Überprüfe ESP8266 Verbindung"""
        self.print_info("Überprüfe ESP8266 Verbindung...")
        
        try:
            result = subprocess.run(['esptool.py', '-p', self.port, '-b', '115200', 'chip_id'],
                                  capture_output=True, text=True, timeout=5)
            if result.returncode == 0:
                self.print_success("ESP8266 gefunden und antwortet")
            else:
                raise Exception("chip_id fehlgeschlagen")
        except Exception as e:
            self.print_error(f"Kann ESP8266 auf {self.port} nicht erreichen!")
            print("\n   Überprüfen Sie:")
            print("   1. ESP8266 ist mit USB-Kabel verbunden")
            print("   2. Treiber sind installiert (CH340, CP2102, etc.)")
            print("   3. Richtige COM-Port ist gewählt")
            sys.exit(1)
    
    def backup_firmware(self):
        """Erstelle Backup der aktuellen Firmware"""
        self.print_info("Erstelle Backup der aktuellen Firmware...")
        
        self.backup_file = f"firmware_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.bin"
        
        try:
            subprocess.run(['esptool.py', '-p', self.port, '-b', '115200',
                          'read_flash', '0x00000', '0x100000', self.backup_file],
                          check=True, capture_output=True, timeout=30)
            self.print_success(f"Backup erstellt: {self.backup_file}")
        except Exception:
            self.print_error("Konnte Backup nicht erstellen (optional)")
            print("   Fahre mit Upload fort...")
    
    def upload_firmware(self):
        """Starte Firmware Upload"""
        self.print_info("Starte Firmware Upload...")
        print()
        
        try:
            subprocess.run(['esptool.py', '-p', self.port, '-b', str(self.baud_rate),
                          'write_flash', '0x00000', str(self.firmware_file)],
                          check=True, timeout=60)
            self.print_success("Firmware erfolgreich hochgeladen!")
            return True
        except subprocess.CalledProcessError as e:
            self.print_error(f"Firmware Upload fehlgeschlagen: {e}")
            return False
    
    def verify_upload(self):
        """Verifiziere Upload"""
        self.print_info("Verifiziere Upload...")
        
        try:
            subprocess.run(['esptool.py', '-p', self.port, '-b', '115200',
                          'verify_flash', '0x00000', str(self.firmware_file)],
                          check=True, capture_output=True, timeout=30)
            self.print_success("Upload verifiziert")
            return True
        except Exception:
            self.print_error("Verifikation fehlgeschlagen")
            return False
    
    def reset_esp8266(self):
        """Starte ESP8266 neu"""
        self.print_info("Starte ESP8266 neu...")
        
        try:
            subprocess.run(['esptool.py', '-p', self.port, '-b', '115200', 'hard_reset'],
                          capture_output=True, timeout=5)
        except Exception:
            pass
        
        time.sleep(2)
        self.print_success("ESP8266 ist neu gestartet")
    
    def show_next_steps(self):
        """Zeige nächste Schritte"""
        print()
        print(f"{Colors.BLUE}╔════════════════════════════════════════════════════════════╗{Colors.NC}")
        print(f"{Colors.BLUE}║{Colors.NC}                     🎉 Upload erfolgreich!              {Colors.BLUE}║{Colors.NC}")
        print(f"{Colors.BLUE}╚════════════════════════════════════════════════════════════╝{Colors.NC}")
        print()
        self.print_success("Firmware ist auf dem ESP8266 installiert")
        print()
        print("📱 Nächste Schritte:")
        print()
        print("1️⃣  Öffnen Sie einen Browser:")
        print("   http://192.168.4.1/")
        print("   oder")
        print("   http://esp8266.local/")
        print()
        print("2️⃣  Konfigurieren Sie die WiFi-Einstellungen:")
        print("   - Uplink SSID & Passwort")
        print("   - AP SSID & Passwort")
        print("   - Bridge oder NAT Mode")
        print()
        print("3️⃣  Speichern und Neustart:")
        print("   Button: 'Speichern & Neu Starten'")
        print()
        print("4️⃣  Serial Monitor öffnen:")
        print(f"   esptool.py -p {self.port} -b 115200 read_flask 0x00000")
        print()
        print("📖 Weitere Infos:")
        print("   - Siehe: GETTING_STARTED.md")
        print("   - Oder: FIRMWARE_BINARY.md")
        print()
    
    def run(self, backup=True, verify=True):
        """Führe Upload durch"""
        self.print_header()
        
        print(f"Firmware:    {self.firmware_file}")
        print(f"Baud Rate:   {self.baud_rate}")
        print(f"Port:        {self.port} (wird automatisch erkannt)")
        print()
        
        # Überprüfungen
        self.check_requirements()
        print()
        
        self.detect_port()
        print()
        
        self.verify_esp8266()
        print()
        
        # Backup
        if backup:
            response = input("Backup der aktuellen Firmware erstellen? (j/n): ").lower()
            if response in ['j', 'y', 'yes', 'ja']:
                self.backup_firmware()
                print()
        
        # Bestätigung
        response = input("Firmware hochladen? (j/n): ").lower()
        if response not in ['j', 'y', 'yes', 'ja']:
            self.print_error("Upload abgebrochen")
            sys.exit(0)
        
        # Upload
        if not self.upload_firmware():
            sys.exit(1)
        print()
        
        # Verifikation
        if verify:
            self.verify_upload()
            print()
        
        # Reset
        self.reset_esp8266()
        print()
        
        # Nächste Schritte
        self.show_next_steps()


def main():
    parser = argparse.ArgumentParser(
        description="ESP8266 WiFi Repeater - Firmware Upload Tool",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Beispiele:
  python3 upload_firmware.py
  python3 upload_firmware.py --port /dev/ttyUSB0
  python3 upload_firmware.py --baud 460800 --port COM3
        """
    )
    
    parser.add_argument('--firmware', default='firmware_combined.bin',
                       help='Firmware-Datei (Standard: firmware_combined.bin)')
    parser.add_argument('--baud', type=int, default=460800,
                       help='Baud Rate (Standard: 460800)')
    parser.add_argument('--port', help='COM-Port (Standard: auto-detect)')
    parser.add_argument('--no-backup', action='store_true',
                       help='Kein Backup erstellen')
    parser.add_argument('--no-verify', action='store_true',
                       help='Upload nicht verifizieren')
    
    args = parser.parse_args()
    
    uploader = FirmwareUploader(
        firmware_file=args.firmware,
        baud_rate=args.baud,
        port=args.port
    )
    
    uploader.run(
        backup=not args.no_backup,
        verify=not args.no_verify
    )


if __name__ == '__main__':
    main()
