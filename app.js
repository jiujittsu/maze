// Инициализация TonConnect
const connector = new TonConnect.TonConnect({
    manifestUrl: 'http://localhost:5500/tonconnect-manifest.json'
});

// Элементы интерфейса
const connectBtn = document.getElementById('connect-btn');
const walletInfo = document.getElementById('wallet-info');
const sendTxBtn = document.getElementById('send-tx-btn');

// Проверка подключения при загрузке
async function init() {
    if (connector.connected) {
        updateWalletInfo(connector.account);
        sendTxBtn.disabled = false;
    }
    
    // Отслеживаем изменения статуса кошелька
    connector.onStatusChange((wallet) => {
        if (wallet) {
            updateWalletInfo(wallet);
            sendTxBtn.disabled = false;
        } else {
            walletInfo.innerHTML = 'Wallet disconnected';
            sendTxBtn.disabled = true;
        }
    });
}

// Обновляем информацию о кошельке
function updateWalletInfo(wallet) {
    walletInfo.innerHTML = `
        <p><strong>Wallet:</strong> ${wallet.device.appName}</p>
        <p><strong>Address:</strong> ${shortAddress(wallet.address)}</p>
        <p><strong>Network:</strong> ${wallet.chain}</p>
    `;
}

// Сокращение адреса
function shortAddress(address) {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

// Подключение кошелька
connectBtn.addEventListener('click', async () => {
    try {
        const wallets = await connector.getWallets();
        const wallet = wallets.find(w => w.appName === 'Tonkeeper') || wallets[0];
        
        await connector.connect({ jsBridgeKey: 'tonconnect' }, wallet);
    } catch (error) {
        console.error('Connection error:', error);
        walletInfo.innerHTML = 'Error: ' + error.message;
    }
});

// Отправка транзакции
sendTxBtn.addEventListener('click', async () => {
    const tx = {
        validUntil: Math.floor(Date.now() / 1000) + 300, // 5 минут
        messages: [
            {
                address: "EQABC123...", // Замените на реальный адрес получателя
                amount: "100000000", // 0.1 TON (в наноТОН)
                payload: "Payment for order #123" // Комментарий
            }
        ]
    };

    try {
        const result = await connector.sendTransaction(tx);
        console.log('Transaction sent:', result);
        walletInfo.innerHTML += '<p style="color: green;">Payment successful!</p>';
    } catch (error) {
        console.error('Transaction error:', error);
        walletInfo.innerHTML += '<p style="color: red;">Payment failed: ' + error.message + '</p>';
    }
});

// Инициализация при загрузке
window.onload = init;