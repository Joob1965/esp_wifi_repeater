// ESP8266 WiFi Repeater - Web UI Application
// Bridge Mode Control with Tuning Sliders

class WiFiRepeaterApp {
    constructor() {
        this.baseUrl = window.location.origin;
        this.updateInterval = null;
        this.isConnected = false;
        this.debugMode = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadConfiguration();
        this.startStatusUpdate();
        this.logToConsole('App initialized', 'info');
    }

    setupEventListeners() {
        // Mode Selection
        document.getElementById('bridgeTab').addEventListener('click', () => this.switchMode('bridge'));
        document.getElementById('natTab').addEventListener('click', () => this.switchMode('nat'));
        document.getElementById('modeToggle').addEventListener('change', (e) => this.toggleBridgeMode(e));

        // Sliders
        document.getElementById('txPower').addEventListener('input', (e) => this.updateTxPower(e));
        document.getElementById('dhcpTimeout').addEventListener('input', (e) => this.updateDhcpTimeout(e));
        document.getElementById('channel').addEventListener('change', (e) => this.updateChannel(e));
        document.getElementById('dataRate').addEventListener('change', (e) => this.updateDataRate(e));

        // Buttons
        document.getElementById('saveBtn').addEventListener('click', () => this.saveConfiguration());
        document.getElementById('resetBtn').addEventListener('click', () => this.rebootDevice());
        document.getElementById('defaultBtn').addEventListener('click', () => this.resetToDefault());

        // Password Toggle
        document.getElementById('togglePassword').addEventListener('click', () => this.togglePasswordVisibility());

        // Console
        document.getElementById('consoleSendBtn').addEventListener('click', () => this.sendConsoleCommand());
        document.getElementById('consoleInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendConsoleCommand();
        });

        // NAPT Visibility
        this.updateNaptVisibility();
    }

    switchMode(mode) {
        const bridgeTab = document.getElementById('bridgeTab');
        const natTab = document.getElementById('natTab');
        const modeToggle = document.getElementById('modeToggle');
        const naptGroup = document.getElementById('naptGroup');

        if (mode === 'bridge') {
            bridgeTab.classList.add('active');
            natTab.classList.remove('active');
            modeToggle.checked = true;
            naptGroup.style.display = 'none';
            document.getElementById('modeDescription').textContent = 
                'Bridge Mode verbindet zwei WLAN-Netzwerke auf Layer 2. Der ESP8266 agiert als transparente Brücke.';
        } else {
            natTab.classList.add('active');
            bridgeTab.classList.remove('active');
            modeToggle.checked = false;
            naptGroup.style.display = 'block';
            document.getElementById('modeDescription').textContent = 
                'NAT Mode (Network Address Translation) verbindet zwei Netzwerke auf Layer 3. Der ESP8266 agiert als Router.';
        }

        this.updateNaptVisibility();
    }

    toggleBridgeMode(e) {
        if (e.target.checked) {
            this.switchMode('bridge');
        } else {
            this.switchMode('nat');
        }
    }

    updateNaptVisibility() {
        const naptGroup = document.getElementById('naptGroup');
        const modeToggle = document.getElementById('modeToggle');
        naptGroup.style.display = modeToggle.checked ? 'none' : 'block';
    }

    updateTxPower(e) {
        const value = parseFloat(e.target.value);
        document.getElementById('txPowerValue').textContent = `${value} dBm`;
        this.logToConsole(`TX Power: ${value} dBm`, 'info');
    }

    updateDhcpTimeout(e) {
        const value = parseInt(e.target.value);
        const displayValue = value < 60 ? `${value}s` : `${(value/60).toFixed(1)}m`;
        document.getElementById('dhcpTimeoutValue').textContent = `${value} Sekunden`;
        this.logToConsole(`DHCP Timeout: ${value}s`, 'info');
    }

    updateChannel(e) {
        const value = e.target.value;
        const channelText = value === '0' ? 'Auto' : `Kanal ${value}`;
        document.getElementById('channelValue').textContent = channelText;
        this.logToConsole(`WiFi Kanal: ${channelText}`, 'info');
    }

    updateDataRate(e) {
        const selectedOption = e.target.options[e.target.selectedIndex];
        document.getElementById('dataRateValue').textContent = selectedOption.text;
        this.logToConsole(`Datenrate: ${selectedOption.text}`, 'info');
    }

    togglePasswordVisibility() {
        const passwordField = document.getElementById('password');
        const toggleBtn = document.getElementById('togglePassword');
        
        if (passwordField.type === 'password') {
            passwordField.type = 'text';
            toggleBtn.textContent = '👁️‍🗨️';
        } else {
            passwordField.type = 'password';
            toggleBtn.textContent = '👁️';
        }
    }

    async saveConfiguration() {
        this.showNotification('Speichere Konfiguration...', 'info');
        this.logToConsole('Saving configuration...', 'info');

        const config = {
            ssid: document.getElementById('ssid').value,
            password: document.getElementById('password').value,
            ap_ssid: document.getElementById('apSsid').value,
            ap_password: document.getElementById('apPassword').value,
            ap_open: document.getElementById('apOpen').checked,
            bridge_mode: document.getElementById('modeToggle').checked ? 1 : 0,
            nat_enable: document.getElementById('modeToggle').checked ? 0 : 1,
            tx_power: parseFloat(document.getElementById('txPower').value),
            dhcp_timeout: parseInt(document.getElementById('dhcpTimeout').value),
            channel: parseInt(document.getElementById('channel').value),
            data_rate: parseInt(document.getElementById('dataRate').value),
            napt_enable: document.getElementById('naptEnable')?.checked ? 1 : 0,
        };

        try {
            const response = await fetch('/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });

            if (response.ok) {
                this.showNotification('Konfiguration gespeichert!', 'success');
                this.logToConsole('Configuration saved successfully', 'success');
            } else {
                throw new Error('Save failed');
            }
        } catch (error) {
            this.showNotification('Fehler beim Speichern: ' + error.message, 'error');
            this.logToConsole('Save error: ' + error.message, 'error');
        }
    }

    async rebootDevice() {
        if (confirm('Gerät wirklich neu starten?')) {
            this.showNotification('Neustart wird eingeleitet...', 'warning');
            this.logToConsole('Rebooting device...', 'warning');

            try {
                await fetch('/api/reboot', { method: 'POST' });
                setTimeout(() => {
                    this.showNotification('Gerät neu gestartet. Verbindung wird wiederhergestellt...', 'info');
                    this.checkConnectionStatus();
                }, 2000);
            } catch (error) {
                this.logToConsole('Reboot error: ' + error.message, 'error');
            }
        }
    }

    async resetToDefault() {
        if (confirm('Alle Einstellungen auf Standard zurücksetzen?')) {
            this.showNotification('Reset auf Standard...', 'warning');
            this.logToConsole('Resetting to defaults...', 'warning');

            try {
                const response = await fetch('/api/reset', { method: 'POST' });
                if (response.ok) {
                    this.showNotification('Reset erfolgreich! Neustart...', 'success');
                    this.logToConsole('Reset successful', 'success');
                    setTimeout(() => location.reload(), 3000);
                }
            } catch (error) {
                this.logToConsole('Reset error: ' + error.message, 'error');
            }
        }
    }

    async loadConfiguration() {
        try {
            const response = await fetch('/api/config');
            if (response.ok) {
                const config = await response.json();
                this.applyConfiguration(config);
                this.logToConsole('Configuration loaded', 'success');
            }
        } catch (error) {
            this.logToConsole('Config load error: ' + error.message, 'error');
        }
    }

    applyConfiguration(config) {
        document.getElementById('ssid').value = config.ssid || '';
        document.getElementById('password').value = config.password || '';
        document.getElementById('apSsid').value = config.ap_ssid || 'ESP8266';
        document.getElementById('apPassword').value = config.ap_password || '';
        document.getElementById('apOpen').checked = config.ap_open === 1;
        document.getElementById('modeToggle').checked = config.bridge_mode === 1;
        document.getElementById('txPower').value = config.tx_power || 20.5;
        document.getElementById('dhcpTimeout').value = config.dhcp_timeout || 60;
        document.getElementById('channel').value = config.channel || 0;
        document.getElementById('dataRate').value = config.data_rate || 54;
        
        if (document.getElementById('naptEnable')) {
            document.getElementById('naptEnable').checked = config.napt_enable === 1;
        }

        // Update displays
        document.getElementById('txPowerValue').textContent = `${config.tx_power || 20.5} dBm`;
        document.getElementById('dhcpTimeoutValue').textContent = `${config.dhcp_timeout || 60} Sekunden`;
        
        this.switchMode(config.bridge_mode === 1 ? 'bridge' : 'nat');
        this.updateNaptVisibility();
    }

    async startStatusUpdate() {
        this.updateStatus();
        this.updateInterval = setInterval(() => this.updateStatus(), 5000);
    }

    async updateStatus() {
        try {
            const response = await fetch('/api/status');
            if (response.ok) {
                const status = await response.json();
                this.updateStatusDisplay(status);
            }
        } catch (error) {
            if (this.isConnected) {
                this.logToConsole('Status update failed', 'error');
            }
        }
    }

    updateStatusDisplay(status) {
        // Connection Status
        const isConnected = status.sta_connected === 1;
        this.isConnected = isConnected;

        const statusDot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');

        if (isConnected) {
            statusDot.classList.add('connected');
            statusText.textContent = 'Verbunden';
        } else {
            statusDot.classList.remove('connected');
            statusText.textContent = 'Nicht verbunden';
        }

        // Firmware Version
        document.getElementById('firmwareVersion').textContent = status.version || '1.8.7-bridge';

        // MAC Addresses
        document.getElementById('macSta').textContent = status.mac_sta || '--:--:--:--:--:--';
        document.getElementById('macAp').textContent = status.mac_ap || '--:--:--:--:--:--';

        // IP Addresses
        document.getElementById('ipSta').textContent = status.ip_sta || 'Nicht verbunden';
        document.getElementById('ipAp').textContent = status.ip_ap || '192.168.4.1';

        // Connection Status
        const connStatus = isConnected ? '✓ Verbunden' : '✗ Nicht verbunden';
        document.getElementById('connectionStatus').textContent = connStatus;
    }

    async sendConsoleCommand() {
        const input = document.getElementById('consoleInput');
        const command = input.value.trim();

        if (!command) return;

        this.logToConsole(`> ${command}`, 'info');
        input.value = '';

        try {
            const response = await fetch('/api/cmd', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cmd: command })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.response) {
                    this.logToConsole(data.response, 'success');
                }
            }
        } catch (error) {
            this.logToConsole('Command error: ' + error.message, 'error');
        }
    }

    logToConsole(message, type = 'info') {
        const console = document.getElementById('console');
        const line = document.createElement('div');
        line.className = `console-line ${type}`;
        line.textContent = `[${this.getTimestamp()}] ${message}`;
        console.appendChild(line);
        console.scrollTop = console.scrollHeight;

        if (this.debugMode) {
            console.log(`[${type}] ${message}`);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.display = 'block';

        setTimeout(() => {
            notification.style.display = 'none';
        }, 4000);
    }

    checkConnectionStatus() {
        const statusCheck = setInterval(() => {
            fetch('/api/status')
                .then(r => {
                    if (r.ok) {
                        clearInterval(statusCheck);
                        this.showNotification('Verbindung wiederhergestellt!', 'success');
                        location.reload();
                    }
                })
                .catch(() => {
                    // Still trying to reconnect
                });
        }, 1000);

        setTimeout(() => clearInterval(statusCheck), 30000);
    }

    getTimestamp() {
        const now = new Date();
        return now.toLocaleTimeString('de-DE', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new WiFiRepeaterApp();
});

// Global Debug Functions
function toggleDebug() {
    if (window.app) {
        window.app.debugMode = !window.app.debugMode;
        window.app.showNotification(
            `Debug Mode: ${window.app.debugMode ? 'ON' : 'OFF'}`,
            'info'
        );
    }
}

function showAbout() {
    alert(
        'ESP8266 WiFi Repeater\n' +
        'Firmware 1.8.7 mit Bridge Mode\n\n' +
        '© 2024 - Bridge Mode Implementierung\n' +
        'GitHub: Joob1965/esp_wifi_repeater\n\n' +
        'Features:\n' +
        '• Layer 2 Bridge Mode\n' +
        '• NAT/NAPT Router Mode\n' +
        '• Feineinstellungen (Tuning)\n' +
        '• Dunkles Modern Design\n' +
        '• Responsive Web Interface'
    );
}
